import { useCallback, useEffect, useRef, useState } from "react";
import init, { Taula } from "./core/botifarra_core";
import { Carta, NOM_PAL, type Pal } from "./Carta";
import Regles from "./Regles";

const JO = 0;                       // el jugador humà seu al lloc 0
const NOMS = ["Tu", "Rival", "Company", "Rival"];

type Vista = {
  phase: string;
  turn: number;
  dealer: number;
  hand: string[];
  counts: number[];
  trick: { seat: number; card: string }[];
  trump: string | null;
  contract: { trump: string | null; declarer: number; doubling: string } | null;
  legal: string[];
  tricksPlayed: number;
  mayDouble: number | null;
  result: { points: number[]; winner: number | null; scored: number; multiplier: number } | null;
};

const PAL_DE: Record<string, Pal> = { oros: "o", copes: "c", espases: "e", bastos: "b" };

export default function App() {
  const [llest, setLlest] = useState(false);
  const [v, setV] = useState<Vista | null>(null);
  const [regles, setRegles] = useState(false);
  const [marcador, setMarcador] = useState<[number, number]>([0, 0]);
  const [avis, setAvis] = useState("");
  const taula = useRef<Taula | null>(null);
  const seed = useRef<number>(Math.floor(Math.random() * 1e9));
  const dealer = useRef<number>(0);

  const refresca = useCallback(() => {
    if (taula.current) setV(JSON.parse(taula.current.view(JO)) as Vista);
  }, []);

  const novaMa = useCallback(() => {
    taula.current = new Taula(seed.current, dealer.current, new Uint8Array([JO]));
    // Si no li toca cantar al jugador, canten els bots.
    while (true) {
      const st = JSON.parse(taula.current.view(JO)) as Vista;
      if (st.phase !== "bidding" && st.phase !== "bidding_delegated") break;
      if (st.turn === JO) break;
      if (!taula.current.canta_bot()) break;
    }
    refresca();
    setAvis("");
  }, [refresca]);

  useEffect(() => {
    init().then(() => { setLlest(true); novaMa(); });
  }, [novaMa]);

  // Els bots juguen sols quan els toca.
  useEffect(() => {
    if (!v || v.phase !== "playing" || v.turn === JO || !taula.current) return;
    const t = setTimeout(() => { taula.current!.juga_bots(); refresca(); }, 620);
    return () => clearTimeout(t);
  }, [v, refresca]);

  if (!llest || !v) {
    return <div className="taula"><div className="zona"><p className="basa-buida">Repartint…</p></div></div>;
  }

  const cantant = v.phase === "bidding" || v.phase === "bidding_delegated";
  const emToca = v.turn === JO;
  const trumfo = v.trump ? PAL_DE[v.trump] : null;

  const canta = (q: string) => { taula.current!.canta(JO, q); 
    while (true) {
      const st = JSON.parse(taula.current!.view(JO)) as Vista;
      if (st.phase !== "bidding" && st.phase !== "bidding_delegated") break;
      if (st.turn === JO) break;
      if (!taula.current!.canta_bot()) break;
    }
    refresca();
  };

  const comenca = () => { taula.current!.comenca(); refresca(); };

  const juga = (code: string) => {
    if (!v.legal.includes(code)) {
      setAvis(missatgeIllegal(v));
      setTimeout(() => setAvis(""), 2600);
      return;
    }
    taula.current!.juga(JO, code);
    refresca();
  };

  const seguent = () => {
    if (v.result?.winner !== null && v.result) {
      const m: [number, number] = [...marcador];
      m[v.result.winner!] += v.result.scored;
      setMarcador(m);
    }
    seed.current = Math.floor(Math.random() * 1e9);
    dealer.current = (dealer.current + 1) % 4;
    novaMa();
  };

  return (
    <div className="taula">
      {/* ── barra: marcador i contracte sempre visibles ── */}
      <div className="barra">
        <div>
          <div className="etiqueta">Partida a 101</div>
          <div className="marcador">
            <b className="nos">{marcador[0]}</b>
            <span className="sep">–</span>
            <b className="ells">{marcador[1]}</b>
          </div>
        </div>

        <div className="contracte">
          {v.contract ? (
            <>
              <span>{v.contract.trump
                ? <><b style={{ color: "var(--paper)" }}>{v.contract.trump}</b></>
                : <b style={{ color: "var(--paper)" }}>botifarra</b>}</span>
              {trumfo && <Carta code={`9${trumfo}`} w={19} />}
              <span className="mono mult">×{multiplicador(v.contract)}</span>
            </>
          ) : <span className="etiqueta">cantant…</span>}
        </div>

        <button className="btn-regles" onClick={() => setRegles(true)} aria-label="Regles">?</button>
      </div>

      {/* ── zona de joc ── */}
      <div className="zona">
        <div className="rivals">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`seient ${s === 1 ? "dre" : s === 2 ? "dalt" : "esq"}`}>
              <div className="dors-mini">
                {Array.from({ length: Math.min(v.counts[s], 12) }, (_, i) => <i key={i} />)}
              </div>
              <div className={`nom ${v.turn === s ? "torn" : ""}`}>{NOMS[s]}</div>
            </div>
          ))}
        </div>

        <div className="basa">
          {v.trick.length === 0 && v.phase === "playing" && (
            <div className="basa-buida" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              {emToca ? "Surts tu" : `Surt ${NOMS[v.turn]}`}
            </div>
          )}
          {v.trick.map((p) => (
            <div key={p.seat} className={`c s${p.seat}`}>
              <Carta code={p.card} w={60} />
            </div>
          ))}
          {emToca && v.phase === "playing" && <div className="anella" style={{ bottom: -6, left: "50%", marginLeft: -32 }} />}
        </div>
      </div>

      {/* ── la meva mà ── */}
      <div className="ma">
        {v.hand.map((code) => {
          const jugable = v.phase === "playing" && emToca && v.legal.includes(code);
          const morta = v.phase === "playing" && emToca && !jugable;
          return (
            <div key={code} className={`slot ${jugable ? "jugable" : ""} ${morta ? "morta" : ""}`}>
              <Carta code={code} w={68} morta={morta} onClick={() => juga(code)} />
            </div>
          );
        })}
      </div>

      {/* ── peu ── */}
      <div className="peu">
        {v.phase === "doubling" ? (
          <>
            <button className="btn ghost" style={{ flex: 1 }}
              onClick={() => { taula.current!.contra(v.mayDouble ?? 1); refresca(); }}>
              Contro
            </button>
            <button className="btn" style={{ flex: 1 }} onClick={comenca}>Comencem</button>
          </>
        ) : v.phase === "finished" ? (
          <button className="btn" style={{ width: "100%" }} onClick={seguent}>Mà següent</button>
        ) : (
          <div className="avis">
            {avis ? <b>{avis}</b>
              : v.phase === "playing"
                ? (emToca ? "Et toca" : `Juga ${NOMS[v.turn]}…`)
                : "Cantant el trumfo"}
          </div>
        )}
      </div>

      {/* ── cantar ── */}
      {cantant && v.turn === JO && (
        <div className="rerefons">
          <div className="full">
            <h2>{v.phase === "bidding_delegated" ? "T'han delegat" : "Canta el trumfo"}</h2>
            <p className="sub">
              {v.phase === "bidding_delegated"
                ? "El company t'ha passat la decisió. Has de cantar: no pots tornar a delegar."
                : "Tries el pal de trumfo, cantes botifarra (sense trumfo, dobla) o ho deixes al company."}
            </p>
            <div className="opcions">
              {(["oros", "copes", "espases", "bastos"] as const).map((p) => {
                const pal = PAL_DE[p];
                const n = v.hand.filter((c) => c.endsWith(pal)).length;
                return (
                  <button key={p} className="opcio" onClick={() => canta(p)}>
                    <Carta code={`9${pal}`} w={26} />
                    <span style={{ textTransform: "capitalize" }}>{p}</span>
                    <span className="n">{n}</span>
                  </button>
                );
              })}
              <button className="opcio ample" onClick={() => canta("botifarra")}>
                <span>Botifarra</span>
                <span className="n">sense trumfo · ×2</span>
              </button>
              {v.phase === "bidding" && (
                <button className="opcio ample" onClick={() => canta("delegar")}>
                  <span>Delego al company</span>
                  <span className="n">haurà de cantar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── resultat ── */}
      {v.phase === "finished" && v.result && (
        <div className="rerefons">
          <div className="full">
            <h2>{v.result.winner === 0 ? "Heu guanyat la mà" : v.result.winner === 1 ? "L'han guanyada ells" : "Empat a 36"}</h2>
            <p className="sub">Comptem-ho.</p>
            <table className="desglos">
              <tbody>
                <tr><td>Els vostres punts</td><td>{v.result.points[0]}</td></tr>
                <tr><td>Els seus punts</td><td>{v.result.points[1]}</td></tr>
                <tr><td>Llindar</td><td>36</td></tr>
                <tr><td>Multiplicador</td><td>×{v.result.multiplier}</td></tr>
                <tr><td>S'anoten</td><td>{v.result.scored}</td></tr>
              </tbody>
            </table>
            <button className="btn" style={{ width: "100%" }} onClick={seguent}>Mà següent</button>
          </div>
        </div>
      )}

      {regles && <Regles onClose={() => setRegles(false)} />}
    </div>
  );
}

function multiplicador(c: { trump: string | null; doubling: string }): number {
  const base = { none: 1, contro: 2, recontro: 4, sant_vicenc: 8, barraca: 16 }[c.doubling] ?? 1;
  return c.trump ? base : base * 2;
}

/** Per què no pots jugar aquesta carta. §14.3: impedir l'error i explicar-lo. */
function missatgeIllegal(v: Vista): string {
  const lead = v.trick[0]?.card;
  if (!lead) return "Ara no et toca.";
  const pal = lead.slice(-1) as Pal;
  const enTinc = v.hand.some((c) => c.endsWith(pal));
  if (enTinc) {
    const potMatar = v.legal.every((c) => c.endsWith(pal));
    return potMatar && v.legal.length < v.hand.filter((c) => c.endsWith(pal)).length
      ? `Has de matar: juga una carta que superi la que va guanyant.`
      : `Has de servir ${NOM_PAL[pal]}.`;
  }
  return v.trump ? `No tens ${NOM_PAL[pal]}: has de fallar amb trumfo.` : `Has de servir ${NOM_PAL[pal]}.`;
}
