//! La basa i qui la guanya.

use crate::cards::{Card, Suit};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Play {
    pub seat: u8,
    pub card: Card,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Trick {
    pub plays: Vec<Play>,
}

impl Trick {
    pub fn is_empty(&self) -> bool {
        self.plays.is_empty()
    }

    pub fn is_complete(&self) -> bool {
        self.plays.len() == 4
    }

    /// El pal de sortida, si ja s'ha jugat alguna carta.
    pub fn led_suit(&self) -> Option<Suit> {
        self.plays.first().map(|p| p.card.suit)
    }

    /// Quina jugada va guanyant ara mateix.
    ///
    /// Un trumfo sempre supera qualsevol carta del pal de sortida; entre trumfos
    /// i entre cartes del pal de sortida, mana la força (§1.2).
    pub fn winning_play(&self, trump: Option<Suit>) -> Option<Play> {
        let led = self.led_suit()?;
        let mut best = self.plays[0];
        for &p in &self.plays[1..] {
            if beats(p.card, best.card, led, trump) {
                best = p;
            }
        }
        Some(best)
    }

    pub fn winner(&self, trump: Option<Suit>) -> Option<u8> {
        self.winning_play(trump).map(|p| p.seat)
    }

    /// Punts de les cartes de la basa, sense comptar el punt de la basa.
    pub fn card_points(&self) -> u32 {
        self.plays.iter().map(|p| p.card.points()).sum()
    }
}

/// `challenger` supera `current`?
pub fn beats(challenger: Card, current: Card, led: Suit, trump: Option<Suit>) -> bool {
    let is_trump = |c: Card| trump == Some(c.suit);
    match (is_trump(challenger), is_trump(current)) {
        (true, true) => challenger.strength() > current.strength(),
        (true, false) => true,
        (false, true) => false,
        (false, false) => {
            // Fora de trumfo només competeix qui ha servit el pal de sortida.
            challenger.suit == led && current.suit == led && challenger.strength() > current.strength()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn c(s: Suit, r: u8) -> Card {
        Card::new(s, r)
    }

    fn basa(plays: &[(u8, Suit, u8)]) -> Trick {
        Trick {
            plays: plays.iter().map(|&(seat, s, r)| Play { seat, card: c(s, r) }).collect(),
        }
    }

    #[test]
    fn la_manilla_guanya_a_las_del_mateix_pal() {
        let t = basa(&[(0, Suit::Oros, 1), (1, Suit::Oros, 9)]);
        assert_eq!(t.winner(None), Some(1));
    }

    #[test]
    fn el_trumfo_mata_qualsevol_carta_del_pal_de_sortida() {
        let t = basa(&[(0, Suit::Oros, 9), (1, Suit::Bastos, 2)]);
        assert_eq!(t.winner(Some(Suit::Bastos)), Some(1), "un 2 de trumfo mata la manilla d'oros");
    }

    #[test]
    fn entre_trumfos_mana_la_forca() {
        let t = basa(&[(0, Suit::Oros, 9), (1, Suit::Bastos, 2), (2, Suit::Bastos, 10)]);
        assert_eq!(t.winner(Some(Suit::Bastos)), Some(2));
    }

    #[test]
    fn una_carta_dun_altre_pal_no_guanya_mai_sense_trumfo() {
        let t = basa(&[(0, Suit::Oros, 2), (1, Suit::Copes, 9)]);
        assert_eq!(t.winner(None), Some(0), "amb botifarra, fallar no serveix de res");
    }

    #[test]
    fn punts_de_la_basa() {
        let t = basa(&[(0, Suit::Oros, 9), (1, Suit::Oros, 1), (2, Suit::Oros, 2), (3, Suit::Copes, 12)]);
        assert_eq!(t.card_points(), 5 + 4 + 0 + 3);
    }
}
