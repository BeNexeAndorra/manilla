/**
 * Música de fons.
 *
 * Va contra la §11 de DISSENY.md («cap música de fons, mai»); hi és per
 * decisió expressa. El compromís és que no domini mai: el volum per defecte
 * és baix, s'apaga amb un sol interruptor, i qualsevol so de la taula la fa
 * abaixar un moment.
 *
 * Fa servir un <audio> i no Web Audio: són peces de tres minuts i val més
 * que el navegador les vagi rebent que no pas carregar-les senceres a
 * memòria. Es baixen només quan la música està encesa.
 */

export type Peca = "nocturn" | "escalfor" | "silencis";

export const PECES: { id: Peca; nom: string; detall: string }[] = [
  { id: "nocturn", nom: "Nocturn", detall: "recollida, per jugar de nit" },
  { id: "escalfor", nom: "Escalfor", detall: "càlida, de sobretaula" },
  { id: "silencis", nom: "Silencis", detall: "molt espaiada, gairebé no hi és" },
];

/* El control de volum val el que diu. Abans hi havia un sostre ocult del
   45% que feia que un 24% al control fos un 12% real: el número mentia i
   costava d'afinar. Ara el que es marca és el que sona. */
const ESVAIMENT = 600;   // ms

let element: HTMLAudioElement | null = null;
let encesa = false;
let volum = 0.25;
let peca: Peca = "nocturn";
let esmorteida = false;
let temporitzador: number | undefined;

const objectiu = () => (encesa ? volum * (esmorteida ? 0.35 : 1) : 0);

function crea(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!element) {
    element = new Audio();
    element.loop = true;
    element.preload = "none";
    element.volume = 0;
    // Va al document, encara que sigui invisible: així es pot inspeccionar
    // amb les eines del navegador quan alguna cosa no sona.
    element.setAttribute("data-manilla", "musica");
    element.style.display = "none";
    document.body.appendChild(element);
  }
  return element;
}

/** Porta el volum cap a l'objectiu sense saltiró. */
function esvaeix(fins: number, ms = ESVAIMENT) {
  const a = crea();
  if (!a) return;
  window.clearInterval(temporitzador);
  const inici = a.volume, salt = fins - inici, t0 = performance.now();
  temporitzador = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    a.volume = Math.max(0, Math.min(1, inici + salt * k));
    if (k >= 1) {
      window.clearInterval(temporitzador);
      if (a.volume === 0 && !encesa) a.pause();
    }
  }, 25);
}

async function posa() {
  const a = crea();
  if (!a) return;
  const font = `/musica/${peca}.m4a`;
  if (!a.src.endsWith(font)) {
    a.src = font;
    a.load();
  }
  try {
    await a.play();
    esvaeix(objectiu());
  } catch {
    // El navegador encara no deixa sonar res: ho tornarem a provar al
    // primer toc de la persona.
  }
}

export const musica = {
  PECES,

  /** L'estat ve dels ajustos; es crida cada cop que canvien. */
  configura(o: { musica: boolean; peca: Peca; volum: number }) {
    const abans = { encesa, peca };
    encesa = o.musica;
    volum = Math.max(0, Math.min(1, o.volum));
    peca = o.peca;

    if (!encesa) {
      esvaeix(0);
      return;
    }
    if (!abans.encesa || abans.peca !== peca) {
      void posa();
    } else {
      esvaeix(objectiu(), 200);
    }
  },

  /** El navegador no deixa sonar res fins al primer toc: aquest n'és l'intent. */
  desperta() {
    if (encesa && element && element.paused) void posa();
    else if (encesa && !element) void posa();
  },

  /**
   * Abaixa la música un moment perquè se senti el que passa a la taula.
   * És el que evita que la música tapi mai res.
   */
  esmorteeix(ms: number) {
    if (!encesa) return;
    esmorteida = true;
    esvaeix(objectiu(), 120);
    window.setTimeout(() => {
      esmorteida = false;
      esvaeix(objectiu(), 400);
    }, ms);
  },
};
