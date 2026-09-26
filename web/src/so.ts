/**
 * Sons de la taula (§11 de DISSENY.md).
 *
 * Tot és sintetitzat amb Web Audio i no hi ha cap fitxer: no pesa res, no
 * depèn de cap llicència i es pot afinar la subtilesa al decibel. Res de
 * música de fons, res de veus; només el que faria una carta de cartó sobre
 * un tapet i un clic de fusta.
 *
 * El navegador no deixa sonar res fins que la persona ha tocat la pantalla,
 * i per això el context es crea mandrós, al primer so de veritat.
 */

const VOLUM = 0.4;          // §11: el mestre va al 40%
const VARIACIO = 0.04;      // ±4% de to a cada repetició, perquè no soni a màquina

let ctx: AudioContext | null = null;
let mestre: GainNode | null = null;
let actiu = true;
let soroll: AudioBuffer | null = null;
let victoria: AudioBuffer | null = null;
let carregant: Promise<AudioBuffer | null> | null = null;

function arrenca(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      mestre = ctx.createGain();
      mestre.gain.value = VOLUM;
      mestre.connect(ctx.destination);
    } catch {
      return null;   // navegador sense àudio: el joc funciona igual
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Soroll blanc d'un segon, reutilitzat per a tots els fregaments. */
function buffer(c: AudioContext): AudioBuffer {
  if (!soroll) {
    soroll = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = soroll.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return soroll;
}

const varia = () => 1 + (Math.random() * 2 - 1) * VARIACIO;

/** Un fregament: soroll filtrat amb una envolupant curta. És la carta. */
function frec(opcions: {
  durada: number; guany: number;
  freq: number; freqFinal?: number; q?: number;
  tipus?: BiquadFilterType;
}) {
  const c = arrenca();
  if (!c || !mestre || !actiu) return;
  const ara = c.currentTime;
  const { durada, guany, freq, freqFinal, q = 0.9, tipus = "bandpass" } = opcions;

  const font = c.createBufferSource();
  font.buffer = buffer(c);
  font.playbackRate.value = varia();

  const filtre = c.createBiquadFilter();
  filtre.type = tipus;
  filtre.frequency.setValueAtTime(freq * varia(), ara);
  if (freqFinal) filtre.frequency.exponentialRampToValueAtTime(freqFinal, ara + durada);
  filtre.Q.value = q;

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, ara);
  g.gain.exponentialRampToValueAtTime(guany, ara + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, ara + durada);

  font.connect(filtre).connect(g).connect(mestre);
  font.start(ara);
  font.stop(ara + durada + 0.02);
}

/** Un to curt i sec. És el clic de fusta. */
function fusta(freq: number, durada: number, guany: number, tipus: OscillatorType = "triangle") {
  const c = arrenca();
  if (!c || !mestre || !actiu) return;
  const ara = c.currentTime;

  const o = c.createOscillator();
  o.type = tipus;
  o.frequency.setValueAtTime(freq * varia(), ara);
  o.frequency.exponentialRampToValueAtTime(freq * 0.72, ara + durada);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, ara);
  g.gain.exponentialRampToValueAtTime(guany, ara + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, ara + durada);

  o.connect(g).connect(mestre);
  o.start(ara);
  o.stop(ara + durada + 0.02);
}

/* ─────────────────────── la fanfàrria de victòria ──────────────────────
   Va contra la §11 i la §15 de DISSENY.md, que demanen sobrietat i prohibeixen
   les fanfàrries. Hi és per decisió expressa del Marcel, i per això sona
   només en guanyar la PARTIDA, mai en guanyar una mà: cada minut cansaria.
   ------------------------------------------------------------------- */

/** Veu de metall: dues serres desafinades i un filtre que s'obre de cop. */
function metall(freq: number, quan: number, durada: number, guany: number) {
  const c = ctx!;
  const sortida = mestre!;
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.Q.value = 1.6;
  filtre.frequency.setValueAtTime(freq * 1.2, quan);
  filtre.frequency.linearRampToValueAtTime(freq * 6, quan + 0.05);
  filtre.frequency.exponentialRampToValueAtTime(freq * 2, quan + durada);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, quan);
  g.gain.exponentialRampToValueAtTime(guany, quan + 0.035);
  g.gain.setValueAtTime(guany, quan + durada * 0.65);
  g.gain.exponentialRampToValueAtTime(0.0001, quan + durada);

  for (const desaf of [-6, 6]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = desaf;
    o.connect(filtre);
    o.start(quan);
    o.stop(quan + durada + 0.05);
  }
  filtre.connect(g).connect(sortida);
}

/** Timbal: to greu que cau de seguida, amb un cop de pell al davant. */
function timbal(freq: number, quan: number, guany: number) {
  const c = ctx!;
  const sortida = mestre!;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq * 1.8, quan);
  o.frequency.exponentialRampToValueAtTime(freq, quan + 0.06);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, quan);
  g.gain.exponentialRampToValueAtTime(guany, quan + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, quan + 0.45);
  o.connect(g).connect(sortida);
  o.start(quan);
  o.stop(quan + 0.5);

  const n = c.createBufferSource();
  n.buffer = buffer(c);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  const gn = c.createGain();
  gn.gain.setValueAtTime(guany * 0.5, quan);
  gn.gain.exponentialRampToValueAtTime(0.0001, quan + 0.08);
  n.connect(f).connect(gn).connect(sortida);
  n.start(quan);
  n.stop(quan + 0.1);
}

/** Redoblament: cops de soroll cada cop més junts i cada cop més forts. */
function redoblament(quan: number, durada: number) {
  const c = ctx!;
  const sortida = mestre!;
  let t = quan, interval = 0.075;
  while (t < quan + durada) {
    const avanc = (t - quan) / durada;
    const n = c.createBufferSource();
    n.buffer = buffer(c);
    n.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 700 + avanc * 900;
    const g = c.createGain();
    const pic = 0.035 + avanc * 0.075;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pic, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(f).connect(g).connect(sortida);
    n.start(t);
    n.stop(t + 0.06);
    t += interval;
    interval = Math.max(0.022, interval * 0.9);
  }
}

export const so = {
  /** L'activa o la desactiva des dels ajustos. */
  activa(v: boolean) { actiu = v; },

  /** Clic de botó. Ha de ser gairebé imperceptible. */
  clic() {
    frec({ durada: 0.022, guany: 0.10, freq: 2600, q: 1.1, tipus: "highpass" });
    fusta(190, 0.02, 0.05, "sine");
  },

  /** Carta que cau al tapet: cop sec i suau (§11, 70 ms). */
  carta() {
    frec({ durada: 0.07, guany: 0.20, freq: 1250, freqFinal: 420, q: 0.7 });
    fusta(120, 0.05, 0.06, "sine");
  },

  /** Carta que llisca en repartir-se. */
  reparteix() {
    frec({ durada: 0.09, guany: 0.12, freq: 2400, freqFinal: 900, q: 0.6 });
  },

  /** Les quatre cartes de la basa, recollides juntes: més greu i més llarg. */
  basa() {
    frec({ durada: 0.26, guany: 0.15, freq: 1500, freqFinal: 380, q: 0.5 });
  },

  /** Cantar el trumfo: clic de fusta, sòlid. */
  canta() {
    fusta(430, 0.06, 0.16);
    frec({ durada: 0.03, guany: 0.08, freq: 3000, q: 1.2, tipus: "highpass" });
  },

  /** Contro: el mateix clic, un to més amunt. */
  contro() {
    fusta(570, 0.06, 0.16);
    frec({ durada: 0.03, guany: 0.08, freq: 3200, q: 1.2, tipus: "highpass" });
  },

  /**
   * Victòria de partida. Sona la peça que ha portat el Marcel, retallada als
   * dos primers segons amb esvaïment. Si el fitxer no arriba, hi ha la
   * fanfàrria sintetitzada de sota, que no depèn de res.
   *
   * Només aquí; el final de mà continua sent l'acord curt de la §11.
   */
  triomf() {
    const c = arrenca();
    if (!c || !mestre || !actiu) return;
    const sortida = mestre;

    const toca = (b: AudioBuffer) => {
      const f = c.createBufferSource();
      f.buffer = b;
      const g = c.createGain();
      g.gain.value = 0.9;
      f.connect(g).connect(sortida);
      f.start();
    };

    if (victoria) { toca(victoria); return; }

    carregant ??= fetch("/so/victoria.m4a")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("no hi és"))))
      .then((b) => c.decodeAudioData(b))
      .catch(() => null);

    void carregant.then((b) => {
      if (b) { victoria = b; toca(b); } else so.fanfarria();
    });
  },

  /** La fanfàrria sintetitzada, de recanvi. */
  fanfarria() {
    const c = arrenca();
    if (!c || !mestre || !actiu) return;
    const t0 = c.currentTime + 0.05;

    redoblament(t0, 0.95);
    timbal(73.42, t0 + 0.95, 0.30);          // re greu

    // Sol · sol · do · mi, i acord final sostingut.
    const SOL = 392.0, DO = 523.25, MI = 659.25, DO_ALT = 1046.5;
    metall(SOL, t0 + 1.00, 0.16, 0.16);
    metall(SOL, t0 + 1.18, 0.14, 0.16);
    metall(DO,  t0 + 1.34, 0.30, 0.18);
    metall(MI,  t0 + 1.66, 0.20, 0.17);

    const acord = t0 + 1.88;
    metall(DO, acord, 1.05, 0.17);
    metall(MI, acord + 0.02, 1.03, 0.13);
    metall(SOL * 1.5, acord + 0.04, 1.01, 0.11);   // sol agut
    metall(DO_ALT, acord + 0.06, 0.99, 0.08);
    timbal(73.42, acord, 0.28);
    timbal(73.42, acord + 0.40, 0.20);
    timbal(97.999, acord + 0.72, 0.24);            // sol greu per tancar
  },

  /** Final de mà: un sol acord càlid, breu i sense cua. */
  fi() {
    const c = arrenca();
    if (!c || !mestre || !actiu) return;
    const ara = c.currentTime;
    const sortida = mestre;   // el tancament perd l'estrenyiment de tipus
    [220, 277.18, 329.63].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f * varia();
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, ara);
      g.gain.exponentialRampToValueAtTime(0.10 - i * 0.02, ara + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ara + 0.5);
      o.connect(g).connect(sortida);
      o.start(ara + i * 0.012);
      o.stop(ara + 0.55);
    });
  },
};
