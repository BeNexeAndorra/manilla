//! Cartes, pals i valors. §1.2 i §1.3 del brief.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Suit {
    Oros,
    Copes,
    Espases,
    Bastos,
}

impl Suit {
    pub const ALL: [Suit; 4] = [Suit::Oros, Suit::Copes, Suit::Espases, Suit::Bastos];

    pub fn index(self) -> usize {
        self as usize
    }
}

/// Una carta. `rank` va de 1 a 12 tal com surt impresa a la baralla.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Card {
    pub suit: Suit,
    pub rank: u8,
}

impl Card {
    pub fn new(suit: Suit, rank: u8) -> Self {
        debug_assert!((1..=12).contains(&rank), "rang fora de la baralla: {rank}");
        Self { suit, rank }
    }

    /// Força dins del pal. Més alt guanya.
    ///
    /// L'ordre de la botifarra: 9 (manilla) · 1 (as) · 12 · 11 · 10 · 8 · 7 · 6 · 5 · 4 · 3 · 2.
    /// La manilla mana per sobre de l'as, que és el que sorprèn qui ve d'altres jocs.
    pub fn strength(self) -> u8 {
        match self.rank {
            9 => 12,      // manilla
            1 => 11,      // as
            12 => 10,     // rei
            11 => 9,      // cavall
            10 => 8,      // sota
            r => r - 1,   // 8→7, 7→6 … 2→1
        }
    }

    /// Punts que val la carta. §1.3.
    pub fn points(self) -> u32 {
        match self.rank {
            9 => 5,
            1 => 4,
            12 => 3,
            11 => 2,
            10 => 1,
            _ => 0,
        }
    }

    /// Identificador curt i estable: `9o`, `1e`, `12b`…
    pub fn code(self) -> String {
        let s = match self.suit {
            Suit::Oros => 'o',
            Suit::Copes => 'c',
            Suit::Espases => 'e',
            Suit::Bastos => 'b',
        };
        format!("{}{}", self.rank, s)
    }
}

/// La baralla sencera: 48 cartes.
pub fn full_deck() -> Vec<Card> {
    let mut deck = Vec::with_capacity(48);
    for suit in Suit::ALL {
        for rank in 1..=12 {
            deck.push(Card::new(suit, rank));
        }
    }
    deck
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn la_baralla_te_48_cartes() {
        assert_eq!(full_deck().len(), 48);
    }

    #[test]
    fn la_manilla_mana_sobre_las() {
        let manilla = Card::new(Suit::Oros, 9);
        let as_ = Card::new(Suit::Oros, 1);
        assert!(manilla.strength() > as_.strength());
    }

    #[test]
    fn ordre_complet_del_pal() {
        let ordre = [9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2];
        for parell in ordre.windows(2) {
            let alta = Card::new(Suit::Copes, parell[0]);
            let baixa = Card::new(Suit::Copes, parell[1]);
            assert!(
                alta.strength() > baixa.strength(),
                "{} hauria de manar sobre {}",
                alta.code(),
                baixa.code()
            );
        }
    }

    #[test]
    fn el_pal_val_15_punts() {
        let suma: u32 = (1..=12).map(|r| Card::new(Suit::Bastos, r).points()).sum();
        assert_eq!(suma, 15);
    }

    #[test]
    fn la_baralla_val_60_punts() {
        let suma: u32 = full_deck().iter().map(|c| c.points()).sum();
        assert_eq!(suma, 60, "60 de cartes + 12 de bases = 72 (§1.3)");
    }
}
