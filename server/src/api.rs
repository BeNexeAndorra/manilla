use axum::extract::State;
use axum::Json;
use axum_extra::extract::CookieJar;
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::auth::{self, Sessio};
use crate::error::{Error, Resultat};
use crate::Estat;

/* ───────────────────────────── fitxa i sessió ─────────────────────────── */

#[derive(Serialize)]
pub struct Fitxa {
    pub id: Uuid,
    pub correu: String,
    pub nom: String,
    pub inicial: String,
    pub lema: String,
    pub color: String,
    #[serde(rename = "avatarUrl")]
    pub avatar_url: Option<String>,
    pub creat: DateTime<Utc>,
    /// Si té contrasenya pròpia; si no, només hi entra amb Google.
    #[serde(rename = "teContrasenya")]
    pub te_contrasenya: bool,
}

async fn carrega_fitxa(estat: &Estat, id: Uuid) -> Resultat<Fitxa> {
    let f: Option<(Uuid, String, String, String, String, Option<String>, DateTime<Utc>, Option<String>)> =
        sqlx::query_as(
            "select id, correu, nom, lema, color, avatar_url, creat, contrasenya
             from usuaris where id = $1",
        )
        .bind(id)
        .fetch_optional(&estat.bd)
        .await?;

    let (id, correu, nom, lema, color, avatar_url, creat, contrasenya) = f.ok_or(Error::NoTrobat)?;
    Ok(Fitxa {
        inicial: inicial(&nom),
        id, correu, nom, lema, color, avatar_url, creat,
        te_contrasenya: contrasenya.is_some(),
    })
}

fn inicial(nom: &str) -> String {
    nom.chars().next().map(|c| c.to_uppercase().to_string()).unwrap_or_else(|| "?".into())
}

/* ───────────────────────────── comprovacions ──────────────────────────── */

fn neteja_nom(nom: &str) -> Resultat<String> {
    let n = nom.trim();
    if n.chars().count() < 2 {
        return Err(Error::Peticio("El nom ha de tenir com a mínim dues lletres.".into()));
    }
    Ok(n.chars().take(14).collect())
}

fn neteja_correu(correu: &str) -> Resultat<String> {
    let c = correu.trim();
    // Comprovació mínima i honesta: qui ho validi de debò és el correu de confirmació.
    let be = c.len() >= 5 && c.matches('@').count() == 1
        && c.split('@').nth(1).is_some_and(|d| d.contains('.') && !d.starts_with('.') && !d.ends_with('.'));
    if !be {
        return Err(Error::Peticio("Aquest correu no té bona pinta.".into()));
    }
    Ok(c.to_string())
}

fn comprova_contrasenya(c: &str) -> Resultat<()> {
    if c.chars().count() < 8 {
        return Err(Error::Peticio("La contrasenya ha de tenir com a mínim 8 caràcters.".into()));
    }
    if c.chars().count() > 200 {
        return Err(Error::Peticio("La contrasenya és massa llarga.".into()));
    }
    Ok(())
}

/* ──────────────────────────────── rutes ───────────────────────────────── */

/// Què sap fer aquest servidor. El front-end ho consulta per saber si ha de
/// mostrar el botó de Google o no: val més amagar-lo que ensenyar-lo trencat.
pub async fn config(State(estat): State<Estat>) -> Json<Value> {
    Json(json!({ "google": estat.google.is_some() }))
}

#[derive(Deserialize)]
pub struct Registre {
    pub correu: String,
    pub nom: String,
    pub contrasenya: String,
}

pub async fn registre(
    State(estat): State<Estat>,
    pot: CookieJar,
    Json(d): Json<Registre>,
) -> Resultat<(CookieJar, Json<Value>)> {
    let correu = neteja_correu(&d.correu)?;
    let nom = neteja_nom(&d.nom)?;
    comprova_contrasenya(&d.contrasenya)?;

    let ja: Option<(Uuid,)> = sqlx::query_as("select id from usuaris where lower(correu) = lower($1)")
        .bind(&correu)
        .fetch_optional(&estat.bd)
        .await?;
    if ja.is_some() {
        return Err(Error::Conflicte("Ja hi ha un compte amb aquest correu.".into()));
    }

    let hash = auth::xifra(&d.contrasenya)?;
    let (id,): (Uuid,) = sqlx::query_as(
        "insert into usuaris (correu, nom, contrasenya) values ($1, $2, $3) returning id",
    )
    .bind(&correu).bind(&nom).bind(&hash)
    .fetch_one(&estat.bd)
    .await?;

    let galeta = auth::obre_sessio(&estat, id).await?;
    let fitxa = carrega_fitxa(&estat, id).await?;
    Ok((pot.add(galeta), Json(json!({ "fitxa": fitxa }))))
}

#[derive(Deserialize)]
pub struct Entrada {
    pub correu: String,
    pub contrasenya: String,
}

pub async fn entra(
    State(estat): State<Estat>,
    pot: CookieJar,
    Json(d): Json<Entrada>,
) -> Resultat<(CookieJar, Json<Value>)> {
    let fila: Option<(Uuid, Option<String>)> =
        sqlx::query_as("select id, contrasenya from usuaris where lower(correu) = lower($1)")
            .bind(d.correu.trim())
            .fetch_optional(&estat.bd)
            .await?;

    // Mateix missatge tant si el correu no existeix com si la contrasenya falla:
    // si no, l'error diu quins correus tenen compte.
    let dolent = || Error::Peticio("El correu o la contrasenya no són bons.".into());

    let (id, hash) = fila.ok_or_else(dolent)?;
    let hash = hash.ok_or_else(|| Error::Peticio(
        "Aquest compte entra amb Google. Fes servir el botó de Google.".into()))?;
    if !auth::comprova(&d.contrasenya, &hash) {
        return Err(dolent());
    }

    sqlx::query("update usuaris set vist = now() where id = $1").bind(id).execute(&estat.bd).await?;
    let galeta = auth::obre_sessio(&estat, id).await?;
    let fitxa = carrega_fitxa(&estat, id).await?;
    Ok((pot.add(galeta), Json(json!({ "fitxa": fitxa }))))
}

pub async fn surt(
    State(estat): State<Estat>,
    pot: CookieJar,
    sessio: Sessio,
) -> Resultat<(CookieJar, Json<Value>)> {
    auth::tanca_sessio(&estat, &sessio.token).await?;
    let buida = auth::galeta(String::new(), estat.cookie_secure, Duration::seconds(0));
    Ok((pot.add(buida), Json(json!({ "ok": true }))))
}

pub async fn jo(State(estat): State<Estat>, sessio: Sessio) -> Resultat<Json<Value>> {
    let fitxa = carrega_fitxa(&estat, sessio.usuari).await?;
    let ajustos: Option<(sqlx::types::Json<Value>,)> =
        sqlx::query_as("select dades from ajustos where usuari = $1")
            .bind(sessio.usuari)
            .fetch_optional(&estat.bd)
            .await?;
    let estadistiques = estadistiques(&estat, sessio.usuari).await?;
    Ok(Json(json!({
        "fitxa": fitxa,
        "ajustos": ajustos.map(|a| a.0.0),
        "estadistiques": estadistiques,
    })))
}

#[derive(Deserialize)]
pub struct CanviFitxa {
    pub nom: String,
    #[serde(default)]
    pub lema: String,
    #[serde(default)]
    pub color: Option<String>,
}

pub async fn desa_fitxa(
    State(estat): State<Estat>,
    sessio: Sessio,
    Json(d): Json<CanviFitxa>,
) -> Resultat<Json<Value>> {
    let nom = neteja_nom(&d.nom)?;
    let lema: String = d.lema.trim().chars().take(60).collect();
    let color = d.color.unwrap_or_else(|| "ok".into());
    sqlx::query("update usuaris set nom = $1, lema = $2, color = $3 where id = $4")
        .bind(&nom).bind(&lema).bind(&color).bind(sessio.usuari)
        .execute(&estat.bd)
        .await?;
    Ok(Json(json!({ "fitxa": carrega_fitxa(&estat, sessio.usuari).await? })))
}

pub async fn desa_ajustos(
    State(estat): State<Estat>,
    sessio: Sessio,
    Json(d): Json<Value>,
) -> Resultat<Json<Value>> {
    sqlx::query(
        "insert into ajustos (usuari, dades) values ($1, $2)
         on conflict (usuari) do update set dades = excluded.dades",
    )
    .bind(sessio.usuari)
    .bind(sqlx::types::Json(&d))
    .execute(&estat.bd)
    .await?;
    Ok(Json(json!({ "ok": true })))
}

#[derive(Deserialize)]
pub struct NovaPartida {
    pub nos: i32,
    pub ells: i32,
    pub mans: i32,
    pub guanyada: bool,
    pub nivell: i16,
    pub objectiu: i32,
    #[serde(rename = "mansGuanyades", default)]
    pub mans_guanyades: i32,
    #[serde(rename = "millorMa", default)]
    pub millor_ma: i32,
}

pub async fn desa_partida(
    State(estat): State<Estat>,
    sessio: Sessio,
    Json(d): Json<NovaPartida>,
) -> Resultat<Json<Value>> {
    sqlx::query(
        "insert into partides
           (usuari, nos, ells, mans, guanyada, nivell, objectiu, mans_guanyades, millor_ma)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    )
    .bind(sessio.usuari).bind(d.nos).bind(d.ells).bind(d.mans).bind(d.guanyada)
    .bind(d.nivell).bind(d.objectiu).bind(d.mans_guanyades).bind(d.millor_ma)
    .execute(&estat.bd)
    .await?;
    Ok(Json(json!({ "estadistiques": estadistiques(&estat, sessio.usuari).await? })))
}

#[derive(Serialize, sqlx::FromRow)]
pub struct FilaPartida {
    pub id: Uuid,
    pub data: DateTime<Utc>,
    pub nos: i32,
    pub ells: i32,
    pub mans: i32,
    pub guanyada: bool,
    pub nivell: i16,
    pub objectiu: i32,
}

pub async fn partides(State(estat): State<Estat>, sessio: Sessio) -> Resultat<Json<Value>> {
    let files: Vec<FilaPartida> = sqlx::query_as(
        "select id, data, nos, ells, mans, guanyada, nivell, objectiu
         from partides where usuari = $1 order by data desc limit 50",
    )
    .bind(sessio.usuari)
    .fetch_all(&estat.bd)
    .await?;
    Ok(Json(json!({ "historial": files })))
}

async fn estadistiques(estat: &Estat, usuari: Uuid) -> Resultat<Value> {
    let f: (i64, i64, i64, i64, i64, i64, i64) = sqlx::query_as(
        "select
           count(*),
           coalesce(sum(case when guanyada then 1 else 0 end), 0),
           coalesce(sum(mans), 0),
           coalesce(sum(mans_guanyades), 0),
           coalesce(sum(nos), 0),
           coalesce(sum(ells), 0),
           coalesce(max(millor_ma), 0)
         from partides where usuari = $1",
    )
    .bind(usuari)
    .fetch_one(&estat.bd)
    .await?;

    Ok(json!({
        "partides": f.0, "guanyades": f.1, "mans": f.2, "mansGuanyades": f.3,
        "puntsAFavor": f.4, "puntsEnContra": f.5, "millorMa": f.6,
    }))
}
