//! Nucli de la botifarra: regles, repartiment, comptatge i IA.
//!
//! Aquest crate no fa entrada ni sortida. És una funció pura de l'estat,
//! i es compila per a servidor, navegador (WASM) i Android (UniFFI).

#![forbid(unsafe_code)]

pub mod bid;
pub mod cards;
pub mod deal;
pub mod rules;
pub mod scoring;
pub mod state;
pub mod trick;

pub mod ai;

#[cfg(feature = "wasm")]
pub mod wasm;

pub use bid::{Bid, Contract, Doubling};
pub use cards::{full_deck, Card, Suit};
pub use rules::legal_moves;
pub use state::{HandPhase, HandState, Seat};
