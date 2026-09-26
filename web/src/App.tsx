import { useEffect, useState } from "react";
import Joc, { type FiPartida } from "./Joc";
import Regles from "./Regles";
import {
  Inici, Compte, Configuracio, Resultat, Estadistiques, PantallaAjustos,
} from "./Pantalles";
import {
  dades, AJUSTOS_INICIALS, CONFIG_INICIAL, ESTADISTIQUES_INICIALS,
  type Ajustos, type Config, type ResumPartida,
} from "./dades";

type Vista = "inici" | "compte" | "config" | "joc" | "resultat" | "estadistiques" | "ajustos";

export default function App() {
  const [estat, setEstat] = useState(() => dades.tot());
  const [vista, setVista] = useState<Vista>("inici");
  const [regles, setRegles] = useState(false);
  const [darrer, setDarrer] = useState<ResumPartida | null>(null);
  /** D'on s'han obert els ajustos, per saber on tornar. */
  const [origen, setOrigen] = useState<Vista>("inici");

  useEffect(() => {
    document.documentElement.dataset.tema = estat.ajustos.tema;
  }, [estat.ajustos.tema]);

  const desaPerfil = (nom: string) => {
    const perfil = dades.desaPerfil(nom);
    setEstat((e) => ({ ...e, perfil }));
    setVista("inici");
  };

  const canviaAjustos = (ajustos: Ajustos) => {
    dades.desaAjustos(ajustos);
    setEstat((e) => ({ ...e, ajustos }));
  };

  const comenca = (config: Config) => {
    dades.desaConfig(config);
    setEstat((e) => ({ ...e, config }));
    setVista("joc");
  };

  const acaba = (fi: FiPartida) => {
    dades.tancaPartida(fi.resum, fi.mansGuanyades, fi.millorMa);
    setEstat(dades.tot());
    setDarrer(fi.resum);
    setVista("resultat");
  };

  const esborra = () => {
    dades.esborraTot();
    setEstat({
      perfil: null, ajustos: AJUSTOS_INICIALS, config: CONFIG_INICIAL,
      historial: [], estadistiques: ESTADISTIQUES_INICIALS,
    });
    setVista("inici");
  };

  const obreAjustos = () => { setOrigen(vista); setVista("ajustos"); };

  return (
    <>
      {vista === "inici" && (
        <Inici
          perfil={estat.perfil}
          onJuga={() => setVista(estat.perfil ? "config" : "compte")}
          onPerfil={() => setVista("compte")}
          onEstadistiques={() => setVista("estadistiques")}
          onRegles={() => setRegles(true)}
          onAjustos={obreAjustos}
        />
      )}

      {vista === "compte" && (
        <Compte
          perfil={estat.perfil}
          onDesa={desaPerfil}
          onEnrere={estat.perfil ? () => setVista("inici") : undefined}
        />
      )}

      {vista === "config" && (
        <Configuracio config={estat.config} onJuga={comenca} onEnrere={() => setVista("inici")} />
      )}

      {vista === "joc" && estat.perfil && (
        <Joc
          key={`${estat.config.nivell}-${estat.config.objectiu}-${darrer?.id ?? "nova"}`}
          perfil={estat.perfil}
          ajustos={estat.ajustos}
          config={estat.config}
          onFi={acaba}
          onSurt={() => setVista("inici")}
          onAjustos={obreAjustos}
          onRegles={() => setRegles(true)}
        />
      )}

      {vista === "resultat" && darrer && (
        <Resultat
          resum={darrer}
          onAltra={() => { setDarrer(null); setVista("joc"); }}
          onMenu={() => setVista("inici")}
        />
      )}

      {vista === "estadistiques" && (
        <Estadistiques
          estadistiques={estat.estadistiques}
          historial={estat.historial}
          onEnrere={() => setVista("inici")}
        />
      )}

      {vista === "ajustos" && (
        <PantallaAjustos
          ajustos={estat.ajustos}
          onCanvia={canviaAjustos}
          onEnrere={() => setVista(origen)}
          onEsborra={esborra}
        />
      )}

      {regles && <Regles onClose={() => setRegles(false)} />}
    </>
  );
}
