//! Repartiment reproduïble. §1.1 del brief.
//!
//! Tota mà es reconstrueix a partir de la llavor, que és el que sosté
//! l'anàlisi, les repeticions i la investigació de trampes.

use crate::cards::{full_deck, Card};
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;

/// Reparteix 12 cartes a cada lloc a partir d'una llavor.
///
/// El repartiment va en sentit antihorari, en grups de 4, començant pel
/// jugador de la dreta de qui reparteix — que amb seients 0..3 és `dealer + 1`.
pub fn deal(seed: u64, dealer: u8) -> [Vec<Card>; 4] {
    let mut deck = full_deck();
    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    deck.shuffle(&mut rng);

    let mut hands: [Vec<Card>; 4] = Default::default();
    let mut it = deck.into_iter();

    // Tres rondes de 4 cartes a cada jugador.
    for _ in 0..3 {
        for step in 0..4u8 {
            let seat = ((dealer + 1 + step) % 4) as usize;
            for _ in 0..4 {
                hands[seat].push(it.next().expect("48 cartes"));
            }
        }
    }
    hands
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn reparteix_12_a_cadascu() {
        let hands = deal(42, 0);
        for h in &hands {
            assert_eq!(h.len(), 12);
        }
    }

    #[test]
    fn no_hi_ha_cartes_repetides() {
        let hands = deal(7, 2);
        let totes: HashSet<_> = hands.iter().flatten().copied().collect();
        assert_eq!(totes.len(), 48);
    }

    #[test]
    fn la_mateixa_llavor_dona_el_mateix_repartiment() {
        assert_eq!(deal(1234, 1), deal(1234, 1));
    }

    #[test]
    fn llavors_diferents_donen_repartiments_diferents() {
        assert_ne!(deal(1, 0), deal(2, 0));
    }
}
