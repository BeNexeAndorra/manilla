/**
 * Baralla espanyola de disseny original, il·lustrada per a Manilla.
 *
 * Estil tradicional: emblemes ornamentats, figures de cort dibuixades, orla
 * doble amb floritures i paper envellit. Cap traç prové de cap edició
 * comercial; els quatre pals —moneda, copa, espasa i bastó— són iconografia
 * de domini públic amb segles d'història, i aquí tenen dibuix propi (§16.2).
 */

export type Pal = "o" | "c" | "e" | "b";

export const COLOR: Record<Pal, string> = {
  o: "#B07D0A", c: "#9E2B2B", e: "#2B4568", b: "#43632B",
};
const FOSC: Record<Pal, string> = {
  o: "#7A5406", c: "#6E1C1C", e: "#1B2E47", b: "#2C431B",
};
const CLAR: Record<Pal, string> = {
  o: "#E3B43C", c: "#C95A5A", e: "#5A7DA8", b: "#7A9C57",
};
export const NOM_PAL: Record<Pal, string> = {
  o: "oros", c: "copes", e: "espases", b: "bastos",
};

/* ───────────────────────── emblemes ───────────────────────── */
/* Cada emblema viu en un quadrat 0..100 i s'escala allà on calgui. */

function Oro({ p }: { p: Pal }) {
  const c = COLOR[p], d = FOSC[p], l = CLAR[p];
  return (
    <g>
      <circle cx="50" cy="50" r="46" fill={d} />
      <circle cx="50" cy="50" r="43" fill={c} />
      <circle cx="50" cy="50" r="43" fill="none" stroke={d} strokeWidth="1.5" />
      {/* perlat de la vora */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 28;
        return <circle key={i} cx={50 + Math.cos(a) * 38} cy={50 + Math.sin(a) * 38} r="2.1" fill={l} />;
      })}
      <circle cx="50" cy="50" r="31" fill="none" stroke={d} strokeWidth="2" />
      <circle cx="50" cy="50" r="27" fill={l} opacity=".35" />
      {/* rosassa de vuit pètals */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <ellipse key={i} cx={50 + Math.cos(a) * 15} cy={50 + Math.sin(a) * 15}
            rx="9" ry="5" fill={d} opacity=".55"
            transform={`rotate(${(i * 45)} ${50 + Math.cos(a) * 15} ${50 + Math.sin(a) * 15})`} />
        );
      })}
      <circle cx="50" cy="50" r="9" fill={d} />
      <circle cx="50" cy="50" r="5" fill={l} />
      {/* lluïssor */}
      <path d="M26 30 a34 34 0 0 1 22 -12" fill="none" stroke="#fff" strokeWidth="3" opacity=".3" strokeLinecap="round" />
    </g>
  );
}

function Copa({ p }: { p: Pal }) {
  const c = COLOR[p], d = FOSC[p], l = CLAR[p];
  return (
    <g>
      {/* peu */}
      <ellipse cx="50" cy="93" rx="26" ry="5.5" fill={d} />
      <ellipse cx="50" cy="90" rx="24" ry="5" fill={c} />
      <path d="M38 88 q12 -7 24 0" fill="none" stroke={d} strokeWidth="1.5" />
      {/* tija amb nus */}
      <path d="M45 88 q5 -14 0 -22 h10 q-5 8 0 22 z" fill={c} stroke={d} strokeWidth="1.2" />
      <ellipse cx="50" cy="70" rx="9" ry="6" fill={l} stroke={d} strokeWidth="1.2" />
      <ellipse cx="50" cy="69" rx="5" ry="3" fill={c} opacity=".6" />
      {/* copa */}
      <path d="M22 26 h56 v10 a28 28 0 0 1 -56 0 z" fill={c} stroke={d} strokeWidth="1.8" />
      {/* gallons */}
      {[-18, -9, 0, 9, 18].map((dx, i) => (
        <path key={i} d={`M${50 + dx} 38 q${dx / 3} 14 0 22`} fill="none" stroke={d} strokeWidth="1.2" opacity=".55" />
      ))}
      {/* llavi */}
      <rect x="20" y="22" width="60" height="7" rx="3" fill={l} stroke={d} strokeWidth="1.5" />
      <rect x="24" y="24" width="52" height="2" rx="1" fill="#fff" opacity=".35" />
      {/* nanses */}
      <path d="M22 32 q-11 6 -3 16" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M78 32 q11 6 3 16" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
      {/* reflex */}
      <path d="M32 34 q-2 12 4 20" fill="none" stroke="#fff" strokeWidth="2.6" opacity=".28" strokeLinecap="round" />
    </g>
  );
}

function Espasa({ p }: { p: Pal }) {
  const c = COLOR[p], d = FOSC[p], l = CLAR[p];
  return (
    <g>
      {/* fulla */}
      <path d="M50 4 l8 13 v50 h-16 v-50 z" fill={l} stroke={d} strokeWidth="1.6" />
      <path d="M50 7 v58" stroke={d} strokeWidth="1.2" opacity=".5" />
      <path d="M45 14 l5 -8 l5 8" fill="none" stroke={d} strokeWidth="1" opacity=".45" />
      {/* guarda amb quillons corbs */}
      <path d="M20 70 q30 -9 60 0 q-30 9 -60 0 z" fill={c} stroke={d} strokeWidth="1.6" />
      <path d="M20 70 q-5 -7 2 -10" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 70 q5 -7 -2 -10" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" />
      {/* llaç central */}
      <circle cx="50" cy="70" r="5.5" fill={l} stroke={d} strokeWidth="1.3" />
      {/* puny amb anells */}
      <rect x="45" y="75" width="10" height="16" rx="3" fill={c} stroke={d} strokeWidth="1.3" />
      {[78, 82, 86].map((y) => (
        <line key={y} x1="45.5" y1={y} x2="54.5" y2={y} stroke={d} strokeWidth="1" opacity=".6" />
      ))}
      {/* pom */}
      <ellipse cx="50" cy="94" rx="8" ry="6" fill={l} stroke={d} strokeWidth="1.5" />
      <circle cx="50" cy="94" r="2.6" fill={d} />
      {/* reflex de la fulla */}
      <path d="M45 18 v44" stroke="#fff" strokeWidth="2" opacity=".35" strokeLinecap="round" />
    </g>
  );
}

function Basto({ p }: { p: Pal }) {
  const c = COLOR[p], d = FOSC[p], l = CLAR[p];
  return (
    <g>
      {/* porra: gruixuda a dalt, prima a baix */}
      <path d="M62 8 q13 10 8 22 l-30 58 q-4 8 -12 6 q-8 -3 -6 -11 l26 -62 q4 -11 14 -13 z"
        fill={c} stroke={d} strokeWidth="1.8" strokeLinejoin="round" />
      {/* vetes de la fusta */}
      <path d="M58 16 l-24 58" stroke={d} strokeWidth="1" opacity=".45" />
      <path d="M64 20 l-24 56" stroke={d} strokeWidth="1" opacity=".3" />
      <path d="M54 14 l-22 56" stroke={l} strokeWidth="1.4" opacity=".4" />
      {/* nusos de branques tallades */}
      <ellipse cx="60" cy="27" rx="7" ry="4.5" fill={l} stroke={d} strokeWidth="1.3" transform="rotate(-25 60 27)" />
      <ellipse cx="60" cy="27" rx="3" ry="1.8" fill={d} transform="rotate(-25 60 27)" />
      <ellipse cx="48" cy="52" rx="6" ry="4" fill={l} stroke={d} strokeWidth="1.2" transform="rotate(-25 48 52)" />
      <ellipse cx="48" cy="52" rx="2.4" ry="1.4" fill={d} transform="rotate(-25 48 52)" />
      <ellipse cx="38" cy="74" rx="5" ry="3.4" fill={l} stroke={d} strokeWidth="1.1" transform="rotate(-25 38 74)" />
      {/* cap arrodonit */}
      <path d="M62 8 q10 2 8 14" fill="none" stroke={l} strokeWidth="2.4" opacity=".55" strokeLinecap="round" />
    </g>
  );
}

function Emblema({ pal }: { pal: Pal }) {
  switch (pal) {
    case "o": return <Oro p={pal} />;
    case "c": return <Copa p={pal} />;
    case "e": return <Espasa p={pal} />;
    case "b": return <Basto p={pal} />;
  }
}

/* ───────────────────────── figures de cort ───────────────────────── */

function Rei({ pal }: { pal: Pal }) {
  const c = COLOR[pal], d = FOSC[pal], l = CLAR[pal];
  return (
    <g>
      {/* mantell */}
      <path d="M22 110 q4 -40 28 -44 q24 4 28 44 z" fill={c} stroke={d} strokeWidth="1.6" />
      <path d="M50 66 v44" stroke={d} strokeWidth="1.2" opacity=".5" />
      <path d="M36 74 q-4 20 -3 36 M64 74 q4 20 3 36" fill="none" stroke={d} strokeWidth="1" opacity=".4" />
      {/* coll i cara */}
      <path d="M42 62 h16 v8 h-16 z" fill="#E8C9A0" stroke={d} strokeWidth="1.2" />
      <ellipse cx="50" cy="50" rx="13" ry="15" fill="#F0D5AE" stroke={d} strokeWidth="1.4" />
      {/* barba */}
      <path d="M38 52 q2 20 12 20 q10 0 12 -20 q-12 8 -24 0 z" fill={l} stroke={d} strokeWidth="1.2" />
      {/* trets */}
      <circle cx="45" cy="47" r="1.6" fill={d} />
      <circle cx="55" cy="47" r="1.6" fill={d} />
      <path d="M41 42 q4 -2 7 0 M52 42 q4 -2 7 0" fill="none" stroke={d} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M50 49 v4" stroke={d} strokeWidth="1" opacity=".6" />
      {/* corona */}
      <path d="M34 38 l3 -14 l6 8 l7 -11 l7 11 l6 -8 l3 14 z" fill={l} stroke={d} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="33" y="36" width="34" height="5" rx="2" fill={c} stroke={d} strokeWidth="1.3" />
      <circle cx="37" cy="24" r="2.4" fill={d} /><circle cx="50" cy="19" r="2.8" fill={d} /><circle cx="63" cy="24" r="2.4" fill={d} />
      {/* ceptre amb l'emblema */}
      <line x1="76" y1="108" x2="76" y2="60" stroke={d} strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(66,40) scale(0.2)"><Emblema pal={pal} /></g>
    </g>
  );
}

function Cavall({ pal }: { pal: Pal }) {
  const c = COLOR[pal], d = FOSC[pal], l = CLAR[pal];
  return (
    <g>
      {/* cavall */}
      <path d="M18 108 q0 -26 16 -32 q16 -6 34 0 q14 6 14 32 z" fill={l} stroke={d} strokeWidth="1.6" />
      <path d="M68 76 q10 -10 8 -22 q-2 -10 -12 -10 q-8 0 -10 8 l-2 12" fill={l} stroke={d} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M64 44 l-3 -12 l8 7 z" fill={l} stroke={d} strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="68" cy="52" r="1.8" fill={d} />
      <path d="M74 60 q5 2 5 6" fill="none" stroke={d} strokeWidth="1.2" />
      {/* crinera */}
      <path d="M56 46 q-6 10 -4 24" fill="none" stroke={d} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {/* potes */}
      <path d="M30 100 v10 M44 104 v6 M60 102 v8 M74 100 v10" stroke={d} strokeWidth="3" strokeLinecap="round" />
      {/* genet */}
      <path d="M30 76 q4 -22 14 -22 q10 0 12 20 z" fill={c} stroke={d} strokeWidth="1.5" />
      <ellipse cx="43" cy="46" rx="9" ry="10" fill="#F0D5AE" stroke={d} strokeWidth="1.3" />
      <circle cx="40" cy="45" r="1.4" fill={d} /><circle cx="47" cy="45" r="1.4" fill={d} />
      <path d="M32 38 q11 -8 22 0 l-2 -6 q-9 -5 -18 0 z" fill={c} stroke={d} strokeWidth="1.3" strokeLinejoin="round" />
      {/* braç amb l'emblema */}
      <path d="M32 62 q-10 -6 -12 -18" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(10,26) scale(0.18)"><Emblema pal={pal} /></g>
    </g>
  );
}

function Sota({ pal }: { pal: Pal }) {
  const c = COLOR[pal], d = FOSC[pal], l = CLAR[pal];
  return (
    <g>
      {/* cos */}
      <path d="M28 110 q2 -36 22 -40 q20 4 22 40 z" fill={c} stroke={d} strokeWidth="1.6" />
      <path d="M50 70 v40" stroke={d} strokeWidth="1.1" opacity=".45" />
      {/* cinturó */}
      <rect x="34" y="88" width="32" height="6" rx="2" fill={l} stroke={d} strokeWidth="1.2" />
      {/* coll */}
      <path d="M43 64 h14 v8 h-14 z" fill="#E8C9A0" stroke={d} strokeWidth="1.2" />
      <path d="M38 72 q12 8 24 0" fill={l} stroke={d} strokeWidth="1.3" />
      {/* cara */}
      <ellipse cx="50" cy="52" rx="12" ry="13.5" fill="#F0D5AE" stroke={d} strokeWidth="1.4" />
      <circle cx="45.5" cy="50" r="1.6" fill={d} /><circle cx="54.5" cy="50" r="1.6" fill={d} />
      <path d="M42 45 q4 -2 7 0 M51 45 q4 -2 7 0" fill="none" stroke={d} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M46 58 q4 3 8 0" fill="none" stroke={d} strokeWidth="1.2" strokeLinecap="round" />
      {/* cabell i barret */}
      <path d="M38 44 q12 -12 24 0 q-2 -14 -12 -14 q-10 0 -12 14 z" fill={l} stroke={d} strokeWidth="1.3" />
      <path d="M32 34 q18 -12 36 0 q-4 -8 -18 -8 q-14 0 -18 8 z" fill={c} stroke={d} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M66 30 q8 -4 10 -12" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      {/* braç amb l'emblema */}
      <path d="M72 82 q10 -8 8 -22" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(68,36) scale(0.2)"><Emblema pal={pal} /></g>
    </g>
  );
}

/* ───────────────────────── disposició de pips ───────────────────────── */

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 68]],
  2: [[50, 44], [50, 92]],
  3: [[50, 38], [50, 68], [50, 98]],
  4: [[33, 44], [67, 44], [33, 92], [67, 92]],
  5: [[33, 42], [67, 42], [50, 68], [33, 94], [67, 94]],
  6: [[33, 40], [67, 40], [33, 68], [67, 68], [33, 96], [67, 96]],
  7: [[33, 38], [67, 38], [50, 53], [33, 68], [67, 68], [33, 98], [67, 98]],
  8: [[33, 36], [67, 36], [33, 58], [67, 58], [33, 80], [67, 80], [33, 102], [67, 102]],
  9: [[32, 36], [50, 36], [68, 36], [32, 68], [50, 68], [68, 68], [32, 100], [50, 100], [68, 100]],
};

/* ───────────────────────── la carta ───────────────────────── */

export function Carta({
  code, w = 74, onClick, morta = false,
}: { code: string; w?: number; onClick?: () => void; morta?: boolean }) {
  const rank = parseInt(code.slice(0, -1), 10);
  const pal = code.slice(-1) as Pal;
  const c = COLOR[pal], d = FOSC[pal];
  const h = Math.round(w * 1.56);
  const esFigura = rank >= 10 && rank <= 12;
  const esManilla = rank === 9;
  const nom = `${rank} de ${NOM_PAL[pal]}`;
  const uid = `${rank}${pal}`;

  return (
    <svg className="carta" width={w} height={h} viewBox="0 0 100 156"
      onClick={morta ? undefined : onClick} role={onClick ? "button" : "img"}
      aria-label={nom} aria-disabled={morta || undefined}>
      <defs>
        <linearGradient id={`p${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBF7EE" /><stop offset="55%" stopColor="#F4EFE3" />
          <stop offset="100%" stopColor="#E9E1D0" />
        </linearGradient>
        <clipPath id={`cl${uid}`}><rect x="10" y="20" width="80" height="116" rx="3" /></clipPath>
      </defs>

      {/* paper */}
      <rect width="100" height="156" rx="8" fill={`url(#p${uid})`} />
      {/* orla doble amb cantonades */}
      <rect x="4" y="4" width="92" height="148" rx="6" fill="none" stroke={d} strokeWidth="1.6" />
      <rect x="7.5" y="7.5" width="85" height="141" rx="4" fill="none" stroke={c} strokeWidth="0.8" opacity=".55" />
      {[[10, 10, 1, 1], [90, 10, -1, 1], [10, 146, 1, -1], [90, 146, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y} l${6 * sx} 0 M${x} ${y} l0 ${6 * sy}`}
          stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      ))}

      {/* índexs */}
      <g>
        <text x="11" y="19" fontFamily="Bitter, Georgia, serif" fontSize="15" fontWeight="700" fill={c}>{rank}</text>
        <g transform="translate(76,7) scale(0.16)"><Emblema pal={pal} /></g>
      </g>
      <g transform="rotate(180 50 78)">
        <text x="11" y="19" fontFamily="Bitter, Georgia, serif" fontSize="15" fontWeight="700" fill={c}>{rank}</text>
        <g transform="translate(76,7) scale(0.16)"><Emblema pal={pal} /></g>
      </g>

      {/* cos */}
      <g clipPath={`url(#cl${uid})`}>
        {esFigura ? (
          <g transform="translate(14,22) scale(0.72)">
            {rank === 12 ? <Rei pal={pal} /> : rank === 11 ? <Cavall pal={pal} /> : <Sota pal={pal} />}
          </g>
        ) : (
          (PIPS[rank] ?? []).map(([x, y], i) => {
            const s = rank === 1 ? 0.46 : rank <= 3 ? 0.3 : rank <= 6 ? 0.24 : 0.2;
            const k = s * 100;
            return (
              <g key={i} transform={`translate(${x - k / 2},${y - k / 2}) scale(${s})`}>
                <Emblema pal={pal} />
              </g>
            );
          })
        )}
      </g>

      {/* la manilla porta segell: és la carta que mana, i val 5 */}
      {esManilla && (
        <g>
          <circle cx="50" cy="143" r="7.5" fill={`url(#p${uid})`} stroke={c} strokeWidth="1.2" />
          <text x="50" y="146.5" textAnchor="middle" fontFamily="IBM Plex Mono, monospace"
            fontSize="8.5" fontWeight="600" fill={c}>5</text>
        </g>
      )}
      {(rank === 1 || esFigura) && (
        <text x="50" y="147" textAnchor="middle" fontFamily="IBM Plex Mono, monospace"
          fontSize="7.5" fill={c} opacity=".75">
          {rank === 1 ? "4" : rank === 12 ? "3" : rank === 11 ? "2" : "1"}
        </text>
      )}
    </svg>
  );
}

export function Dors({ w = 74 }: { w?: number }) {
  const h = Math.round(w * 1.56);
  return (
    <svg className="carta" width={w} height={h} viewBox="0 0 100 156" aria-hidden="true">
      <defs>
        <pattern id="teixit" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#6B4632" />
          <path d="M0 5 h10 M5 0 v10" stroke="#8A6248" strokeWidth="1.1" />
          <circle cx="5" cy="5" r="1.4" fill="#A47A5C" />
        </pattern>
      </defs>
      <rect width="100" height="156" rx="8" fill="#5A3A28" />
      <rect x="5" y="5" width="90" height="146" rx="5" fill="url(#teixit)" />
      <rect x="5" y="5" width="90" height="146" rx="5" fill="none" stroke="#A47A5C" strokeWidth="1.4" />
      <rect x="9" y="9" width="82" height="138" rx="3" fill="none" stroke="#C49A78" strokeWidth="0.7" opacity=".7" />
      <circle cx="50" cy="78" r="21" fill="#5A3A28" stroke="#C49A78" strokeWidth="1.6" />
      <circle cx="50" cy="78" r="17" fill="none" stroke="#A47A5C" strokeWidth="0.8" />
      <text x="50" y="85" textAnchor="middle" fontFamily="Bitter, Georgia, serif"
        fontSize="20" fontWeight="700" fill="#E8C9A0">M</text>
    </svg>
  );
}
