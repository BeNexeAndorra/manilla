import { Carta } from "./Carta";

/**
 * Les regles sempre a mà. El jugador no ha de sortir mai del joc per
 * consultar la jerarquia ni els valors: és el que evita que un principiant
 * abandoni a la tercera jugada il·legal (§14 del brief).
 */
export default function Regles({ onClose }: { onClose: () => void }) {
  return (
    <div className="rerefons" onClick={onClose}>
      <div className="full" onClick={(e) => e.stopPropagation()}>
        <h2>Les regles</h2>
        <p className="sub">
          La botifarra té una regla que sorprèn tothom: <b>el 9 mana per sobre de l'as</b>.
        </p>

        <div className="regles-seccio">
          <h3>Jerarquia dins d'un pal</h3>
          <div className="ordre">
            {[9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2].map((r, i) => (
              <div className="p" key={r}>
                <Carta code={`${r}o`} w={30} />
                <span>{i === 0 ? "mana" : i === 11 ? "més baixa" : ""}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="regles-seccio">
          <h3>Valor de les cartes · 72 punts per mà</h3>
          <div className="valors">
            {[["9", "5", "manilla"], ["1", "4", "as"], ["12", "3", "rei"],
              ["11", "2", "cavall"], ["10", "1", "sota"], ["basa", "1", "cada una"]].map(([k, v, n]) => (
              <div className="valor" key={k}>
                <b>{v}</b><span>{n}</span>
              </div>
            ))}
          </div>
          <p className="sub" style={{ marginTop: 10, marginBottom: 0 }}>
            60 punts de cartes + 12 de bases. Guanya qui passa de 36, i anota la diferència.
          </p>
        </div>

        <div className="regles-seccio">
          <h3>Què pots jugar</h3>
          <ol className="llista">
            <li><b>Serveix el pal</b> de sortida, si en tens.</li>
            <li>Si el company <b>no</b> va guanyant la basa, <b>has de matar</b> si pots.</li>
            <li>Si no tens el pal i el company no guanya, <b>has de fallar</b> amb trumfo.</li>
            <li>Si el company <b>ja va guanyant</b>, jugues el que vulguis.</li>
            <li>Si no pots matar ni fallar, jugues lliurement.</li>
          </ol>
          <p className="sub" style={{ marginTop: 10, marginBottom: 0 }}>
            Les cartes que no pots jugar surten apagades. No cal que ho recordis.
          </p>
        </div>

        <div className="regles-seccio">
          <h3>Multiplicadors</h3>
          <ol className="llista" style={{ listStyle: "none", paddingLeft: 0 }}>
            <li><b>Botifarra</b> (sense trumfo) · dobla sempre</li>
            <li><b>Contro</b> ×2 · el diuen els rivals de qui ha cantat</li>
            <li><b>Recontro</b> ×4 · resposta de qui havia cantat</li>
            <li><b>Sant Vicenç</b> ×8 · només si hi ha trumfo</li>
          </ol>
        </div>

        <button className="btn" style={{ width: "100%" }} onClick={onClose}>Tanca</button>
      </div>
    </div>
  );
}
