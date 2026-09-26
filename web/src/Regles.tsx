import { Carta, CartaClassica, Simbol, type Pal } from "./Carta";

/**
 * Les regles, sempre a mà. El jugador no ha de sortir mai del joc per
 * consultar la jerarquia ni els valors: és el que evita que un principiant
 * abandoni a la tercera jugada il·legal (§9.8 de DISSENY.md).
 *
 * No és un tutorial ni una benvinguda: és una fitxa de consulta que es pot
 * obrir enmig d'una jugada i tancar-la sense perdre el torn.
 */

/** L'ordre de força dins d'un pal. La manilla primer, el dos l'últim. */
const JERARQUIA = [9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2];

const VALORS: [number | null, string, number][] = [
  [9, "manilla", 5],
  [1, "as", 4],
  [12, "rei", 3],
  [11, "cavall", 2],
  [10, "sota", 1],
  [null, "cada basa", 1],
];

const OBLIGACIONS = [
  ["Serveix el pal", "Si tens cartes del pal de sortida, n'has de jugar una."],
  ["Mata si pots", "Si el company no va guanyant la basa, has de superar la carta que mana."],
  ["Falla amb trumfo", "Si no tens el pal i el company no guanya, has de tallar."],
  ["Si el company mana", "Jugues el que vulguis: la basa ja és vostra."],
  ["Si no pots res", "Si no pots ni matar ni fallar, jugues lliurement."],
];

const MULTIPLICADORS = [
  ["Botifarra", "sense trumfo", "×2"],
  ["Contro", "el canten els rivals de qui ha cantat", "×2"],
  ["Recontro", "resposta de qui havia cantat", "×4"],
  ["Sant Vicenç", "només si hi ha trumfo", "×8"],
  ["Barraca", "l'últim graó", "×16"],
];

export default function Regles({
  onClose, classica = true,
}: { onClose: () => void; classica?: boolean }) {
  const mostra = (rang: number, pal: Pal = "o", w = 46) =>
    classica
      ? <CartaClassica code={`${rang}${pal}`} w={w} />
      : <Carta code={`${rang}${pal}`} w={w} />;

  return (
    <div className="capa-modal">
      <div className="rerefons" onClick={onClose} />
      <div className="full regles" role="dialog" aria-label="Les regles de la botifarra">
        <div className="nansa" />
        <div className="titol-full">
          <h2>Les regles</h2>
          <span className="sub">
            La que sorprèn tothom: <b>el nou mana per sobre de l'as</b>.
          </span>
        </div>

        <div className="cos-regles">
          <section className="seccio-regles">
            <h3>Jerarquia dins d'un pal</h3>
            <div className="tira-jerarquia">
              {JERARQUIA.map((r) => (
                <div key={r} className="graó">{mostra(r)}</div>
              ))}
            </div>
            <div className="extrems">
              <span>mana</span>
              <i />
              <span>més baixa</span>
            </div>
            <p className="nota">
              El trumfo mata qualsevol carta d'un altre pal, per baixa que sigui.
            </p>
          </section>

          <section className="seccio-regles">
            <h3>Què val cada carta</h3>
            <ul className="taula-valors">
              {VALORS.map(([rang, nom, punts]) => (
                <li key={nom}>
                  <span className="cromo">
                    {rang ? mostra(rang, "o", 34) : <span className="basa-mini">basa</span>}
                  </span>
                  <span className="nom">{nom}</span>
                  <b>{punts}</b>
                </li>
              ))}
            </ul>
            <p className="nota">
              <b>60 punts de cartes + 12 de bases = 72 per mà.</b> Guanya qui
              passa de 36, i anota la diferència multiplicada pel contracte.
            </p>
          </section>

          <section className="seccio-regles">
            <h3>Què pots jugar</h3>
            <ol className="obligacions">
              {OBLIGACIONS.map(([titol, detall], i) => (
                <li key={titol}>
                  <span className="num">{i + 1}</span>
                  <span className="text"><b>{titol}</b><span>{detall}</span></span>
                </li>
              ))}
            </ol>
            <p className="nota">
              No cal que te'n recordis: <b>les cartes que no pots jugar surten
              apagades</b> i no es deixen tocar. Si en toques una, el joc et diu
              per què.
            </p>
          </section>

          <section className="seccio-regles">
            <h3>Els pals</h3>
            <div className="mostra-pals">
              {(["o", "c", "e", "b"] as const).map((p) => (
                <span key={p} className="mostra">
                  <Simbol pal={p} w={30} />
                  <i>{{ o: "oros", c: "copes", e: "espases", b: "bastos" }[p]}</i>
                </span>
              ))}
            </div>
          </section>

          <section className="seccio-regles">
            <h3>Multiplicadors</h3>
            <ul className="multiplicadors">
              {MULTIPLICADORS.map(([nom, detall, mult]) => (
                <li key={nom}>
                  <span className="text"><b>{nom}</b><span>{detall}</span></span>
                  <b className="mult">{mult}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="botons">
          <button className="b-principal" onClick={onClose}>Tanca</button>
        </div>
      </div>
    </div>
  );
}
