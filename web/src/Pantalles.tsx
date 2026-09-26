import { useEffect, useState } from "react";
import Marca from "./Marca";
import Escena from "./Escena";
import { so } from "./so";
import { musica, PECES } from "./musica";
import { Carta, CartaClassica, Simbol } from "./Carta";
import {
  dades, type Ajustos, type Config, type Estadistiques, type Perfil, type ResumPartida,
} from "./dades";

/* ───────────────────────────── bastida comuna ─────────────────────────── */

function Pantalla({
  titol, sub, enrere, children, ampla = false, fons = false,
}: {
  titol?: string; sub?: string; enrere?: () => void;
  children: React.ReactNode; ampla?: boolean; fons?: boolean;
}) {
  return (
    <div className="pantalla">
      {fons && <Escena className="escena-portada" />}
      <div className={`columna-central${ampla ? " ampla" : ""}`}>
        {(titol || enrere) && (
          <div className="cap-pantalla">
            {enrere && (
              <button className="rodo pla" onClick={enrere} aria-label="Enrere">‹</button>
            )}
            <div className="titols">
              {titol && <h1>{titol}</h1>}
              {sub && <p className="sub">{sub}</p>}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function Avatar({ inicial, mida = 56 }: { inicial: string; mida?: number }) {
  return (
    <div className="avatar" style={{
      width: mida, height: mida, fontSize: Math.round(mida * 0.36),
      borderColor: "var(--ok)",
    }}>{inicial}</div>
  );
}

/* ───────────────────────────────── inici ──────────────────────────────── */

const TEMES = [
  { id: "clar" as const, nom: "Clar" },
  { id: "fosc" as const, nom: "Fosc" },
  { id: "contrast" as const, nom: "Contrast" },
];

export function Inici({
  perfil, ajustos, onCanviaAjustos,
  onJuga, onPerfil, onEstadistiques, onRegles, onAjustos,
}: {
  perfil: Perfil | null;
  ajustos: Ajustos; onCanviaAjustos: (a: Ajustos) => void;
  onJuga: () => void; onPerfil: () => void; onEstadistiques: () => void;
  onRegles: () => void; onAjustos: () => void;
}) {
  return (
    <Pantalla fons>
      <div className="portada">
        <Marca mida={96} />
        <h1 className="marca-nom">Manilla</h1>
        <p className="lema">Botifarra en línia, amb les regles sempre a la vista.</p>
      </div>

      {perfil ? (
        <>
          <button className="fitxa-perfil" onClick={onPerfil}>
            <Avatar inicial={perfil.inicial} mida={48} />
            <span className="qui">
              <b>{perfil.nom}</b>
              <span>toca per canviar el nom</span>
            </span>
            <span className="fletxa">›</span>
          </button>
          <div className="menu">
            <button className="b-principal gros" onClick={onJuga}>Juga una partida</button>
            <button className="b-secundari" onClick={onEstadistiques}>Estadístiques</button>
            <button className="b-secundari" onClick={onRegles}>Regles del joc</button>
            <button className="b-secundari" onClick={onAjustos}>Ajustos</button>
          </div>
        </>
      ) : (
        <div className="menu">
          <button className="b-principal gros" onClick={onPerfil}>Comença</button>
          <button className="b-secundari" onClick={onRegles}>Regles del joc</button>
          <button className="b-secundari" onClick={onAjustos}>Ajustos</button>
        </div>
      )}

      {/* L'ambient es canvia des d'aquí: és el primer que es vol tocar i abans
          calia haver creat el perfil per arribar als ajustos. */}
      <div className="tria-ambient">
        <span>Ambient</span>
        <div className="tria">
          {TEMES.map((t) => (
            <button key={t.id} data-sel={ajustos.tema === t.id}
              onClick={() => onCanviaAjustos({ ...ajustos, tema: t.id })}>{t.nom}</button>
          ))}
        </div>
      </div>

      <p className="peu-nota">
        Es juga contra la màquina. El joc en línia amb altres persones arriba
        amb el servidor.
      </p>
    </Pantalla>
  );
}

/* ──────────────────────────────── perfil ──────────────────────────────── */

export function Compte({
  perfil, onDesa, onEnrere,
}: { perfil: Perfil | null; onDesa: (nom: string) => void; onEnrere?: () => void }) {
  const [nom, setNom] = useState(perfil?.nom ?? "");
  const net = nom.trim();
  const valid = net.length >= 2;

  return (
    <Pantalla
      titol={perfil ? "El teu perfil" : "Crea el teu perfil"}
      sub={perfil ? "Canvia com et veuen a la taula." : "Només cal un nom per seure a jugar."}
      enrere={onEnrere}
    >
      <div className="previsualitza">
        <Avatar inicial={(net[0] ?? "?").toUpperCase()} mida={72} />
        <span>{net || "El teu nom"}</span>
      </div>

      <label className="camp">
        <span>Nom</span>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onDesa(net); }}
          maxLength={14}
          placeholder="Com vols que et diguin"
          autoFocus
        />
        <small>{valid ? `${net.length}/14` : "Mínim dues lletres"}</small>
      </label>

      <div className="menu">
        <button className="b-principal gros" disabled={!valid} onClick={() => onDesa(net)}>
          {perfil ? "Desa" : "Entra"}
        </button>
      </div>

      <p className="peu-nota">
        El perfil es desa en aquest dispositiu. El registre amb correu i
        contrasenya arriba amb el servidor, i llavors et podràs endur les
        estadístiques a qualsevol aparell.
      </p>
    </Pantalla>
  );
}

/* ────────────────────────── configuració de partida ───────────────────── */

const NIVELLS = [
  { id: 0 as const, nom: "Aprenent", detall: "Juga legal, però sense pla. Per agafar-hi la mà." },
  { id: 1 as const, nom: "Casal", detall: "Mata quan hi ha punts i es desprèn barat." },
];

export function Configuracio({
  config, onJuga, onEnrere,
}: { config: Config; onJuga: (c: Config) => void; onEnrere: () => void }) {
  const [nivell, setNivell] = useState<0 | 1>(config.nivell);
  const [objectiu, setObjectiu] = useState(config.objectiu);

  return (
    <Pantalla titol="Nova partida" sub="Tu i la Marta, contra el Pere i el Jordi." enrere={onEnrere}>
      <section className="bloc">
        <h2>Nivell de la màquina</h2>
        <div className="tria-fitxes">
          {NIVELLS.map((n) => (
            <button key={n.id} className="fitxa" data-sel={nivell === n.id}
              onClick={() => setNivell(n.id)}>
              <b>{n.nom}</b>
              <span>{n.detall}</span>
            </button>
          ))}
        </div>
        <p className="nota">
          El tercer nivell, amb cerca d'arbre sobre mans possibles, arriba amb
          el motor d'anàlisi.
        </p>
      </section>

      <section className="bloc">
        <h2>Fins a quants punts</h2>
        <div className="tria-fitxes">
          {[51, 101].map((o) => (
            <button key={o} className="fitxa curta" data-sel={objectiu === o}
              onClick={() => setObjectiu(o)}>
              <b>{o}</b>
              <span>{o === 51 ? "partida curta" : "la de sempre"}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="menu">
        <button className="b-principal gros" onClick={() => onJuga({ nivell, objectiu })}>
          Comença
        </button>
      </div>
    </Pantalla>
  );
}

/* ─────────────────────────── final de partida ─────────────────────────── */

export function Resultat({
  resum, onAltra, onMenu,
}: { resum: ResumPartida; onAltra: () => void; onMenu: () => void }) {
  // Només en guanyar la partida. En perdre no sona res: no s'hi fa broma.
  useEffect(() => {
    if (!resum.guanyada) return;
    so.triomf();
    musica.esmorteeix(2600);   // que la música no tapi la celebració
  }, [resum.guanyada, resum.id]);

  return (
    <Pantalla>
      <div className="portada">
        <Marca mida={72} />
        <h1 className="marca-nom">{resum.guanyada ? "Partida guanyada" : "Partida perduda"}</h1>
        <p className="lema">
          {resum.guanyada
            ? "Ben jugat. La propera costarà més."
            : "Una altra i canvia la sort."}
        </p>
      </div>

      <div className="marcador-final">
        <span><i>Nosaltres</i><b>{resum.nos}</b></span>
        <span className="guio">–</span>
        <span><i>Ells</i><b>{resum.ells}</b></span>
      </div>

      <dl className="detalls">
        <div><dt>Mans jugades</dt><dd>{resum.mans}</dd></div>
        <div><dt>Objectiu</dt><dd>{resum.objectiu} punts</dd></div>
        <div><dt>Nivell</dt><dd>{NIVELLS[resum.nivell].nom}</dd></div>
      </dl>

      <div className="menu">
        <button className="b-principal gros" onClick={onAltra}>Una altra</button>
        <button className="b-secundari" onClick={onMenu}>Al menú</button>
      </div>
    </Pantalla>
  );
}

/* ──────────────────────────── estadístiques ───────────────────────────── */

const data = (iso: string) =>
  new Date(iso).toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });

export function Estadistiques({
  estadistiques: e, historial, onEnrere,
}: { estadistiques: Estadistiques; historial: ResumPartida[]; onEnrere: () => void }) {
  const pct = e.partides ? Math.round((e.guanyades / e.partides) * 100) : 0;
  const pctMans = e.mans ? Math.round((e.mansGuanyades / e.mans) * 100) : 0;

  if (!e.partides) {
    return (
      <Pantalla titol="Estadístiques" enrere={onEnrere}>
        <p className="buit-gran">
          Encara no has acabat cap partida. Quan n'acabis una, aquí hi trobaràs
          el que has guanyat, quantes mans has fet i la millor.
        </p>
      </Pantalla>
    );
  }

  return (
    <Pantalla titol="Estadístiques" sub={`${e.partides} partides acabades`} enrere={onEnrere} ampla>
      <div className="xifres">
        <div className="xifra"><b>{e.guanyades}</b><span>guanyades</span></div>
        <div className="xifra"><b>{pct}%</b><span>de victòries</span></div>
        <div className="xifra"><b>{e.mans}</b><span>mans jugades</span></div>
        <div className="xifra"><b>{pctMans}%</b><span>mans guanyades</span></div>
        <div className="xifra"><b>{e.puntsAFavor}</b><span>punts a favor</span></div>
        <div className="xifra"><b>{e.puntsEnContra}</b><span>punts en contra</span></div>
        <div className="xifra ample"><b>{e.millorMa}</b><span>la millor mà, en punts</span></div>
      </div>

      <section className="bloc">
        <h2>Darreres partides</h2>
        <ul className="historial">
          {historial.map((p) => (
            <li key={p.id} className={p.guanyada ? "guanyada" : ""}>
              <span className="res">{p.guanyada ? "Guanyada" : "Perduda"}</span>
              <span className="punts-h">{p.nos} – {p.ells}</span>
              <span className="meta">{p.mans} mans · a {p.objectiu} · {NIVELLS[p.nivell].nom}</span>
              <span className="quan">{data(p.data)}</span>
            </li>
          ))}
        </ul>
      </section>
    </Pantalla>
  );
}

/* ──────────────────────────────── ajustos ─────────────────────────────── */

export function PantallaAjustos({
  ajustos, onCanvia, onEnrere, onEsborra,
}: {
  ajustos: Ajustos; onCanvia: (a: Ajustos) => void;
  onEnrere: () => void; onEsborra: () => void;
}) {
  const [confirma, setConfirma] = useState(false);
  const set = (p: Partial<Ajustos>) => onCanvia({ ...ajustos, ...p });

  return (
    <Pantalla titol="Ajustos" sub="Com vols veure i sentir la taula." enrere={onEnrere}>
      <section className="bloc">
        <h2>Ambient</h2>
        <div className="tria">
          {(["clar", "fosc", "contrast"] as const).map((t) => (
            <button key={t} data-sel={ajustos.tema === t} onClick={() => set({ tema: t })}>{t}</button>
          ))}
        </div>
      </section>

      <div className="llista-ajustos">
        <button className="ajust" onClick={() => set({ gran: !ajustos.gran })}
          aria-pressed={ajustos.gran}>
          <span className="et"><b>Cartes grans</b><span>+35%, la mà en dues files</span></span>
          <span className="interruptor" data-on={ajustos.gran}><i /></span>
        </button>
        <button className="ajust" onClick={() => set({ so: !ajustos.so })}
          aria-pressed={ajustos.so}>
          <span className="et">
            <b>So</b>
            <span>cartes i clics, molt fluixet. Res de música</span>
          </span>
          <span className="interruptor" data-on={ajustos.so}><i /></span>
        </button>
        <button className="ajust" onClick={() => set({ trama: !ajustos.trama })}
          aria-pressed={ajustos.trama}>
          <span className="et">
            <b>Distingir pals sense color</b>
            <span>hi afegeix una trama a cada pal</span>
          </span>
          <span className="interruptor" data-on={ajustos.trama}><i /></span>
        </button>
      </div>

      <section className="bloc">
        <h2>Música de fons</h2>
        <button className="ajust" onClick={() => set({ musica: !ajustos.musica })}
          aria-pressed={ajustos.musica}>
          <span className="et">
            <b>Posa música</b>
            <span>sempre de fons, mai per sobre del joc</span>
          </span>
          <span className="interruptor" data-on={ajustos.musica}><i /></span>
        </button>

        {ajustos.musica && (
          <>
            <div className="tria-fitxes tres">
              {PECES.map((p) => (
                <button key={p.id} className="fitxa" data-sel={ajustos.peca === p.id}
                  onClick={() => set({ peca: p.id })}>
                  <b>{p.nom}</b>
                  <span>{p.detall}</span>
                </button>
              ))}
            </div>
            <label className="control-volum">
              <span>Volum</span>
              <input type="range" min={0} max={100} step={5}
                value={Math.round(ajustos.volum * 100)}
                onChange={(e) => set({ volum: Number(e.target.value) / 100 })}
                aria-label="Volum de la música" />
              <b>{Math.round(ajustos.volum * 100)}%</b>
            </label>
          </>
        )}
      </section>

      <section className="bloc">
        <h2>La baralla</h2>
        <div className="tria-baralla">
          <button className="fitxa baralla" data-sel={ajustos.baralla === "classica"}
            onClick={() => set({ baralla: "classica" })}>
            <CartaClassica code="9o" w={68} />
            <b>Clàssica</b>
            <span>Naipes Libres</span>
          </button>
          <button className="fitxa baralla" data-sel={ajustos.baralla === "propia"}
            onClick={() => set({ baralla: "propia" })}>
            <Carta code="9o" w={68} />
            <b>Il·lustrada</b>
            <span>dibuixada per a Manilla</span>
          </button>
        </div>
        <p className="nota">
          La baralla clàssica és obra de <b>Basquetteur</b>, publicada a
          Wikimedia Commons amb llicència{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.ca"
            target="_blank" rel="noreferrer noopener">CC BY-SA 3.0</a>.
          Es fa servir sense modificar-la, i aquesta atribució s'ha de mantenir.
        </p>
      </section>

      <section className="bloc">
        <h2>Els pals</h2>
        <div className="mostra-pals">
          {(["o", "c", "e", "b"] as const).map((p) => (
            <span key={p} className="mostra">
              <Simbol pal={p} w={34} />
              <i>{{ o: "oros", c: "copes", e: "espases", b: "bastos" }[p]}</i>
            </span>
          ))}
        </div>
      </section>

      <section className="bloc perill">
        <h2>Les teves dades</h2>
        {confirma ? (
          <>
            <p className="nota">
              S'esborraran el perfil, les estadístiques i l'historial d'aquest
              dispositiu. No es pot desfer.
            </p>
            <div className="menu">
              <button className="b-perill" onClick={onEsborra}>Sí, esborra-ho tot</button>
              <button className="b-secundari" onClick={() => setConfirma(false)}>Deixa-ho estar</button>
            </div>
          </>
        ) : (
          <button className="b-secundari" onClick={() => setConfirma(true)}>
            Esborra el perfil i les dades
          </button>
        )}
      </section>
    </Pantalla>
  );
}

export { dades };
