//! Màquina d'estats d'una mà.

use crate::bid::{Bid, Contract, Doubling};
use crate::cards::{Card, Suit};
use crate::deal::deal;
use crate::rules::legal_moves;
use crate::scoring::{score_hand, HandResult};
use crate::trick::{Play, Trick};
use serde::{Deserialize, Serialize};

pub type Seat = u8;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum HandPhase {
    /// Qui reparteix ha de cantar, o delegar.
    Bidding,
    /// S'ha delegat: el company està obligat a cantar.
    BiddingDelegated,
    /// Ronda de contro, recontro…
    Doubling,
    Playing,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandState {
    pub seed: u64,
    pub dealer: Seat,
    pub phase: HandPhase,
    pub hands: [Vec<Card>; 4],
    pub contract: Option<Contract>,
    pub trick: Trick,
    pub tricks: Vec<Trick>,
    pub turn: Seat,
    /// Qui pot doblar ara, si hi som.
    pub may_double: Option<Seat>,
    pub result: Option<HandResult>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MoveError {
    WrongPhase,
    NotYourTurn,
    IllegalCard,
    NotInHand,
    CannotDelegate,
    CannotDouble,
}

impl HandState {
    pub fn new(seed: u64, dealer: Seat) -> Self {
        Self {
            seed,
            dealer,
            phase: HandPhase::Bidding,
            hands: deal(seed, dealer),
            contract: None,
            trick: Trick::default(),
            tricks: Vec::with_capacity(12),
            turn: dealer,
            may_double: None,
            result: None,
        }
    }

    pub fn trump(&self) -> Option<Suit> {
        self.contract.and_then(|c| c.trump)
    }

    /// Cartes que pot jugar qui té el torn.
    pub fn legal(&self) -> Vec<Card> {
        if self.phase != HandPhase::Playing {
            return Vec::new();
        }
        legal_moves(&self.hands[self.turn as usize], &self.trick, self.trump(), self.turn)
    }

    pub fn bid(&mut self, seat: Seat, bid: Bid) -> Result<(), MoveError> {
        match self.phase {
            HandPhase::Bidding | HandPhase::BiddingDelegated => {}
            _ => return Err(MoveError::WrongPhase),
        }
        if seat != self.turn {
            return Err(MoveError::NotYourTurn);
        }

        match bid {
            Bid::Delegate => {
                if self.phase == HandPhase::BiddingDelegated {
                    // Qui rep la delegació està obligat a cantar (§1.4).
                    return Err(MoveError::CannotDelegate);
                }
                self.phase = HandPhase::BiddingDelegated;
                self.turn = (seat + 2) % 4;
            }
            Bid::Suit { suit } => self.set_contract(Some(suit), seat),
            Bid::Botifarra => self.set_contract(None, seat),
        }
        Ok(())
    }

    fn set_contract(&mut self, trump: Option<Suit>, declarer: Seat) {
        self.contract = Some(Contract { trump, declarer, doubling: Doubling::None });
        self.phase = HandPhase::Doubling;
        // El primer que pot contrar és un rival de qui ha cantat.
        self.may_double = Some((declarer + 1) % 4);
        self.turn = (self.dealer + 1) % 4;
    }

    /// Puja un nivell de doblatge. Amb botifarra no hi ha Sant Vicenç (§1.5).
    pub fn double(&mut self, seat: Seat) -> Result<(), MoveError> {
        if self.phase != HandPhase::Doubling {
            return Err(MoveError::WrongPhase);
        }
        let Some(may) = self.may_double else { return Err(MoveError::CannotDouble) };
        if seat != may {
            return Err(MoveError::NotYourTurn);
        }
        let contract = self.contract.as_mut().expect("hi ha contracte");
        let Some(next) = contract.doubling.next() else { return Err(MoveError::CannotDouble) };
        if contract.trump.is_none() && next >= Doubling::SantVicenc {
            return Err(MoveError::CannotDouble);
        }
        contract.doubling = next;
        self.may_double = Some((seat + 1) % 4);
        Ok(())
    }

    /// Ningú més vol doblar: comença el joc.
    pub fn pass_doubling(&mut self) -> Result<(), MoveError> {
        if self.phase != HandPhase::Doubling {
            return Err(MoveError::WrongPhase);
        }
        self.phase = HandPhase::Playing;
        self.may_double = None;
        Ok(())
    }

    pub fn play(&mut self, seat: Seat, card: Card) -> Result<(), MoveError> {
        if self.phase != HandPhase::Playing {
            return Err(MoveError::WrongPhase);
        }
        if seat != self.turn {
            return Err(MoveError::NotYourTurn);
        }
        let hand = &self.hands[seat as usize];
        if !hand.contains(&card) {
            return Err(MoveError::NotInHand);
        }
        if !self.legal().contains(&card) {
            return Err(MoveError::IllegalCard);
        }

        self.hands[seat as usize].retain(|&c| c != card);
        self.trick.plays.push(Play { seat, card });

        if self.trick.is_complete() {
            let winner = self.trick.winner(self.trump()).expect("basa completa");
            self.tricks.push(std::mem::take(&mut self.trick));
            self.turn = winner;
            if self.tricks.len() == 12 {
                self.phase = HandPhase::Finished;
                self.result = Some(score_hand(&self.tricks, &self.contract.expect("contracte")));
            }
        } else {
            self.turn = (seat + 1) % 4;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn una_ma_sencera_acaba_amb_72_punts() {
        let mut st = HandState::new(2026, 0);
        st.bid(0, Bid::Suit { suit: Suit::Oros }).unwrap();
        st.pass_doubling().unwrap();

        while st.phase == HandPhase::Playing {
            let seat = st.turn;
            let card = *st.legal().first().expect("sempre hi ha jugada legal");
            st.play(seat, card).unwrap();
        }

        let r = st.result.expect("la mà ha acabat");
        assert_eq!(r.points[0] + r.points[1], 72);
        assert_eq!(st.tricks.len(), 12);
        assert!(st.hands.iter().all(|h| h.is_empty()));
    }

    #[test]
    fn qui_rep_la_delegacio_no_pot_tornar_a_delegar() {
        let mut st = HandState::new(1, 0);
        st.bid(0, Bid::Delegate).unwrap();
        assert_eq!(st.turn, 2);
        assert_eq!(st.bid(2, Bid::Delegate), Err(MoveError::CannotDelegate));
    }

    #[test]
    fn no_es_pot_jugar_fora_de_torn() {
        let mut st = HandState::new(5, 0);
        st.bid(0, Bid::Botifarra).unwrap();
        st.pass_doubling().unwrap();
        let altre = (st.turn + 1) % 4;
        let card = st.hands[altre as usize][0];
        assert_eq!(st.play(altre, card), Err(MoveError::NotYourTurn));
    }

    #[test]
    fn amb_botifarra_no_hi_ha_sant_vicenc() {
        let mut st = HandState::new(9, 0);
        st.bid(0, Bid::Botifarra).unwrap();
        st.double(1).unwrap(); // contro
        st.double(2).unwrap(); // recontro
        assert_eq!(st.double(3), Err(MoveError::CannotDouble));
    }
}
