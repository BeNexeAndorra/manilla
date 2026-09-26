//! Entrada amb Google, amb el flux de codi d'autorització (OAuth 2.0 / OIDC).
//!
//! Sobre la signatura del token: el codi s'intercanvia contra l'extrem de
//! testimonis de Google, per TLS i amb el nostre secret de client. El token
//! arriba, doncs, directament de Google per un canal autenticat, i la mateixa
//! documentació de Google diu que en aquest cas no cal verificar-ne la
//! signatura. El que sí que comprovem és `aud`, `iss` i `exp`.

use axum::extract::{Query, State};
use axum::response::{IntoResponse, Redirect, Response};
use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::CookieJar;
use base64::Engine;
use chrono::Duration;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::auth;
use crate::error::{Error, Resultat};
use crate::Estat;

const GALETA_ESTAT: &str = "manilla_oauth";
const AUTORITZA: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const TESTIMONI: &str = "https://oauth2.googleapis.com/token";

#[derive(Clone)]
pub struct Config {
    pub client_id: String,
    pub client_secret: String,
    pub retorn: String,
}

impl Config {
    pub fn des_de_entorn(origen: &str) -> Option<Config> {
        let id = std::env::var("GOOGLE_CLIENT_ID").ok().filter(|v| !v.trim().is_empty())?;
        let secret = std::env::var("GOOGLE_CLIENT_SECRET").ok().filter(|v| !v.trim().is_empty())?;
        Some(Config {
            client_id: id,
            client_secret: secret,
            retorn: format!("{origen}/api/auth/google/retorn"),
        })
    }
}

fn aleatori() -> String {
    use rand::RngCore;
    let mut b = [0u8; 24];
    rand::thread_rng().fill_bytes(&mut b);
    base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(b)
}

/// Comença: desa un estat curt a una galeta i envia la persona cap a Google.
pub async fn comenca(State(estat): State<Estat>, pot: CookieJar) -> Resultat<Response> {
    let Some(g) = estat.google.as_ref() else {
        return Err(Error::Peticio("L'entrada amb Google no està configurada en aquest servidor.".into()));
    };
    let anti_falsificacio = aleatori();
    let e = urlencoding::encode(&anti_falsificacio);
    let url = format!(
        "{AUTORITZA}?client_id={}&redirect_uri={}&response_type=code&scope={}&state={e}&access_type=online&prompt=select_account",
        urlencoding::encode(&g.client_id),
        urlencoding::encode(&g.retorn),
        urlencoding::encode("openid email profile"),
    );

    let mut c = Cookie::new(GALETA_ESTAT, anti_falsificacio);
    c.set_http_only(true);
    c.set_same_site(SameSite::Lax);
    c.set_secure(estat.cookie_secure);
    c.set_path("/");
    c.set_max_age(time::Duration::minutes(10));

    Ok((pot.add(c), Redirect::to(&url)).into_response())
}

#[derive(Deserialize)]
pub struct Retorn {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

pub async fn retorn(
    State(estat): State<Estat>,
    pot: CookieJar,
    Query(q): Query<Retorn>,
) -> Resultat<Response> {
    let Some(g) = estat.google.as_ref() else {
        return Err(Error::Peticio("L'entrada amb Google no està configurada.".into()));
    };
    if let Some(e) = q.error {
        tracing::info!("Google ha tornat un error: {e}");
        return Ok(Redirect::to("/?google=cancellat").into_response());
    }

    // L'estat ha de coincidir amb el que vam desar: és el que evita que algú
    // ens faci entrar amb un codi seu.
    let desat = pot.get(GALETA_ESTAT).map(|c| c.value().to_string());
    match (&desat, &q.state) {
        (Some(a), Some(b)) if a == b => {}
        _ => return Err(Error::Peticio("La sessió d'entrada ha caducat. Torna-ho a provar.".into())),
    }
    let codi = q.code.ok_or_else(|| Error::Peticio("Google no ha tornat cap codi.".into()))?;

    let client = reqwest::Client::new();
    let resposta = client
        .post(TESTIMONI)
        .form(&[
            ("code", codi.as_str()),
            ("client_id", g.client_id.as_str()),
            ("client_secret", g.client_secret.as_str()),
            ("redirect_uri", g.retorn.as_str()),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|e| Error::Intern(anyhow::anyhow!("no s'ha pogut parlar amb Google: {e}")))?;

    if !resposta.status().is_success() {
        let detall = resposta.text().await.unwrap_or_default();
        return Err(Error::Intern(anyhow::anyhow!("Google ha rebutjat el codi: {detall}")));
    }

    let cos: Value = resposta.json().await
        .map_err(|e| Error::Intern(anyhow::anyhow!("resposta de Google il·legible: {e}")))?;
    let id_token = cos.get("id_token").and_then(|v| v.as_str())
        .ok_or_else(|| Error::Intern(anyhow::anyhow!("Google no ha enviat id_token")))?;

    let dades = llegeix_token(id_token, &g.client_id)?;
    let usuari = enllaça(&estat, &dades).await?;

    let sessio = auth::obre_sessio(&estat, usuari).await?;
    let buida = {
        let mut c = Cookie::new(GALETA_ESTAT, "");
        c.set_path("/");
        c.set_max_age(time::Duration::seconds(0));
        c
    };
    let _ = Duration::seconds(0);
    Ok((pot.add(sessio).add(buida), Redirect::to("/")).into_response())
}

struct Identitat {
    subjecte: String,
    correu: String,
    nom: String,
    foto: Option<String>,
}

fn llegeix_token(token: &str, client_id: &str) -> Resultat<Identitat> {
    let cos = token.split('.').nth(1)
        .ok_or_else(|| Error::Intern(anyhow::anyhow!("id_token mal format")))?;
    let cru = base64::engine::general_purpose::URL_SAFE_NO_PAD.decode(cos)
        .map_err(|e| Error::Intern(anyhow::anyhow!("id_token il·legible: {e}")))?;
    let v: Value = serde_json::from_slice(&cru)
        .map_err(|e| Error::Intern(anyhow::anyhow!("id_token no és JSON: {e}")))?;

    let aud = v.get("aud").and_then(|x| x.as_str()).unwrap_or_default();
    if aud != client_id {
        return Err(Error::Intern(anyhow::anyhow!("el token no és per a aquesta aplicació")));
    }
    let iss = v.get("iss").and_then(|x| x.as_str()).unwrap_or_default();
    if iss != "accounts.google.com" && iss != "https://accounts.google.com" {
        return Err(Error::Intern(anyhow::anyhow!("emissor inesperat: {iss}")));
    }
    let exp = v.get("exp").and_then(|x| x.as_i64()).unwrap_or(0);
    if exp <= chrono::Utc::now().timestamp() {
        return Err(Error::Peticio("El testimoni de Google ha caducat. Torna-ho a provar.".into()));
    }
    if v.get("email_verified").and_then(|x| x.as_bool()) == Some(false) {
        return Err(Error::Peticio("Aquest correu de Google no està verificat.".into()));
    }

    let subjecte = v.get("sub").and_then(|x| x.as_str())
        .ok_or_else(|| Error::Intern(anyhow::anyhow!("falta el sub")))?.to_string();
    let correu = v.get("email").and_then(|x| x.as_str()).unwrap_or_default().to_string();
    let nom = v.get("name").and_then(|x| x.as_str())
        .or_else(|| v.get("given_name").and_then(|x| x.as_str()))
        .unwrap_or("Jugador").to_string();
    let foto = v.get("picture").and_then(|x| x.as_str()).map(|s| s.to_string());

    Ok(Identitat { subjecte, correu, nom, foto })
}

/// Troba el compte o el crea. Si el correu ja existeix amb contrasenya, s'hi
/// enllaça la identitat de Google en comptes de fer-ne un de duplicat.
async fn enllaça(estat: &Estat, d: &Identitat) -> Resultat<Uuid> {
    if let Some((id,)) = sqlx::query_as::<_, (Uuid,)>(
        "select usuari from identitats where proveidor = 'google' and subjecte = $1",
    )
    .bind(&d.subjecte)
    .fetch_optional(&estat.bd)
    .await?
    {
        sqlx::query("update usuaris set vist = now() where id = $1").bind(id).execute(&estat.bd).await?;
        return Ok(id);
    }

    let existent: Option<(Uuid,)> = if d.correu.is_empty() {
        None
    } else {
        sqlx::query_as("select id from usuaris where lower(correu) = lower($1)")
            .bind(&d.correu)
            .fetch_optional(&estat.bd)
            .await?
    };

    let id = match existent {
        Some((id,)) => id,
        None => {
            let nom: String = d.nom.trim().chars().take(14).collect();
            let (id,): (Uuid,) = sqlx::query_as(
                "insert into usuaris (correu, nom, contrasenya, avatar_url)
                 values ($1, $2, null, $3) returning id",
            )
            .bind(&d.correu).bind(&nom).bind(&d.foto)
            .fetch_one(&estat.bd)
            .await?;
            id
        }
    };

    sqlx::query(
        "insert into identitats (proveidor, subjecte, usuari) values ('google', $1, $2)
         on conflict do nothing",
    )
    .bind(&d.subjecte).bind(id)
    .execute(&estat.bd)
    .await?;

    Ok(id)
}
