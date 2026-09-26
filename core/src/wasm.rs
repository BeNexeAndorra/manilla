//! Pont cap al navegador. L'estat viatja com a JSON per no duplicar tipus.

use crate::ai::{choose_card, Level};
use crate::bid::Bid;
use crate::cards::{Card, Suit};
use crate::state::{HandPhase, HandState};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Taula {
    state: HandState,
    humans: Vec<u8>,
}

#[wasm_bindgen]
impl Taula {
    /// Una taula nova. `humans` són els seients que juga una persona.
    #[wasm_bindgen(constructor)]
    pub fn new(seed: f64, dealer: u8, humans: Vec<u8>) -> Taula {
        Taula { state: HandState::new(seed as u64, dealer), humans }
    }

    /// L'estat visible per a un seient, en JSON.
    pub fn view(&self, seat: u8) -> String {
        let legal: Vec<String> = if self.state.turn == seat {
            self.state.legal().iter().map(|c| c.code()).collect()
        } else {
            Vec::new()
        };
        let v = serde_json::json!({
            "phase": self.state.phase,
            "turn": self.state.turn,
            "dealer": self.state.dealer,
            "hand": self.state.hands[seat as usize].iter().map(|c| c.code()).collect::<Vec<_>>(),
            "counts": self.state.hands.iter().map(|h| h.len()).collect::<Vec<_>>(),
            "trick": self.state.trick.plays.iter()
                .map(|p| serde_json::json!({ "seat": p.seat, "card": p.card.code() }))
                .collect::<Vec<_>>(),
            "trump": self.state.trump().map(|s| format!("{s:?}").to_lowercase()),
            "contract": self.state.contract,
            "legal": legal,
            "tricksPlayed": self.state.tricks.len(),
            // Bases ja tancades, per a l'historial i l'anàlisi (§7.4).
            "tricks": self.state.tricks.iter().map(|t| serde_json::json!({
                "plays": t.plays.iter()
                    .map(|p| serde_json::json!({ "seat": p.seat, "card": p.card.code() }))
                    .collect::<Vec<_>>(),
                "winner": t.winner(self.state.trump()),
            })).collect::<Vec<_>>(),
            "result": self.state.result,
            "mayDouble": self.state.may_double,
        });
        v.to_string()
    }

    pub fn canta(&mut self, seat: u8, what: &str) -> bool {
        let bid = match what {
            "oros" => Bid::Suit { suit: Suit::Oros },
            "copes" => Bid::Suit { suit: Suit::Copes },
            "espases" => Bid::Suit { suit: Suit::Espases },
            "bastos" => Bid::Suit { suit: Suit::Bastos },
            "botifarra" => Bid::Botifarra,
            "delegar" => Bid::Delegate,
            _ => return false,
        };
        self.state.bid(seat, bid).is_ok()
    }

    pub fn contra(&mut self, seat: u8) -> bool {
        self.state.double(seat).is_ok()
    }

    pub fn comenca(&mut self) -> bool {
        self.state.pass_doubling().is_ok()
    }

    pub fn juga(&mut self, seat: u8, code: &str) -> bool {
        match parse_code(code) {
            Some(card) => self.state.play(seat, card).is_ok(),
            None => false,
        }
    }

    /// Fa jugar els bots fins que torni a tocar a una persona.
    /// Retorna quantes jugades ha fet, perquè la interfície pugui animar-les.
    pub fn juga_bots(&mut self, level: u8) -> u32 {
        let mut fetes = 0;
        while self.state.phase == HandPhase::Playing
            && !self.humans.contains(&self.state.turn)
        {
            let seat = self.state.turn;
            let Some(card) = choose_card(&self.state, seat, Level::from_u8(level)) else { break };
            if self.state.play(seat, card).is_err() {
                break;
            }
            fetes += 1;
        }
        fetes
    }

    /// Canta per un bot si li toca. Retorna el que ha cantat, o buit.
    pub fn canta_bot(&mut self) -> String {
        if self.humans.contains(&self.state.turn) {
            return String::new();
        }
        let seat = self.state.turn;
        let hand = &self.state.hands[seat as usize];
        // Heurística de partida: el pal amb més força acumulada.
        let mut millor = Suit::Oros;
        let mut punts = 0u32;
        for s in Suit::ALL {
            let p: u32 = hand.iter().filter(|c| c.suit == s)
                .map(|c| c.points() + c.strength() as u32 / 4).sum();
            if p > punts {
                punts = p;
                millor = s;
            }
        }
        let nom = format!("{millor:?}").to_lowercase();
        if self.canta(seat, &nom) { nom } else { String::new() }
    }
}

fn parse_code(code: &str) -> Option<Card> {
    let (num, pal) = code.split_at(code.len().checked_sub(1)?);
    let rank: u8 = num.parse().ok()?;
    let suit = match pal {
        "o" => Suit::Oros,
        "c" => Suit::Copes,
        "e" => Suit::Espases,
        "b" => Suit::Bastos,
        _ => return None,
    };
    Some(Card::new(suit, rank))
}
