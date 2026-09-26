/**
 * L'escena de la portada: un goril·la i dos mandrils a la taula de joc.
 *
 * Dibuix de contorns, no siluetes: traç fi, res d'ompliments. Vectorial i no
 * imatge, perquè pesa un no-res, és nítid a qualsevol mida, es tenyeix amb el
 * tema i no arrossega drets de ningú.
 *
 * Va molt apagat i darrere de tot: ha de ser una cosa que es noti sense
 * mirar-la. Si es veu, és que està massa fort.
 */

/* Gruixos: el traç principal per als contorns, el fi per al detall intern. */
const GRUIX = 2.6;
const FI = 1.7;

/** Goril·la de front. El delaten la cresta del cap, la cella i el morro. */
function Gorilla() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* trapezis: del cap a l'espatlla sense coll pel mig */}
      <path strokeWidth={FI} d="M-60-116c-22 6-40 18-54 34" />
      <path strokeWidth={FI} d="M60-116c22 6 40 18 54 34" />
      {/* esquena i espatlles */}
      <path strokeWidth={GRUIX}
        d="M-72-124c-50 16-86 52-104 106-14 44-20 90-20 134" />
      <path strokeWidth={GRUIX}
        d="M72-124c50 16 86 52 104 106 14 44 20 90 20 134" />
      {/* braços, gruixuts, que es tanquen sobre la taula */}
      <path strokeWidth={GRUIX}
        d="M-158-14c-30 24-46 58-48 100-2 26 0 48 4 66" />
      <path strokeWidth={GRUIX}
        d="M158-14c30 24 46 58 48 100 2 26 0 48-4 66" />
      {/* pit */}
      <path strokeWidth={FI} d="M-58-92c14 34 34 54 58 58 24-4 44-24 58-58" />
      <path strokeWidth={FI} d="M0-34v54" />

      {/* cap: la punta de dalt és la cresta sagital */}
      <path strokeWidth={GRUIX}
        d="M0-292c-14 0-26 8-34 22-6 4-10 9-13 15-22 11-37 34-37 65 0 36 14 68 38 84 14 10 30 16 46 16s32-6 46-16c24-16 38-48 38-84 0-31-15-54-37-65-3-6-7-11-13-15-8-14-20-22-34-22Z" />
      {/* la cresta, marcada per dins */}
      <path strokeWidth={FI} d="M-34-270c10-8 21-12 34-12s24 4 34 12" />
      {/* cella: dos traços, que és un os molt gruixut */}
      <path strokeWidth={GRUIX} d="M-70-204c24-18 46-26 70-26s46 8 70 26" />
      <path strokeWidth={FI} d="M-64-190c22-14 42-20 64-20s42 6 64 20" />
      {/* orelles, petites i arrapades */}
      <path strokeWidth={FI} d="M-84-176c-11-3-18 4-18 15s7 19 18 19" />
      <path strokeWidth={FI} d="M84-176c11-3 18 4 18 15s-7 19-18 19" />
      {/* ulls, enfonsats */}
      <ellipse cx="-29" cy="-172" rx="6.5" ry="5.5" fill="currentColor" stroke="none" />
      <ellipse cx="29" cy="-172" rx="6.5" ry="5.5" fill="currentColor" stroke="none" />
      {/* morro: ample, pla i més estret que el crani */}
      <path strokeWidth={GRUIX}
        d="M-44-150c-2 32 18 56 44 56s46-24 44-56c-1-15-20-23-44-23s-43 8-44 23Z" />
      {/* nas: les dues fosses amples */}
      <path strokeWidth={FI} d="M-19-140c-7 5-9 12-4 16 4 4 13 4 17-1" />
      <path strokeWidth={FI} d="M19-140c7 5 9 12 4 16-4 4-13 4-17-1" />
      <path strokeWidth={FI} d="M0-146v20" />
      {/* boca */}
      <path strokeWidth={GRUIX} d="M-25-112c9 8 17 12 25 12s16-4 25-12" />
    </g>
  );
}

/**
 * Els dos companys de taula, vistos d'esquena.
 *
 * D'esquena a posta: una cara de mandril dibuixada a ma amb corbes no
 * s'aguanta, i a l'opacitat a que va aixo seria soroll igualment. D'esquena la
 * figura es llegeix de seguida -el clatell, les espatlles i els bracos que
 * arriben a les cartes-, i el collaret de pel al voltant del cap hi deixa el
 * gest del mandril sense haver de fer-ne el rostre.
 */
function Company() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path strokeWidth={GRUIX} d="M-40-104c0-30 18-50 40-50s40 20 40 50" />
      <path strokeWidth={FI} d="M-58-96c-2-40 24-68 58-68s60 28 58 68" />
      <path strokeWidth={GRUIX}
        d="M-40-104c-34 10-58 34-70 72-9 28-12 58-10 86" />
      <path strokeWidth={GRUIX}
        d="M40-104c34 10 58 34 70 72 9 28 12 58 10 86" />
      <path strokeWidth={GRUIX} d="M-92-14c-18 22-26 50-24 82" />
      <path strokeWidth={GRUIX} d="M92-14c18 22 26 50 24 82" />
      <path strokeWidth={FI} d="M0-96v70" />
    </g>
  );
}

export default function Escena({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 620" aria-hidden="true"
      preserveAspectRatio="xMidYMax meet">
      <defs>
        {/* Esvaeix el dibuix pels costats i per baix: mai un tall sec. */}
        <radialGradient id="esc-centre" cx="50%" cy="56%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="58%" stopColor="#fff" stopOpacity=".85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="esc-avall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="24%" stopColor="#fff" stopOpacity=".9" />
          <stop offset="82%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity=".2" />
        </linearGradient>
        <mask id="esc-mascara">
          <rect width="1000" height="620" fill="url(#esc-centre)" />
          <rect width="1000" height="620" fill="url(#esc-avall)"
            style={{ mixBlendMode: "multiply" }} />
        </mask>
      </defs>

      <g mask="url(#esc-mascara)">
        {/* làmpada i el seu con, només insinuats */}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path strokeWidth={FI} d="M500 0v40" />
          <path strokeWidth={GRUIX} d="M456 86c4-26 22-44 44-44s40 18 44 44Z" />
          <path strokeWidth={FI} opacity=".32" d="M458 92 250 430M542 92l208 338" />
        </g>

        <g transform="translate(500 406)"><Gorilla /></g>
        <g transform="translate(244 452) scale(0.82)"><Company /></g>
        <g transform="translate(756 452) scale(-0.82 0.82)"><Company /></g>

        {/* la taula */}
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <ellipse cx="500" cy="556" rx="400" ry="92" strokeWidth={GRUIX} />
          <ellipse cx="500" cy="550" rx="372" ry="78" strokeWidth={FI} opacity=".6" />
        </g>

        {/* els ventalls de cartes */}
        <g fill="none" stroke="currentColor" strokeWidth={FI} strokeLinejoin="round">
          {[-24, -12, 0, 12, 24].map((a, i) => (
            <rect key={`g${i}`} x="474" y="456" width="52" height="78" rx="6"
              transform={`rotate(${a} 500 534)`} />
          ))}
          {[-14, -5, 5, 14].map((a, i) => (
            <rect key={`e${i}`} x="218" y="472" width="44" height="64" rx="5"
              transform={`rotate(${a - 22} 240 536)`} />
          ))}
          {[-14, -5, 5, 14].map((a, i) => (
            <rect key={`d${i}`} x="738" y="472" width="44" height="64" rx="5"
              transform={`rotate(${a + 22} 760 536)`} />
          ))}
          <g opacity=".7">
            <rect x="456" y="524" width="48" height="68" rx="5" transform="rotate(-8 480 558)" />
            <rect x="496" y="520" width="48" height="68" rx="5" transform="rotate(10 520 554)" />
          </g>
        </g>
      </g>
    </svg>
  );
}
