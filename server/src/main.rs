//! Servidor de Manilla.
//!
//! Serveix el front-end compilat i l'API de comptes, fitxa i partides.
//! Tot en un sol procés: és el que després corre a Hetzner darrere d'un
//! proxy, i el que corre en local amb `docker compose up`.

mod api;
mod auth;
mod error;
mod google;

use anyhow::Context;
use axum::routing::{get, post, put};
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::net::SocketAddr;
use tower_http::catch_panic::CatchPanicLayer;
use tower_http::compression::CompressionLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;

#[derive(Clone)]
pub struct Estat {
    pub bd: PgPool,
    pub cookie_secure: bool,
    pub google: Option<google::Config>,
    pub origen: String,
}

fn var(clau: &str) -> Option<String> {
    std::env::var(clau).ok().filter(|v| !v.trim().is_empty())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "manilla_server=info,tower_http=warn".into()),
        )
        .init();

    let url = var("DATABASE_URL").context("falta DATABASE_URL")?;
    let port: u16 = var("PORT").unwrap_or_else(|| "8080".into()).parse()?;
    let estatics = var("STATIC_DIR").unwrap_or_else(|| "web/dist".into());
    let origen = var("ORIGEN").unwrap_or_else(|| format!("http://localhost:{port}"));

    let bd = PgPoolOptions::new()
        .max_connections(10)
        .connect(&url)
        .await
        .context("no s'ha pogut connectar a la base de dades")?;

    sqlx::migrate!("./migrations")
        .run(&bd)
        .await
        .context("han fallat les migracions")?;
    tracing::info!("migracions al dia");

    let google = google::Config::des_de_entorn(&origen);
    match &google {
        Some(_) => tracing::info!("entrada amb Google activada"),
        None => tracing::info!(
            "entrada amb Google desactivada: falten GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET"
        ),
    }

    let estat = Estat {
        bd,
        cookie_secure: var("COOKIE_SECURE").as_deref() == Some("1"),
        google,
        origen,
    };

    let api = Router::new()
        .route("/config", get(api::config))
        .route("/registre", post(api::registre))
        .route("/entra", post(api::entra))
        .route("/surt", post(api::surt))
        .route("/jo", get(api::jo))
        .route("/fitxa", put(api::desa_fitxa))
        .route("/ajustos", put(api::desa_ajustos))
        .route("/partides", get(api::partides).post(api::desa_partida))
        .route("/auth/google", get(google::comenca))
        .route("/auth/google/retorn", get(google::retorn));

    // El front-end fa encaminament propi: qualsevol ruta desconeguda torna
    // l'index i que el navegador decideixi.
    let index = format!("{estatics}/index.html");
    let fitxers = ServeDir::new(&estatics).fallback(ServeFile::new(&index));

    let app = Router::new()
        .nest("/api", api)
        .fallback_service(fitxers)
        .layer(CompressionLayer::new())
        .layer(CatchPanicLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(estat);

    let adreca = SocketAddr::from(([0, 0, 0, 0], port));
    let oient = tokio::net::TcpListener::bind(adreca).await?;
    tracing::info!("Manilla escolta a http://localhost:{port}");

    axum::serve(oient, app)
        .with_graceful_shutdown(atura())
        .await?;
    Ok(())
}

/// Tanca bé amb Ctrl-C o amb el SIGTERM que envia Docker.
async fn atura() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.ok(); };
    #[cfg(unix)]
    let term = async {
        use tokio::signal::unix::{signal, SignalKind};
        if let Ok(mut s) = signal(SignalKind::terminate()) {
            s.recv().await;
        }
    };
    #[cfg(not(unix))]
    let term = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {}
        _ = term => {}
    }
    tracing::info!("aturant");
}
