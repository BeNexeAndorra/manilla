# Crèdits i llicències de tercers

## Baralla «Naipes Libres»

`web/public/baralla.png` (i la còpia original `Baraja_española_completa.png`)

| | |
|---|---|
| **Autor** | Basquetteur |
| **Font** | [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Spanish_playing_cards) |
| **Llicència** | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.ca) |
| **Ús** | Sense modificar. L'aplicació mostra regions del full amb un mosaic CSS; no se'n retalla, reempaqueta ni redistribueix cap fitxer derivat |

**Obligacions que cal mantenir:**

1. **L'atribució ha de ser visible a l'aplicació.** És a **Ajustos → La baralla**, amb el nom de l'autor i l'enllaç a la llicència. No es pot treure.
2. **Si algun dia es modifica el fitxer** —retallar-lo en cartes soltes, recolorir-lo, canviar-ne els índexs— la versió modificada **s'ha de publicar amb la mateixa llicència CC BY-SA 3.0**.
3. El codi de l'aplicació **no** és obra derivada de la imatge i continua sent privat.

Si es vol una baralla sense aquestes obligacions, hi ha l'alternativa pròpia
de `web/src/Carta.tsx`, seleccionable als mateixos ajustos. Vegeu la §6.0 de
[`DISSENY.md`](DISSENY.md).

## Àudio

| Fitxer | Origen |
|---|---|
| `web/public/so/victoria.m4a` | Els dos primers segons de `Victoria Heroica.m4a`, amb esvaïment |
| `web/public/musica/nocturn.m4a` | `Nocturnal Concentration.m4a`, recodificat a AAC 96 kbps |
| `web/public/musica/escalfor.m4a` | `Settling Warmth.m4a`, recodificat a AAC 96 kbps |
| `web/public/musica/silencis.m4a` | `Silence Between Phrases.m4a`, recodificat a AAC 96 kbps |

> ⚠️ **Falta saber-ne la llicència.** Aquests quatre fitxers els va portar el
> Marcel i no en consta la procedència. Abans de publicar l'aplicació cal
> deixar escrit aquí d'on surten i amb quins drets es poden fer servir. Si són
> d'un banc de música o generats amb un servei, cal l'enllaç a les seves
> condicions.

La resta de sons —clic, carta, repartiment, basa, cant, contro i acord de
final de mà— són **sintetitzats amb Web Audio** a `web/src/so.ts`: no hi ha
cap fitxer ni cap llicència de tercers.

## Tipografies

Inter, IBM Plex Mono i Bitter, servides per Google Fonts, totes amb
[SIL Open Font License 1.1](https://openfontlicense.org/).
