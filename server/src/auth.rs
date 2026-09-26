use argon2::password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::Argon2;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::cookie::{Cookie, SameSite};
use base64::Engine;
use chrono::{Duration, Utc};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::error::{Error, Resultat};
use crate::Estat;

pub const GALETA: &str = "manilla_sessio";
const DIES: i64 = 60;

/// Xifra la contrasenya amb Argon2id. Mai es desa en clar, ni al registre.
pub fn xifra(contrasenya: &str) -> Resultat<String> {
    let sal = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(contrasenya.as_bytes(), &sal)
        .map(|h| h.to_string())
        .map_err(|e| Error::Intern(anyhow::anyhow!("no s'ha pogut xifrar: {e}")))
}

pub fn comprova(contrasenya: &str, hash: &str) -> bool {
    match PasswordHash::new(hash) {
        Ok(h) => Argon2::default().verify_password(contrasenya.as_bytes(), &h).is_ok(),
        Err(_) => false,
    }
}

fn aleatori() -> String {
    use rand::RngCore;
    let mut b = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut b);
    base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(b)
}

/// A la base de dades hi guardem l'empremta, no el testimoni: si algú llegeix
/// la taula, no pot suplantar ningú.
fn empremta(token: &str) -> String {
    base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(Sha256::digest(token.as_bytes()))
}

/// Obre sessió i retorna la galeta que cal enviar.
pub async fn obre_sessio(estat: &Estat, usuari: Uuid) -> Resultat<Cookie<'static>> {
    let token = aleatori();
    sqlx::query("insert into sessions (token, usuari, caduca) values ($1, $2, $3)")
        .bind(empremta(&token))
        .bind(usuari)
        .bind(Utc::now() + Duration::days(DIES))
        .execute(&estat.bd)
        .await?;
    Ok(galeta(token, estat.cookie_secure, Duration::days(DIES)))
}

pub async fn tanca_sessio(estat: &Estat, token: &str) -> Resultat<()> {
    sqlx::query("delete from sessions where token = $1")
        .bind(empremta(token))
        .execute(&estat.bd)
        .await?;
    Ok(())
}

pub fn galeta(valor: String, segura: bool, durada: Duration) -> Cookie<'static> {
    let mut c = Cookie::new(GALETA, valor);
    c.set_http_only(true);
    c.set_same_site(SameSite::Lax);
    c.set_secure(segura);
    c.set_path("/");
    c.set_max_age(time::Duration::seconds(durada.num_seconds()));
    c
}

/// Qui fa la petició. S'extreu de la galeta de sessió.
pub struct Sessio {
    pub usuari: Uuid,
    pub token: String,
}

impl FromRequestParts<Estat> for Sessio {
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, estat: &Estat) -> Result<Self, Self::Rejection> {
        use axum_extra::extract::CookieJar;
        let pot = CookieJar::from_headers(&parts.headers);
        let token = pot.get(GALETA).map(|c| c.value().to_string()).ok_or(Error::NoAutenticat)?;

        let fila: Option<(Uuid,)> = sqlx::query_as(
            "select usuari from sessions where token = $1 and caduca > now()",
        )
        .bind(empremta(&token))
        .fetch_optional(&estat.bd)
        .await?;

        let (usuari,) = fila.ok_or(Error::NoAutenticat)?;
        Ok(Sessio { usuari, token })
    }
}
