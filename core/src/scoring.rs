//! Comptatge de la mà. §1.3 i §1.6 del brief.

use crate::bid::Contract;
use crate::rules::team;
use crate::trick::Trick;
use serde::{Deserialize, Serialize};

/// Punts totals repartits en una mà: 60 de cartes + 12 de bases.
pub const PUNTS_PER_MA: u32 = 72;
/// Llindar a partir del qual es comptabilitza. La meitat de 72.
pub const LLINDAR: u32 = 36;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct HandResult {
    /// Punts bruts de cada equip. Sumen sempre 72.
    pub points: [u32; 2],
    /// Equip que passa de 36, si n'hi ha.
    pub winner: Option<u8>,
    /// Punts anotats a la partida, ja multiplicats.
    pub scored: u32,
    pub multiplier: u32,
}

/// Compta una mà sencera a partir de les seves 12 bases.
pub fn score_hand(tricks: &[Trick], contract: &Contract) -> HandResult {
    debug_assert_eq!(tricks.len(), 12, "una mà són 12 bases");

    let mut points = [0u32; 2];
    for t in tricks {
        if let Some(w) = t.winner(contract.trump) {
            // Cada basa val un punt, més el que valguin les seves cartes.
            points[team(w) as usize] += t.card_points() + 1;
        }
    }

    debug_assert_eq!(points[0] + points[1], PUNTS_PER_MA);

    let multiplier = contract.multiplier();
    let (winner, scored) = if points[0] > LLINDAR {
        (Some(0), (points[0] - LLINDAR) * multiplier)
    } else if points[1] > LLINDAR {
        (Some(1), (points[1] - LLINDAR) * multiplier)
    } else {
        // 36 a 36: no anota ningú.
        (None, 0)
    };

    HandResult { points, winner, scored, multiplier }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bid::Doubling;
    use crate::cards::{Card, Suit};
    use crate::trick::Play;

    /// Construeix 12 bases on `guanyador` s'ho emporta tot.
    fn totes_per(guanyador: u8) -> Vec<Trick> {
        let mut tricks = Vec::new();
        let mut rank = 1u8;
        for i in 0..12 {
            let suit = Suit::ALL[i % 4];
            tricks.push(Trick {
                plays: (0..4)
                    .map(|s| Play {
                        seat: s,
                        // El guanyador juga la manilla; la resta, cartes sense valor.
                        card: if s == guanyador {
                            Card::new(suit, 9)
                        } else {
                            Card::new(suit, 2 + (rank % 6))
                        },
                    })
                    .collect(),
            });
            rank += 1;
        }
        tricks
    }

    fn contracte(trump: Option<Suit>, doubling: Doubling) -> Contract {
        Contract { trump, declarer: 0, doubling }
    }

    #[test]
    fn els_punts_sempre_sumen_72() {
        let tricks = totes_per(0);
        let r = score_hand(&tricks, &contracte(Some(Suit::Oros), Doubling::None));
        assert_eq!(r.points[0] + r.points[1], 72);
    }

    #[test]
    fn nomes_sanota_el_que_passa_de_36() {
        let tricks = totes_per(0);
        let r = score_hand(&tricks, &contracte(Some(Suit::Oros), Doubling::None));
        assert_eq!(r.winner, Some(0));
        assert_eq!(r.scored, r.points[0] - 36);
    }

    #[test]
    fn el_contro_dobla_el_que_sanota() {
        let tricks = totes_per(0);
        let normal = score_hand(&tricks, &contracte(Some(Suit::Oros), Doubling::None));
        let contrat = score_hand(&tricks, &contracte(Some(Suit::Oros), Doubling::Contro));
        assert_eq!(contrat.scored, normal.scored * 2);
    }

    #[test]
    fn la_botifarra_dobla_encara_que_no_hi_hagi_contro() {
        let tricks = totes_per(0);
        let amb_trumfo = score_hand(&tricks, &contracte(Some(Suit::Oros), Doubling::None));
        let botifarra = score_hand(&tricks, &contracte(None, Doubling::None));
        // Sense trumfo els punts canvien, però el multiplicador ha de ser 2.
        assert_eq!(botifarra.multiplier, 2);
        assert_eq!(amb_trumfo.multiplier, 1);
    }
}
