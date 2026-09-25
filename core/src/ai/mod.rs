//! IA. De moment una heurística honesta; l'ISMCTS de la §4 arriba a la fase F1.

use crate::cards::Card;
use crate::state::{HandState, Seat};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Level {
    Aprenent,
    Casal,
}

/// Tria una carta entre les legals.
///
/// Heurística de partida: si pot guanyar la basa i hi ha punts a sobre la taula,
/// mata amb la carta més justa; si no, es desprèn de la més barata.
pub fn choose_card(state: &HandState, seat: Seat, _level: Level) -> Option<Card> {
    let legals = state.legal();
    if legals.is_empty() {
        return None;
    }
    let trump = state.trump();
    let winning = state.trick.winning_play(trump);

    let guanyaria = |c: Card| match (winning, state.trick.led_suit()) {
        (Some(w), Some(led)) => crate::trick::beats(c, w.card, led, trump),
        _ => true, // surt ell
    };

    let en_joc = state.trick.card_points();
    let mut guanyadores: Vec<Card> = legals.iter().copied().filter(|&c| guanyaria(c)).collect();

    if !guanyadores.is_empty() && (en_joc > 0 || state.trick.is_empty()) {
        // La més justa que serveixi.
        guanyadores.sort_by_key(|c| c.strength());
        return guanyadores.first().copied();
    }

    // No val la pena: la més barata, prioritzant no regalar punts.
    let mut resta = legals;
    resta.sort_by_key(|c| (c.points(), c.strength()));
    resta.first().copied()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bid::Bid;
    use crate::cards::Suit;
    use crate::state::HandPhase;

    #[test]
    fn la_ia_acaba_una_ma_sencera_sense_jugades_illegals() {
        let mut st = HandState::new(77, 0);
        st.bid(0, Bid::Suit { suit: Suit::Espases }).unwrap();
        st.pass_doubling().unwrap();

        while st.phase == HandPhase::Playing {
            let seat = st.turn;
            let card = choose_card(&st, seat, Level::Casal).expect("hi ha jugada");
            st.play(seat, card).expect("la IA no fa jugades il·legals");
        }
        assert_eq!(st.result.unwrap().points.iter().sum::<u32>(), 72);
    }
}
