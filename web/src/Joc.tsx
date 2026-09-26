import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import init, { Taula } from "./core/botifarra_core";
import { Carta, CartaClassica, Simbol, NOM_PAL, type Pal } from "./Carta";
import Marca from "./Marca";
import { so } from "./so";
import type { Ajustos, Config, Perfil, ResumPartida } from "./dades";

/* ───────────────────────────────────────────────────────────────────────────
   Geometria de «Manilla Taula» (Claude Design).
   Mòbil: tauler de 390 × 844 que s'escala sencer.
   Escriptori: capçalera i columnes fluides, i una zona de joc fixa de 860 × 844
   centrada, que és l'única part que s'escala. Així el crom no es deforma.
   ─────────────────────────────────────────────────────────────────────── */
const W = 390, H = 844;          // tauler de mòbil
const WD = 860, HD = 844;        // zona de joc d'escriptori
const AMPLE_ESCRIPTORI = 1100;   // a partir d'aquí, tres columnes

const JO = 0;
const NOMS = ["Tu", "Pere", "Marta", "Jordi"];   // 0 jo · 1 dreta · 2 company · 3 esquerra
/** El lloc 0 és qui juga; el nom surt del perfil. */
const anomena = (nom: string) => { NOMS[0] = nom; };
const BR = ["1788", "1905", "1842", "1716"];
const CAT = ["Expert", "Mestre", "Mestre", "Expert"];
const EQUIP = ["#3E7A56", "#2E4A6B", "#3E7A56", "#2E4A6B"];

const KB = 0.727, KD = 1.364;    // escala de la carta a la basa

type Punt = { X: number; Y: number; r: number };
const BASA_M: Record<number, Punt> = {
  0: { X: 163, Y: 398, r: 2 }, 1: { X: 208, Y: 292, r: -3 },
  2: { X: 163, Y: 196, r: -2 }, 3: { X: 118, Y: 292, r: 3 },
};
const BASA_D: Record<number, Punt> = {
  0: { X: 370, Y: 380, r: 2 }, 1: { X: 492, Y: 262, r: -3 },
  2: { X: 370, Y: 146, r: -2 }, 3: { X: 248, Y: 262, r: 3 },
};

type Seient = { seat: number; x: number; y: number; w: number; col: boolean };
const PLACA_M: Seient[] = [
  { seat: 1, x: 280, y: 282, w: 104, col: true },
  { seat: 2, x: 95, y: 104, w: 200, col: false },
  { seat: 3, x: 6, y: 282, w: 104, col: true },
];
const PLACA_D: Seient[] = [
  { seat: 1, x: 700, y: 266, w: 120, col: true },
  { seat: 2, x: 320, y: 78, w: 220, col: false },
  { seat: 3, x: 40, y: 266, w: 120, col: true },
];

/** Trames de pal per a qui no distingeix el color (§6.8). */
const TRAMA: Record<Pal, string> = {
  o: "radial-gradient(rgba(138,100,8,.10) 1.2px, rgba(0,0,0,0) 1.6px) 0 0/7px 7px",
  c: "repeating-linear-gradient(0deg, rgba(122,34,34,.10) 0 2px, rgba(0,0,0,0) 2px 6px)",
  e: "repeating-linear-gradient(90deg, rgba(34,56,85,.10) 0 2px, rgba(0,0,0,0) 2px 6px)",
  b: "repeating-linear-gradient(45deg, rgba(55,80,32,.10) 0 2px, rgba(0,0,0,0) 2px 7px)",
};

const PAL_DE: Record<string, Pal> = { oros: "o", copes: "c", espases: "e", bastos: "b" };

/* El WASM només s'arrenca una vegada. StrictMode executa els efectes dos cops
   i el recàrrega en calent torna a executar el mòdul; cada `init()` de més
   reinstancia la memòria i deixa penjada la `Taula` anterior, que després peta
   amb «unreachable». El guard va en un global perquè sobrevisqui a l'HMR. */
const G = globalThis as unknown as { __manillaWasm?: Promise<unknown> };
const arrenca = () => (G.__manillaWasm ??= init());

type Jugada = { seat: number; card: string };
type Vista = {
  phase: string; turn: number; dealer: number;
  hand: string[]; counts: number[];
  trick: Jugada[];
  tricks: { plays: Jugada[]; winner: number | null }[];
  trump: string | null;
  contract: { trump: string | null; declarer: number; doubling: string } | null;
  legal: string[]; tricksPlayed: number; mayDouble: number | null;
  result: { points: number[]; winner: number | null; scored: number; multiplier: number } | null;
};

type Pos = Punt & { k: number };

/** translate + rotate + scale amb l'origen al centre de la carta (88 × 132). */
const tf = ({ X, Y, r, k }: Pos) =>
  `translate(${(X - 44 * (1 - k)).toFixed(1)}px, ${(Y - 66 * (1 - k)).toFixed(1)}px) rotate(${r}deg) scale(${k})`;

/** Ventall de mòbil. Una fila; en mode gran, dues. */
function ventallM(n: number, raise: number, gran: boolean): Pos[] {
  const out: Pos[] = [];
  if (!gran) {
    const w = 88, step = Math.min(26, (372 - w) / Math.max(1, n - 1));
    const x0 = (W - ((n - 1) * step + w)) / 2, c = (n - 1) / 2;
    for (let j = 0; j < n; j++)
      out.push({ X: x0 + j * step, Y: 648 - raise + (j - c) ** 2 * 0.8, r: (j - c) * 1.4, k: 1 });
  } else {
    const k = 1.35, w = 88 * k, r1 = Math.ceil(n / 2);
    for (let j = 0; j < n; j++) {
      const fila = j < r1 ? 0 : 1, jj = fila ? j - r1 : j, m = fila ? n - r1 : r1;
      const step = Math.min(56, (372 - w) / Math.max(1, m - 1));
      const x0 = (W - ((m - 1) * step + w)) / 2, c = (m - 1) / 2;
      out.push({ X: x0 + jj * step, Y: (fila ? 652 : 574) - raise + (jj - c) ** 2 * 0.8, r: (jj - c) * 1.2, k });
    }
  }
  return out;
}

/** Ventall d'escriptori: una sola fila, cartes més grans. */
function ventallD(n: number, raise: number, gran: boolean): Pos[] {
  const k = gran ? 1.5 : 1.2, step = gran ? 64 : 56, w = 88 * k;
  const x0 = (WD - ((n - 1) * step + w)) / 2, c = (n - 1) / 2;
  return Array.from({ length: n }, (_, j) => ({
    X: x0 + j * step, Y: 628 - raise + (j - c) ** 2 * 1.2, r: (j - c) * 1.6, k,
  }));
}

/* ───────────────────────── la carta a la taula ────────────────────────── */

function CartaTaula({
  code, pos, z, sel = false, legal = true, trama = false, focus = false,
  classica = false, onClick,
}: {
  code: string; pos: Pos; z: number; sel?: boolean;
  legal?: boolean; trama?: boolean; focus?: boolean; classica?: boolean;
  onClick?: () => void;
}) {
  const pal = code.slice(-1) as Pal;
  const rank = parseInt(code.slice(0, -1), 10);
  const manilla = rank === 9;
  const clicable = !!onClick && legal;
  return (
    <div
      role={clicable ? "button" : "img"}
      aria-label={`${rank} de ${NOM_PAL[pal]}${manilla ? ", manilla" : ""}`}
      aria-disabled={legal ? undefined : true}
      className={`carta-obj${manilla ? " manilla" : ""}`}
      onClick={clicable ? onClick : undefined}
      style={{
        transform: tf(pos),
        zIndex: z,
        boxShadow: sel ? "var(--ombra-carta-alta)" : legal ? "var(--ombra-carta)" : "none",
        opacity: legal ? 1 : "var(--mort)",
        filter: legal ? "none" : "saturate(var(--mort-sat))",
        pointerEvents: clicable ? "auto" : "none",
        cursor: clicable ? "pointer" : "default",
        outline: focus ? "3px solid var(--accent)" : "none",
        outlineOffset: 2,
      }}
    >
      {classica ? <CartaClassica code={code} w={88} /> : <Carta code={code} w={88} />}
      {trama && <div className="carta-trama" style={{ background: TRAMA[pal] }} />}
      <div className="carta-vidre" />
      {manilla && (<><Floro className="floro alt" /><Floro className="floro baix" /></>)}
    </div>
  );
}

/** Floró de cantonada de la manilla: corona oberta, sense text (§6.7). */
function Floro({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
      <path d="M1 7.5h10l.6-6-3 2.6L6 .5 3.4 4.1.4 1.5Z" fill="#C8AA78" />
    </svg>
  );
}

/** Carta en miniatura per a l'historial de bases. */
function MiniCarta({ code, guanya, classica }:
  { code: string; guanya: boolean; classica: boolean }) {
  const pal = code.slice(-1) as Pal;
  const rank = parseInt(code.slice(0, -1), 10);
  if (classica) {
    return (
      <div className={`mini-carta foto${guanya ? " guanya" : ""}`}>
        <CartaClassica code={code} w={44} />
      </div>
    );
  }
  return (
    <div className={`mini-carta${guanya ? " guanya" : ""}`}
      aria-label={`${rank} de ${NOM_PAL[pal]}`}>
      <span>{rank}</span>
      <Simbol pal={pal} w={18} />
    </div>
  );
}

/* ──────────────────────────────── plaques ─────────────────────────────── */

function Placa({ seat, x, y, w, col, juga }: Seient & { juga: boolean }) {
  const R = 21, C = 2 * Math.PI * R;
  return (
    <div className={`placa${juga ? " juga" : ""}`}
      style={{ left: x, top: y, width: w, flexDirection: col ? "column" : "row" }}>
      <div className="avatar" style={{ borderColor: EQUIP[seat] }}>
        {NOMS[seat][0]}
        {juga && (
          <svg className="anella-torn" viewBox="0 0 50 50" aria-hidden="true">
            <circle cx="25" cy="25" r={R} stroke="var(--accent)"
              strokeDasharray={C} strokeDashoffset={C * 0.28} />
          </svg>
        )}
      </div>
      <div className="dades" style={{ alignItems: col ? "center" : "flex-start" }}>
        <span className="nom" style={{ fontSize: col ? 17 : 20 }}>{NOMS[seat]}</span>
        <span className="sota">
          <span className="br">{BR[seat]}</span>
          {!col && <span className="cat">{CAT[seat]}</span>}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────── app ───────────────────────────────── */

export type FiPartida = {
  resum: ResumPartida;
  mansGuanyades: number;
  millorMa: number;
};

export default function Joc({
  perfil, ajustos, config, onFi, onSurt, onAjustos, onRegles,
}: {
  perfil: Perfil;
  ajustos: Ajustos;
  config: Config;
  onFi: (fi: FiPartida) => void;
  onSurt: () => void;
  onAjustos: () => void;
  onRegles: () => void;
}) {
  anomena(perfil.nom);
  const [llest, setLlest] = useState(false);
  const [v, setV] = useState<Vista | null>(null);
  const [marcador, setMarcador] = useState<[number, number]>([0, 0]);
  const [ma, setMa] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const [teclat, setTeclat] = useState(false);
  const [menu, setMenu] = useState(false);
  const [avis, setAvis] = useState("");
  const [escala, setEscala] = useState(1);
  const [ample, setAmple] = useState(() =>
    typeof window === "undefined" ? 1200 : window.innerWidth);
  const [esqOberta, setEsqOberta] = useState(true);
  const [dreOberta, setDreOberta] = useState(true);

  const { gran, trama } = ajustos;

  const taula = useRef<Taula | null>(null);
  const seed = useRef<number>(Math.floor(Math.random() * 1e9));
  const dealer = useRef<number>(0);
  const avisT = useRef<number | undefined>(undefined);
  const escena = useRef<HTMLDivElement | null>(null);
  const mansGuanyades = useRef(0);
  const millorMa = useRef(0);
  const acabada = useRef(false);
  const cartesVistes = useRef(0);
  const basesVistes = useRef(0);

  const escriptori = ample >= AMPLE_ESCRIPTORI;

  /* Mida amb ResizeObserver i no amb `resize`: aquest no salta quan canvia el
     contenidor sense que ho faci la finestra. */
  useLayoutEffect(() => {
    const el = escena.current;
    if (!el) return;
    const mida = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setAmple(w);
      const costats = (esqOberta ? 280 : 56) + (dreOberta ? 300 : 56);
      setEscala(w >= AMPLE_ESCRIPTORI
        ? Math.min(1, Math.min((w - costats - 32) / WD, (h - 56) / HD))
        : Math.min(w / W, h / H));
    };
    mida();
    const ro = new ResizeObserver(mida);
    ro.observe(el);
    return () => ro.disconnect();
  }, [llest, esqOberta, dreOberta]);


  const refresca = useCallback(() => {
    if (taula.current) setV(JSON.parse(taula.current.view(JO)) as Vista);
  }, []);

  const novaMa = useCallback(() => {
    taula.current = new Taula(seed.current, dealer.current, new Uint8Array([JO]));
    while (true) {
      const st = JSON.parse(taula.current.view(JO)) as Vista;
      if (st.phase !== "bidding" && st.phase !== "bidding_delegated") break;
      if (st.turn === JO) break;
      if (!taula.current.canta_bot()) break;
    }
    refresca();
    setAvis(""); setSel(null);
    cartesVistes.current = 0;
    basesVistes.current = 0;
    for (let i = 0; i < 3; i++) setTimeout(() => so.reparteix(), i * 70);
  }, [refresca]);

  useEffect(() => {
    let viu = true;
    arrenca().then(() => { if (viu) { setLlest(true); novaMa(); } });
    return () => { viu = false; };
  }, [novaMa]);

  /* So de la taula: es mira el que ha canviat a la vista, i així sona tant
     si ha jugat una persona com si ha jugat un bot. */
  useEffect(() => {
    if (!v) return;
    const n = v.trick.length;
    if (n > cartesVistes.current) so.carta();
    cartesVistes.current = n;

    if (v.tricksPlayed > basesVistes.current) so.basa();
    basesVistes.current = v.tricksPlayed;
  }, [v]);

  useEffect(() => {
    if (v?.phase === "finished") so.fi();
  }, [v?.phase]);

  /* Els bots juguen sols quan els toca. */
  useEffect(() => {
    if (!v || v.phase !== "playing" || v.turn === JO || !taula.current) return;
    const t = setTimeout(() => { taula.current!.juga_bots(config.nivell); refresca(); }, 620);
    return () => clearTimeout(t);
  }, [v, refresca, config.nivell]);

  const mostra = useCallback((t: string) => {
    window.clearTimeout(avisT.current);
    setAvis(t);
    avisT.current = window.setTimeout(() => setAvis(""), 2200);
  }, []);

  const juga = useCallback((code: string) => {
    taula.current!.juga(JO, code);
    setSel(null);
    refresca();
  }, [refresca]);

  /* Teclat (§14.6): fletxes per recórrer la mà, Enter per jugar, Esc per deixar-ho. */
  useEffect(() => {
    if (!v || v.phase !== "playing" || v.turn !== JO) return;
    const legals = v.hand.filter((c) => v.legal.includes(c));
    if (!legals.length) return;
    const onKey = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement | null)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const i = sel ? legals.indexOf(sel) : -1, d = e.key === "ArrowRight" ? 1 : -1;
        const n = i < 0 ? (d > 0 ? 0 : legals.length - 1) : (i + d + legals.length) % legals.length;
        setSel(legals[n]); setTeclat(true);
      } else if (e.key === "Enter" && sel) { e.preventDefault(); juga(sel); }
      else if (e.key === "Escape") { setSel(null); setTeclat(false); }
      else if (e.key.toLowerCase() === "r") onRegles();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [v, sel, juga, onRegles]);

  if (!llest || !v) {
    return (
      <div className="escena" ref={escena}>
        <div className="tauler" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
          <div className="moble"><div className="feltre" /></div>
          <div className="carrega"><Marca mida={56} /><p>Repartint…</p></div>
        </div>
      </div>
    );
  }

  const cantant = v.phase === "bidding" || v.phase === "bidding_delegated";
  const jugant = v.phase === "playing";
  const emToca = v.turn === JO;
  const trumfo = v.trump ? PAL_DE[v.trump] : null;
  const mult = v.contract ? multiplicador(v.contract) : 1;

  const canta = (q: string) => {
    so.canta();
    taula.current!.canta(JO, q);
    while (true) {
      const st = JSON.parse(taula.current!.view(JO)) as Vista;
      if (st.phase !== "bidding" && st.phase !== "bidding_delegated") break;
      if (st.turn === JO) break;
      if (!taula.current!.canta_bot()) break;
    }
    refresca();
  };

  const comenca = () => { taula.current!.comenca(); refresca(); };
  const contra = () => { so.contro(); taula.current!.contra(v.mayDouble ?? 1); refresca(); };

  /* Tocar una vegada tria; tocar la mateixa carta la juga (§9.5). */
  const toca = (code: string) => {
    if (!emToca || !jugant) return;
    setTeclat(false);
    if (sel !== code) { setSel(code); return; }
    juga(code);
  };

  const seguent = () => {
    const m: [number, number] = [...marcador];
    if (v.result && v.result.winner !== null) {
      m[v.result.winner] += v.result.scored;
      if (v.result.winner === 0) {
        mansGuanyades.current += 1;
        millorMa.current = Math.max(millorMa.current, v.result.scored);
      }
      setMarcador(m);
    }

    // Partida acabada quan un equip arriba a l'objectiu (§1.6).
    if (!acabada.current && (m[0] >= config.objectiu || m[1] >= config.objectiu)) {
      acabada.current = true;
      onFi({
        resum: {
          id: `${Date.now()}`,
          data: new Date().toISOString(),
          nos: m[0], ells: m[1], mans: ma,
          guanyada: m[0] > m[1],
          nivell: config.nivell, objectiu: config.objectiu,
        },
        mansGuanyades: mansGuanyades.current,
        millorMa: millorMa.current,
      });
      return;
    }

    seed.current = Math.floor(Math.random() * 1e9);
    dealer.current = (dealer.current + 1) % 4;
    setMa((n) => n + 1);
    novaMa();
  };

  const J = {
    v, ma, sel, teclat, trama, gran, classica: ajustos.baralla === "classica",
    emToca, jugant, cantant, trumfo, mult, avis,
    marcador, toca, mostra, canta, comenca, contra, seguent,
    obreRegles: onRegles, obreMenu: () => setMenu(true), objectiu: config.objectiu,
  };

  return (
    <div className={`escena${escriptori ? " ample" : ""}`} ref={escena}>
      {escriptori
        ? <Escriptori {...J} escala={escala}
            esqOberta={esqOberta} dreOberta={dreOberta}
            setEsqOberta={setEsqOberta} setDreOberta={setDreOberta} />
        : <Mobil {...J} escala={escala} />}

      {menu && (
        <div className="capa-modal">
          <div className="rerefons" onClick={() => setMenu(false)} />
          <div className="full" style={{ height: 400 }}>
            <div className="nansa" />
            <div className="titol-full">
              <h2>Menú</h2>
              <span className="sub">
                Partida a {config.objectiu} · {marcador[0]} – {marcador[1]} · mà {ma}
              </span>
            </div>
            <div className="amples">
              <button className="opcio-ample" onClick={() => setMenu(false)}>
                <span>Continua la partida</span>
              </button>
              <button className="opcio-ample" onClick={() => { setMenu(false); onRegles(); }}>
                <span>Regles</span><span className="detall">jerarquia i obligacions</span>
              </button>
              <button className="opcio-ample" onClick={() => { setMenu(false); onAjustos(); }}>
                <span>Ajustos</span><span className="detall">llum, mida i trama</span>
              </button>
              <button className="opcio-ample buit" onClick={onSurt}>
                <span>Deixa la partida</span>
                <span className="detall">es perd el que portes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Joc = {
  v: Vista; ma: number; sel: string | null; teclat: boolean;
  trama: boolean; gran: boolean; classica: boolean; emToca: boolean; jugant: boolean; cantant: boolean;
  trumfo: Pal | null; mult: number; avis: string; marcador: [number, number];
  toca: (c: string) => void; mostra: (t: string) => void;
  canta: (q: string) => void; comenca: () => void; contra: () => void; seguent: () => void;
  obreRegles: () => void; obreMenu: () => void; objectiu: number;
  escala: number;
};

/* ─────────────────────────────── mòbil ────────────────────────────────── */

function Mobil(J: Joc) {
  const { v, gran, jugant, emToca, sel, trama, classica, teclat, toca, mostra, escala } = J;
  const pos = ventallM(v.hand.length, jugant && emToca ? 8 : 0, gran);
  const iSel = sel ? v.hand.indexOf(sel) : -1;

  return (
    <div className="tauler" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
      <BarraMarcador J={J} />
      <BarraContracte J={J} />

      <div className="moble"><div className="feltre" /></div>
      {v.phase === "finished" && <div className="enfosqueix" />}

      {PLACA_M.map((p) => (
        <Placa key={p.seat} {...p} juga={v.turn === p.seat && (jugant || J.cantant)} />
      ))}

      {jugant && emToca && (
        <div className="zona-morta" onClick={() => mostra(missatgeIllegal(v))} />
      )}

      {v.trick.map((p) => (
        <CartaTaula key={`b${p.seat}`} code={p.card} z={p.seat + 1} trama={trama} classica={classica}
          pos={{ ...BASA_M[p.seat], k: KB }} />
      ))}

      {v.hand.map((code, i) => {
        const legal = !jugant || !emToca || v.legal.includes(code);
        const p = { ...pos[i] };
        if (sel === code) p.Y -= 14;
        if (iSel >= 0 && i === iSel - 1) p.X -= 4;
        if (iSel >= 0 && i === iSel + 1) p.X += 4;
        return (
          <CartaTaula key={code} code={code} pos={p} z={10 + i} sel={sel === code}
            legal={legal} trama={trama} classica={classica} focus={teclat && sel === code}
            onClick={() => toca(code)} />
        );
      })}

      <div className="llum-torn" style={{ opacity: jugant && emToca ? 1 : 0 }} />
      <div className="pindola" aria-live="polite"
        style={{ top: gran ? 520 : 572, opacity: J.avis ? 1 : 0 }}>{J.avis || " "}</div>

      <Fulls J={J} controTop={gran ? 480 : 552} />
    </div>
  );
}

/* ──────────────────────────── escriptori ──────────────────────────────── */

function Escriptori(J: Joc & {
  esqOberta: boolean; dreOberta: boolean;
  setEsqOberta: (b: boolean) => void; setDreOberta: (b: boolean) => void;
}) {
  const { v, gran, jugant, emToca, sel, trama, classica, teclat, toca, mostra, escala } = J;
  const pos = ventallD(v.hand.length, jugant && emToca ? 8 : 0, gran);
  const iSel = sel ? v.hand.indexOf(sel) : -1;
  const bases = [...v.tricks].reverse().slice(0, 4);

  return (
    <div className="escriptori">
      {/* capçalera */}
      <header className="cap" aria-live="polite">
        <span className="marca"><Marca mida={36} /><b>Manilla</b></span>
        <div className="punts-cap">
          <span><i className="etiqueta">Nosaltres</i><b className="punts">{J.marcador[0]}</b></span>
          <span><i>mà</i><b className="ma-n">{J.ma}</b></span>
          <span><i className="etiqueta">Ells</i><b className="punts ells">{J.marcador[1]}</b></span>
        </div>
        <div className="cap-dreta">
          <button className="rodo petit" onClick={() => J.obreMenu()} aria-label="Ajustos">☰</button>
          <button className="rodo" onClick={() => J.obreRegles()} aria-label="Regles (R)">?</button>
        </div>
      </header>

      <div className="cos">
        {/* columna esquerra: bases de la mà */}
        {J.esqOberta ? (
          <aside className="columna esq">
            <div className="cap-col">
              <h3>Bases de la mà</h3>
              <button className="rodo pla" onClick={() => J.setEsqOberta(false)}
                aria-label="Plega la columna">‹</button>
            </div>
            <div className="llista-bases">
              {bases.length === 0 && <p className="buit">Encara no s'ha tancat cap basa.</p>}
              {bases.map((b, i) => (
                <div key={v.tricks.length - i} className="base">
                  <div className="base-cap">
                    <span>Base {v.tricks.length - i}</span>
                    <span className="guanya"
                      style={{ borderBottomColor: EQUIP[b.winner ?? 0] }}>
                      {NOMS[b.winner ?? 0]}
                    </span>
                  </div>
                  <div className="base-cartes">
                    {b.plays.map((p) => (
                      <MiniCarta key={p.seat} code={p.card} guanya={p.seat === b.winner} classica={classica} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        ) : (
          <div className="rail esq">
            <button className="rodo pla" onClick={() => J.setEsqOberta(true)}
              aria-label="Obre l'historial">›</button>
          </div>
        )}

        {/* centre: la taula */}
        <main className="joc">
          <div className="pista" style={{ transform: `translateX(-50%) scale(${escala})` }}>
            <div className="pastilla-contracte">
              {J.trumfo && <Simbol pal={J.trumfo} w={20} />}
              <span className="nom">
                {v.contract ? (v.contract.trump ? capitala(v.contract.trump) : "Botifarra") : "Trumfo per cantar"}
              </span>
              {v.contract && <span className="mult">×{J.mult}</span>}
              <span className="qui">
                {v.contract
                  ? (v.contract.declarer === JO ? "cantaves tu" : `canta: ${NOMS[v.contract.declarer]}`)
                  : (emToca ? "cantes tu" : `canta ${NOMS[v.turn]}`)}
              </span>
            </div>

            <div className="moble d"><div className="feltre" /></div>
            {v.phase === "finished" && <div className="enfosqueix" />}

            {PLACA_D.map((p) => (
              <Placa key={p.seat} {...p} juga={v.turn === p.seat && (jugant || J.cantant)} />
            ))}

            {jugant && emToca && (
              <div className="zona-morta d" onClick={() => mostra(missatgeIllegal(v))} />
            )}

            {v.trick.map((p) => (
              <CartaTaula key={`b${p.seat}`} code={p.card} z={p.seat + 1} trama={trama} classica={classica}
                pos={{ ...BASA_D[p.seat], k: KD }} />
            ))}

            {v.hand.map((code, i) => {
              const legal = !jugant || !emToca || v.legal.includes(code);
              const p = { ...pos[i] };
              if (sel === code) p.Y -= 14;
              if (iSel >= 0 && i === iSel - 1) p.X -= 4;
              if (iSel >= 0 && i === iSel + 1) p.X += 4;
              return (
                <CartaTaula key={code} code={code} pos={p} z={10 + i} sel={sel === code}
                  legal={legal} trama={trama} classica={classica} focus={teclat && sel === code}
                  onClick={() => toca(code)} />
              );
            })}

            <div className="pindola" aria-live="polite"
              style={{ top: 596, opacity: J.avis ? 1 : 0 }}>{J.avis || " "}</div>

            <Fulls J={J} controTop={560} />
          </div>
          <div className="llum-torn" style={{ opacity: jugant && emToca ? 1 : 0 }} />
        </main>

        {/* columna dreta: perfil i anàlisi */}
        {J.dreOberta ? (
          <aside className="columna dre">
            <div className="cap-col">
              <button className="rodo pla" onClick={() => J.setDreOberta(false)}
                aria-label="Plega la columna">›</button>
              <h3>El teu perfil</h3>
            </div>
            <div className="perfil">
              <div className="avatar gran" style={{ borderColor: EQUIP[0] }}>{NOMS[0][0]}</div>
              <div className="dades">
                <span className="nom">{NOMS[0]}</span>
                <span className="cat">{CAT[0]}</span>
              </div>
              <span className="br">{BR[0]}</span>
            </div>
            <div className="progres">
              <div className="barra"><i style={{ width: "76%" }} /></div>
              <span>Et falten <b>12</b> punts de BR per a Mestre</span>
            </div>
            <div className="targeta-analisi">
              <span className="titol">Anàlisi de la mà {J.ma}</span>
              <div className="punts-analisi">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className="punt"
                    title={`Base ${i + 1}`}
                    data-jugada={i < v.tricks.length} />
                ))}
              </div>
              <div className="llegenda">
                <span><i style={{ background: "var(--ok)" }} />òptima</span>
                <span><i style={{ background: "var(--neutre)" }} />acceptable</span>
                <span><i style={{ background: "var(--avis)" }} />pèrdua</span>
              </div>
              <p>
                La qualificació de cada jugada arriba amb el motor d'anàlisi
                (ISMCTS, fase F1). De moment només s'hi marquen les bases jugades.
              </p>
              <button className="b-secundari" disabled>Obre l'anàlisi</button>
            </div>
          </aside>
        ) : (
          <div className="rail dre">
            <button className="rodo pla" onClick={() => J.setDreOberta(true)}
              aria-label="Obre el perfil">‹</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── barres compartides ─────────────────────────── */

function BarraMarcador({ J }: { J: Joc }) {
  return (
    <div className="marcador" aria-live="polite">
      <div className="equip">
        <span className="etiqueta">Nosaltres</span>
        <span className="punts">{J.marcador[0]}</span>
      </div>
      <div className="equip dre">
        <span className="etiqueta">Ells</span>
        <span className="punts ells">{J.marcador[1]}</span>
      </div>
      <button className="rodo petit" onClick={() => J.obreMenu()} aria-label="Ajustos">☰</button>
      <button className="rodo" onClick={() => J.obreRegles()} aria-label="Regles">?</button>
    </div>
  );
}

function BarraContracte({ J }: { J: Joc }) {
  const { v, trumfo, mult, ma, emToca } = J;
  return (
    <div className="contracte">
      {v.contract ? (
        <>
          {trumfo && <Simbol pal={trumfo} w={20} />}
          <span className="nom">{v.contract.trump ? capitala(v.contract.trump) : "Botifarra"}</span>
          <span className="mult">×{mult}</span>
          <span className="qui">
            mà {ma} · {v.contract.declarer === JO ? "cantaves tu" : `cantava ${NOMS[v.contract.declarer]}`}
          </span>
        </>
      ) : (
        <>
          <span className="nom">Trumfo per cantar</span>
          <span className="qui">mà {ma} · {emToca ? "cantes tu" : `canta ${NOMS[v.turn]}`}</span>
        </>
      )}
    </div>
  );
}

/* ─────────── fulls: contro, cantar, final de mà i ajustos ─────────────── */

function Fulls({ J, controTop }: { J: Joc; controTop: number }) {
  const { v, ma, mult, emToca, cantant } = J;
  return (
    <>
      {v.phase === "doubling" && (
        <div className="barra-contro" style={{ top: controTop }}>
          <svg viewBox="0 0 40 40" width="40" height="40" style={{ flex: "none" }} aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(26,24,20,.2)" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#1A1814" strokeWidth="4"
              strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="32"
              transform="rotate(-90 20 20)" />
          </svg>
          <div className="text">
            <b>{v.contract && v.contract.declarer === JO ? "Cantaves tu" : `${NOMS[v.contract?.declarer ?? 0]} canta`}</b>
            <span>
              {v.contract?.trump ? capitala(v.contract.trump) : "Botifarra"}{" "}
              <span style={{ fontFamily: "var(--f-num)", fontWeight: 600 }}>×{mult}</span>
            </span>
          </div>
          <button className="b-fosc" onClick={J.contra}>Contro</button>
          <button className="b-buit" onClick={J.comenca}>Passo</button>
        </div>
      )}

      {cantant && emToca && (
        <>
          <div className="rerefons" />
          <div className="full" style={{ height: 490 }}>
            <div className="nansa" />
            <div className="titol-full">
              <h2>{v.phase === "bidding_delegated" ? "T'han delegat" : "Tria el trumfo"}</h2>
              <span className="sub">
                {v.phase === "bidding_delegated"
                  ? `El company t'ho passa · has de cantar · mà ${ma}`
                  : `Cantes tu · mà ${ma}`}
              </span>
            </div>
            <div className="reixa-pals">
              {(["oros", "copes", "espases", "bastos"] as const).map((p) => {
                const pal = PAL_DE[p];
                const n = v.hand.filter((c) => c.endsWith(pal)).length;
                return (
                  <button key={p} className="opcio-pal" onClick={() => J.canta(p)}
                    aria-label={`${capitala(p)}, en tens ${n}`}>
                    <Simbol pal={pal} w={28} />
                    <span className="nom">{capitala(p)}</span>
                    <span className="compte">{n}</span>
                  </button>
                );
              })}
            </div>
            <div className="amples">
              <button className="opcio-ample" onClick={() => J.canta("botifarra")}>
                <span>Botifarra</span>
                <span className="detall">sense trumfo <b>×2</b></span>
              </button>
              {v.phase === "bidding" && (
                <button className="opcio-ample buit" onClick={() => J.canta("delegar")}>
                  <span>Delegar</span>
                  <span className="detall">canta {NOMS[2]}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {v.phase === "finished" && v.result && (
        <>
          <div className="rerefons" style={{ background: "rgba(0,0,0,.25)" }} />
          <div className="full" style={{ height: 560 }}>
            <div className="nansa" />
            <div className="titol-full">
              <h2>{v.result.winner === 0 ? "Guanyeu la mà"
                : v.result.winner === 1 ? "La guanyen ells" : "Empat a 36"}</h2>
              <span className="sub">
                Mà {ma} · {v.contract?.trump ? capitala(v.contract.trump) : "Botifarra"} ×{v.result.multiplier}
              </span>
            </div>
            <div className="desglos">
              {desglossa(v.result).map(([et, val, regla], i) => (
                <div key={et} className={`linia${regla ? " regla" : ""}`}
                  style={{ animationDelay: `${i * 90}ms` }}>
                  <span>{et}</span><b>{val}</b>
                </div>
              ))}
              <div className="total" style={{ animationDelay: `${5 * 90 + 240}ms` }}>
                <span>Punts</span>
                <b>{v.result.scored > 0 ? `+${v.result.scored}` : v.result.scored}</b>
              </div>
            </div>
            <div className="botons">
              <button className="b-principal" onClick={J.seguent}>Una altra</button>
              <button className="b-secundari" onClick={() => J.obreRegles()}>Per què?</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ──────────────────────────────── ajudes ──────────────────────────────── */

const capitala = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function multiplicador(c: { trump: string | null; doubling: string }): number {
  const base = { none: 1, contro: 2, recontro: 4, sant_vicenc: 8, barraca: 16 }[c.doubling] ?? 1;
  return c.trump ? base : base * 2;
}

/** El desglossament que la gent vol comptar (§9.6). */
function desglossa(r: { points: number[]; winner: number | null; multiplier: number }):
  [string, string, boolean?][] {
  const guanyador = r.winner ?? 0;
  const dif = r.points[guanyador] - 36;
  return [
    ["Els vostres punts", String(r.points[0])],
    ["Els seus punts", String(r.points[1])],
    ["Total de la mà", String(r.points[0] + r.points[1]), true],
    ["Llindar", "36"],
    ["Diferència", dif >= 0 ? `+${dif}` : String(dif)],
    ["Multiplicador", `×${r.multiplier}`],
  ];
}

/** Per què no pots jugar aquesta carta. Un missatge concret per obligació. */
function missatgeIllegal(v: Vista): string {
  const lead = v.trick[0]?.card;
  if (!lead) return "Ara no et toca.";
  const pal = lead.slice(-1) as Pal;
  const enTinc = v.hand.some((c) => c.endsWith(pal));
  if (enTinc) {
    const delPal = v.hand.filter((c) => c.endsWith(pal)).length;
    const potMatar = v.legal.every((c) => c.endsWith(pal)) && v.legal.length < delPal;
    return potMatar ? "Has de matar si pots" : `Has de jugar ${NOM_PAL[pal]}`;
  }
  return v.trump ? `No tens ${NOM_PAL[pal]}: has de fallar` : `Has de jugar ${NOM_PAL[pal]}`;
}
