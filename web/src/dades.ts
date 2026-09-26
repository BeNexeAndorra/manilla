/**
 * Persistència local.
 *
 * Tot passa per aquest fitxer a posta: quan hi hagi servidor (fase F3), només
 * cal canviar el cos d'aquestes funcions per crides a l'API i la resta de
 * l'aplicació no se n'assabenta. Cap component toca `localStorage` directament.
 *
 * Tota lectura i escriptura va dins d'un try/catch: en finestra privada o amb
 * les dades del lloc bloquejades, l'accés llança, i el joc ha de continuar
 * funcionant igualment (§13).
 */

const CLAU = "manilla.v1";

export type Perfil = {
  nom: string;
  inicial: string;
  creat: string;          // ISO
};

export type Ajustos = {
  tema: "clar" | "fosc" | "contrast";
  gran: boolean;
  trama: boolean;
  so: boolean;
  /** «classica» és la baralla Naipes Libres; «propia», la il·lustrada per a Manilla. */
  baralla: "classica" | "propia";
  /** Música de fons: encesa, quina peça i quant de volum (0 a 1). */
  musica: boolean;
  peca: "nocturn" | "escalfor" | "silencis";
  volum: number;
};

export type Config = {
  nivell: 0 | 1;          // 0 aprenent · 1 casal
  objectiu: number;       // punts per guanyar la partida
};

export type ResumPartida = {
  id: string;
  data: string;           // ISO
  nos: number;
  ells: number;
  mans: number;
  guanyada: boolean;
  nivell: 0 | 1;
  objectiu: number;
};

export type Estadistiques = {
  partides: number;
  guanyades: number;
  mans: number;
  mansGuanyades: number;
  puntsAFavor: number;
  puntsEnContra: number;
  millorMa: number;       // més punts anotats en una sola mà
};

type Magatzem = {
  perfil: Perfil | null;
  ajustos: Ajustos;
  config: Config;
  historial: ResumPartida[];
  estadistiques: Estadistiques;
};

export const AJUSTOS_INICIALS: Ajustos =
  { tema: "fosc", gran: false, trama: false, so: true, baralla: "classica",
    musica: false, peca: "nocturn", volum: 0.25 };
export const CONFIG_INICIAL: Config = { nivell: 1, objectiu: 101 };
export const ESTADISTIQUES_INICIALS: Estadistiques = {
  partides: 0, guanyades: 0, mans: 0, mansGuanyades: 0,
  puntsAFavor: 0, puntsEnContra: 0, millorMa: 0,
};

const BUIT: Magatzem = {
  perfil: null,
  ajustos: AJUSTOS_INICIALS,
  config: CONFIG_INICIAL,
  historial: [],
  estadistiques: ESTADISTIQUES_INICIALS,
};

function llegeix(): Magatzem {
  try {
    const cru = localStorage.getItem(CLAU);
    if (!cru) return { ...BUIT };
    const d = JSON.parse(cru) as Partial<Magatzem>;
    return {
      perfil: d.perfil ?? null,
      ajustos: { ...AJUSTOS_INICIALS, ...(d.ajustos ?? {}) },
      config: { ...CONFIG_INICIAL, ...(d.config ?? {}) },
      historial: Array.isArray(d.historial) ? d.historial : [],
      estadistiques: { ...ESTADISTIQUES_INICIALS, ...(d.estadistiques ?? {}) },
    };
  } catch {
    return { ...BUIT };
  }
}

function desa(m: Magatzem) {
  try {
    localStorage.setItem(CLAU, JSON.stringify(m));
  } catch {
    /* finestra privada o dades bloquejades: el joc continua sense desar */
  }
}

export const dades = {
  tot: llegeix,

  desaPerfil(nom: string): Perfil {
    const net = nom.trim().slice(0, 14) || "Jugador";
    const perfil: Perfil = {
      nom: net,
      inicial: net[0].toUpperCase(),
      creat: new Date().toISOString(),
    };
    const m = llegeix();
    desa({ ...m, perfil });
    return perfil;
  },

  esborraTot() {
    try { localStorage.removeItem(CLAU); } catch { /* res a fer */ }
  },

  desaAjustos(ajustos: Ajustos) {
    desa({ ...llegeix(), ajustos });
  },

  desaConfig(config: Config) {
    desa({ ...llegeix(), config });
  },

  /** Tanca una partida: l'afegeix a l'historial i actualitza les estadístiques. */
  tancaPartida(r: ResumPartida, mansGuanyades: number, millorMa: number) {
    const m = llegeix();
    const e = m.estadistiques;
    desa({
      ...m,
      historial: [r, ...m.historial].slice(0, 50),
      estadistiques: {
        partides: e.partides + 1,
        guanyades: e.guanyades + (r.guanyada ? 1 : 0),
        mans: e.mans + r.mans,
        mansGuanyades: e.mansGuanyades + mansGuanyades,
        puntsAFavor: e.puntsAFavor + r.nos,
        puntsEnContra: e.puntsEnContra + r.ells,
        millorMa: Math.max(e.millorMa, millorMa),
      },
    });
  },
};
