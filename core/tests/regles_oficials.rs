//! Proves contra el reglament oficial del Campionat de Catalunya de Botifarra.
//!
//! Cada prova cita l'article que verifica. Quan un jugador qüestioni una
//! jugada, s'ha de poder anar de la queixa a la prova en trenta segons.

use botifarra_core::bid::Bid;
use botifarra_core::cards::{Card, Suit};
use botifarra_core::state::{HandPhase, HandState};

/// Jerarquia: la manilla mana sobre l'as.
#[test]
fn jerarquia_del_pal() {
    let ordre = [9u8, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2];
    for parell in ordre.windows(2) {
        let alta = Card::new(Suit::Espases, parell[0]);
        let baixa = Card::new(Suit::Espases, parell[1]);
        assert!(alta.strength() > baixa.strength(), "{} > {}", alta.code(), baixa.code());
    }
}

/// Valors: 5-4-3-2-1 per manilla, as, rei, cavall i sota; un punt per basa.
#[test]
fn valors_i_total_de_72() {
    assert_eq!(Card::new(Suit::Oros, 9).points(), 5);
    assert_eq!(Card::new(Suit::Oros, 1).points(), 4);
    assert_eq!(Card::new(Suit::Oros, 12).points(), 3);
    assert_eq!(Card::new(Suit::Oros, 11).points(), 2);
    assert_eq!(Card::new(Suit::Oros, 10).points(), 1);
    assert_eq!(Card::new(Suit::Oros, 8).points(), 0);

    let cartes: u32 = botifarra_core::full_deck().iter().map(|c| c.points()).sum();
    assert_eq!(cartes + 12, 72, "60 de cartes + 12 de bases");
}

/// Cap mà pot acabar amb un total diferent de 72, jugui qui jugui.
#[test]
fn cent_mans_sempre_sumen_72() {
    for seed in 0..100u64 {
        let mut st = HandState::new(seed, (seed % 4) as u8);
        let dealer = st.dealer;
        st.bid(dealer, Bid::Suit { suit: Suit::ALL[(seed % 4) as usize] }).unwrap();
        st.pass_doubling().unwrap();

        while st.phase == HandPhase::Playing {
            let seat = st.turn;
            let card = botifarra_core::ai::choose_card(&st, seat, botifarra_core::ai::Level::Casal)
                .expect("sempre hi ha jugada legal");
            st.play(seat, card).expect("la IA no fa jugades il·legals");
        }

        let r = st.result.expect("mà acabada");
        assert_eq!(r.points[0] + r.points[1], 72, "llavor {seed}");
        assert_eq!(st.tricks.len(), 12, "llavor {seed}");
    }
}

/// Amb botifarra ningú pot arribar a Sant Vicenç.
#[test]
fn sant_vicenc_nomes_sense_botifarra() {
    let mut st = HandState::new(3, 0);
    st.bid(0, Bid::Botifarra).unwrap();
    st.double(1).unwrap();
    st.double(2).unwrap();
    assert!(st.double(3).is_err());

    let mut st = HandState::new(3, 0);
    st.bid(0, Bid::Suit { suit: Suit::Bastos }).unwrap();
    st.double(1).unwrap();
    st.double(2).unwrap();
    assert!(st.double(3).is_ok(), "amb trumfo sí que hi ha Sant Vicenç");
}
