//! Jugades legals. §1.7 del brief.
//!
//! Aquesta és la part on més s'equivoquen les implementacions, i la que fa que
//! la botifarra sigui un joc de deducció i no de faroleig: com que les
//! obligacions no permeten mentir, que algú no serveixi un pal és **certesa**.

use crate::cards::{Card, Suit};
use crate::trick::{beats, Trick};

/// Els companys seuen un davant de l'altre: 0 amb 2, 1 amb 3.
pub fn partner(seat: u8) -> u8 {
    (seat + 2) % 4
}

pub fn team(seat: u8) -> u8 {
    seat % 2
}

/// Cartes que `seat` pot jugar legalment.
///
/// L'obligació es resumeix en una frase: **cal servir el pal, i si el company
/// no va guanyant cal matar si es pot**. Fallar és la manera de matar quan no
/// tens el pal de sortida.
pub fn legal_moves(hand: &[Card], trick: &Trick, trump: Option<Suit>, seat: u8) -> Vec<Card> {
    // Qui surt tria lliurement.
    let Some(led) = trick.led_suit() else {
        return hand.to_vec();
    };

    let winning = trick.winning_play(trump).expect("la basa no és buida");
    let partner_winning = winning.seat == partner(seat);

    let del_pal: Vec<Card> = hand.iter().copied().filter(|c| c.suit == led).collect();

    if !del_pal.is_empty() {
        if partner_winning {
            // Regla 4: si el company va guanyant, no hi ha obligació de matar.
            return del_pal;
        }
        // Regla 2: cal matar si es pot, dins del pal servit.
        let maten: Vec<Card> = del_pal
            .iter()
            .copied()
            .filter(|&c| beats(c, winning.card, led, trump))
            .collect();
        return if maten.is_empty() { del_pal } else { maten };
    }

    // No té el pal de sortida.
    if partner_winning {
        // Regla 4: lliure.
        return hand.to_vec();
    }

    // Regla 3: cal fallar si amb això mata.
    let maten: Vec<Card> = hand
        .iter()
        .copied()
        .filter(|&c| beats(c, winning.card, led, trump))
        .collect();

    // Regla 5: si no pot matar, juga lliurement.
    if maten.is_empty() {
        hand.to_vec()
    } else {
        maten
    }
}

pub fn is_legal(card: Card, hand: &[Card], trick: &Trick, trump: Option<Suit>, seat: u8) -> bool {
    legal_moves(hand, trick, trump, seat).contains(&card)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::trick::Play;

    fn c(s: Suit, r: u8) -> Card {
        Card::new(s, r)
    }

    fn basa(plays: &[(u8, Suit, u8)]) -> Trick {
        Trick {
            plays: plays.iter().map(|&(seat, s, r)| Play { seat, card: c(s, r) }).collect(),
        }
    }

    #[test]
    fn qui_surt_juga_el_que_vol() {
        let ma = vec![c(Suit::Oros, 9), c(Suit::Copes, 2)];
        assert_eq!(legal_moves(&ma, &Trick::default(), Some(Suit::Bastos), 0).len(), 2);
    }

    #[test]
    fn cal_servir_el_pal() {
        let ma = vec![c(Suit::Oros, 5), c(Suit::Copes, 9)];
        let t = basa(&[(0, Suit::Oros, 2)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 1);
        assert_eq!(legals, vec![c(Suit::Oros, 5)], "té oros: ha de servir oros");
    }

    #[test]
    fn cal_matar_si_es_pot() {
        let ma = vec![c(Suit::Oros, 3), c(Suit::Oros, 9)];
        let t = basa(&[(0, Suit::Oros, 12)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 1);
        assert_eq!(legals, vec![c(Suit::Oros, 9)], "només la manilla mata el rei");
    }

    #[test]
    fn si_no_pot_matar_serveix_el_pal_lliurement() {
        let ma = vec![c(Suit::Oros, 3), c(Suit::Oros, 5)];
        let t = basa(&[(0, Suit::Oros, 9)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 1);
        assert_eq!(legals.len(), 2, "cap de les dues mata la manilla");
    }

    #[test]
    fn si_el_company_va_guanyant_no_cal_matar() {
        // Seient 2 juga; el company és el 0, que va guanyant amb la manilla.
        let ma = vec![c(Suit::Oros, 3), c(Suit::Oros, 1)];
        let t = basa(&[(0, Suit::Oros, 9), (1, Suit::Oros, 2)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 2);
        assert_eq!(legals.len(), 2, "pot jugar el 3 i estalviar-se l'as");
    }

    #[test]
    fn cal_fallar_si_no_te_el_pal_i_el_company_no_guanya() {
        let ma = vec![c(Suit::Copes, 5), c(Suit::Bastos, 2)];
        let t = basa(&[(0, Suit::Oros, 9)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 1);
        assert_eq!(legals, vec![c(Suit::Bastos, 2)], "ha de fallar amb el trumfo");
    }

    #[test]
    fn no_cal_fallar_si_el_company_va_guanyant() {
        let ma = vec![c(Suit::Copes, 5), c(Suit::Bastos, 2)];
        let t = basa(&[(0, Suit::Oros, 9), (1, Suit::Oros, 2)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 2);
        assert_eq!(legals.len(), 2, "el company guanya: es pot descartar");
    }

    #[test]
    fn cal_superar_el_trumfo_ja_jugat() {
        let ma = vec![c(Suit::Bastos, 3), c(Suit::Bastos, 9), c(Suit::Copes, 4)];
        let t = basa(&[(0, Suit::Oros, 12), (1, Suit::Bastos, 5)]);
        let legals = legal_moves(&ma, &t, Some(Suit::Bastos), 2);
        assert_eq!(legals, vec![c(Suit::Bastos, 9)], "el 3 no supera el 5 de trumfo");
    }

    #[test]
    fn amb_botifarra_fallar_no_existeix() {
        let ma = vec![c(Suit::Copes, 9), c(Suit::Bastos, 9)];
        let t = basa(&[(0, Suit::Oros, 2)]);
        let legals = legal_moves(&ma, &t, None, 1);
        assert_eq!(legals.len(), 2, "sense trumfo, res mata: es juga lliurement");
    }

    #[test]
    fn companys_i_equips() {
        assert_eq!(partner(0), 2);
        assert_eq!(partner(1), 3);
        assert_eq!(team(0), team(2));
        assert_ne!(team(0), team(1));
    }
}
