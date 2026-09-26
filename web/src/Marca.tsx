/** La marca de Manilla: cercle de paper amb la silueta retallada. */
export default function Marca({ mida = 28 }: { mida?: number }) {
  const id = `marca-${mida}`;
  return (
    <svg viewBox="0 0 48 48" width={mida} height={mida} role="img" aria-label="Manilla"
      style={{ display: "block", flex: "none" }}>
      <mask id={id}>
        <circle cx="24" cy="24" r="23.5" fill="white" />
        <g fill="none" stroke="black"
          style={{ strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" }}>
          <path d="M20.1 1.9C26 3.5 30 8 31.5 12.5l3 1.8c.8.5.5 1.8-.4 1.9l-1.6.2c.4 1.9 1.2 3.7 2.4 5.2.7.9.2 2.1-.9 2.2 1.9 1.1 2.9 2.9 2.5 4.9-.6 2.8-3.4 4.4-7 4.4-4.5.2-8.5 2.9-11 12.5" />
          <path d="M26.6 19.2c1.1-1.9 3.5-1.9 4.6 0" />
        </g>
        <path d="M37.2 26.4c-2.6 1.3-6 1.3-8.6-.3.2 3.2 2.4 5.4 5 5.4 2.2 0 3.4-1.9 3.6-5.1Z" fill="black" />
      </mask>
      <circle cx="24" cy="24" r="23.5" fill="#F5F1E8" mask={`url(#${id})`} />
    </svg>
  );
}
