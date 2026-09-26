//! IA. De moment una heurística honesta; l'ISMCTS de la §4 arriba a la fase F1.

use crate::cards::Card;
use crate::state::{HandState, Seat};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Level {
    /// Juga legal però sense pla: no busca la basa ni estalvia punts.
    Aprenent,
    /// Heurística de partida: mata just quan hi ha punts, i es desprèn barat.
    Casal,
}

impl Level {
    pub fn from_u8(n: u8) -> Level {
        match n {
            0 => Level::Aprenent,
            _ => Level::Casal,
        }
    }
}

/// Tria una carta entre les legals.
///
/// Heurística de partida: si pot guanyar la basa i hi ha punts a sobre la taula,
/// mata amb la carta més justa; si no, es desprèn de la més barata.
pub fn choose_card(state: &HandState, seat: Seat, level: Level) -> Option<Card> {
    let legals = state.legal();
    if legals.is_empty() {
        return None;
    }

    // L'aprenent tria entre les legals sense cap criteri. És dèbil de debò,
    // no una versió alentida de la bona: així el nivell vol dir alguna cosa.
    if level == Level::Aprenent {
        let barreja = (state.seed ^ (seat as u64 + 1).wrapping_mul(0x9E3779B97F4A7C15))
            .wrapping_add((state.tricks.len() as u64).wrapping_mul(0x632BE59BD9B4E019));
        let i = (barreja >> 33) as usize % legals.len();
        return legals.get(i).copied();
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

    #[test]
    fn l_aprenent_tampoc_no_fa_jugades_illegals() {
        for llavor in [3, 19, 404, 7777] {
            let mut st = HandState::new(llavor, 0);
            st.bid(0, Bid::Suit { suit: Suit::Copes }).unwrap();
            st.pass_doubling().unwrap();
            while st.phase == HandPhase::Playing {
                let seat = st.turn;
                let card = choose_card(&st, seat, Level::Aprenent).expect("hi ha jugada");
                st.play(seat, card).expect("l'aprenent juga legal");
            }
            assert_eq!(st.result.unwrap().points.iter().sum::<u32>(), 72);
        }
    }
}
