use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

/// Error de l'API. El missatge que arriba al client és sempre en català i
/// comprensible; el detall tècnic es queda al registre del servidor.
#[derive(Debug)]
pub enum Error {
    /// Dades dolentes de qui crida. Portem el text que veurà la persona.
    Peticio(String),
    /// Cal haver entrat.
    NoAutenticat,
    Conflicte(String),
    NoTrobat,
    /// Qualsevol cosa nostra. No en surt el detall.
    Intern(anyhow::Error),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (codi, text) = match self {
            Error::Peticio(t) => (StatusCode::BAD_REQUEST, t),
            Error::NoAutenticat => (StatusCode::UNAUTHORIZED, "Has d'entrar primer.".into()),
            Error::Conflicte(t) => (StatusCode::CONFLICT, t),
            Error::NoTrobat => (StatusCode::NOT_FOUND, "No s'ha trobat.".into()),
            Error::Intern(e) => {
                tracing::error!("error intern: {e:#}");
                (StatusCode::INTERNAL_SERVER_ERROR,
                 "Hi ha hagut un problema al servidor. Torna-ho a provar.".into())
            }
        };
        (codi, Json(json!({ "error": text }))).into_response()
    }
}

impl<E: Into<anyhow::Error>> From<E> for Error {
    fn from(e: E) -> Self {
        Error::Intern(e.into())
    }
}

pub type Resultat<T> = std::result::Result<T, Error>;
