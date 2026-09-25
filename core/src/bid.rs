//! Cantar, contrar i multiplicadors. §1.4 i §1.5 del brief.

use crate::cards::Suit;
use serde::{Deserialize, Serialize};

/// El que pot dir qui reparteix, o el company si li ha delegat.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Bid {
    /// Canta un pal com a trumfo.
    Suit { suit: Suit },
    /// Es juga sense trumfo. Dobla el valor de la mà.
    Botifarra,
    /// Passa la decisió al company, que està obligat a cantar.
    Delegate,
}

/// Nivell de doblatge assolit. §1.5.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Doubling {
    None,
    Contro,
    Recontro,
    SantVicenc,
    Barraca,
}

impl Doubling {
    /// Multiplicador base, abans d'aplicar el doblatge de la botifarra.
    pub fn factor(self) -> u32 {
        match self {
            Doubling::None => 1,
            Doubling::Contro => 2,
            Doubling::Recontro => 4,
            Doubling::SantVicenc => 8,
            Doubling::Barraca => 16,
        }
    }

    /// Següent nivell possible, si n'hi ha.
    pub fn next(self) -> Option<Doubling> {
        match self {
            Doubling::None => Some(Doubling::Contro),
            Doubling::Contro => Some(Doubling::Recontro),
            Doubling::Recontro => Some(Doubling::SantVicenc),
            Doubling::SantVicenc => Some(Doubling::Barraca),
            Doubling::Barraca => None,
        }
    }
}

/// El contracte de la mà, un cop cantat.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Contract {
    /// `None` vol dir botifarra: es juga sense trumfo.
    pub trump: Option<Suit>,
    /// Qui ha cantat. Determina qui pot recontrar.
    pub declarer: u8,
    pub doubling: Doubling,
}

impl Contract {
    pub fn is_botifarra(&self) -> bool {
        self.trump.is_none()
    }

    /// Multiplicador final aplicat als punts. §1.5 i §1.6.
    ///
    /// La botifarra dobla el valor de la mà en qualsevol cas.
    pub fn multiplier(&self) -> u32 {
        let base = self.doubling.factor();
        if self.is_botifarra() {
            base * 2
        } else {
            base
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn contracte(trump: Option<Suit>, doubling: Doubling) -> Contract {
        Contract { trump, declarer: 0, doubling }
    }

    #[test]
    fn multiplicadors_amb_trumfo() {
        let t = Some(Suit::Oros);
        assert_eq!(contracte(t, Doubling::None).multiplier(), 1);
        assert_eq!(contracte(t, Doubling::Contro).multiplier(), 2);
        assert_eq!(contracte(t, Doubling::Recontro).multiplier(), 4);
        assert_eq!(contracte(t, Doubling::SantVicenc).multiplier(), 8);
        assert_eq!(contracte(t, Doubling::Barraca).multiplier(), 16);
    }

    #[test]
    fn la_botifarra_dobla_sempre() {
        assert_eq!(contracte(None, Doubling::None).multiplier(), 2);
        assert_eq!(contracte(None, Doubling::Contro).multiplier(), 4);
        assert_eq!(contracte(None, Doubling::Recontro).multiplier(), 8);
    }
}
