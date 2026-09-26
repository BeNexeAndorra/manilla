# DISSENY.md — Direcció d'art i especificació visual de Manilla

> **v1.0 · 25 de setembre del 2026**
> Aquest document **substitueix i amplia la §9 de `PROMPT.md`**. On hi hagi conflicte, mana aquest.
> Àmbit: web/PWA primer, després Android (Kotlin/Compose) i Windows (Tauri). Els tokens són la font única de veritat per a les tres plataformes.

---

## 0. Com fer servir aquest document

| Si ets… | Llegeix |
|---|---|
| **Dissenyador** | §1 a §15, i lliura el que diu §17 |
| **Il·lustrador de la baralla** | §3, §5, §6 senceres. §6 és el teu encàrrec complet |
| **Desenvolupador de front-end** | §4, §7 a §14, §16 (tokens copiables), §18 (criteris d'acceptació) |
| **IA generativa (imatge o codi)** | §19 — hi ha tres prompts tancats, copiables literalment |

**Regla de resolució de dubtes:** si una decisió no és en aquest document, es resol pel **principi de la §1**. Si continua sent ambigua, guanya **la llegibilitat a 390 px en un mòbil de 6 polzades sostingut amb una mà**.

---

## 1. El principi que ho governa tot

> **Artesania de pòquer premium. Iconografia de casal, no de casino.**

Aquesta és la frase que cal tenir al cap en cada píxel, i val la pena separar-ne les dues meitats perquè és fàcil agafar la que no toca.

**El que SÍ que prenem del pòquer premium** (PokerStars, GGPoker, PPPoker, i el millor programari de cartes que existeix):

- **Materials que semblen materials.** El tapet té fibra. La fusta té veta. El llautó té una llum especular concreta. Res no és un rectangle de color pla.
- **Un model de llum únic i coherent.** Una sola font, sempre a la mateixa posició, i totes les ombres del producte hi obeeixen.
- **Cartes amb pes.** Es mouen com objectes amb massa: acceleren, desacceleren i s'aturen amb una autoritat que no té una animació lineal.
- **Ni un sol estat lleig.** El moment de càrrega, el de desconnexió, el de "esperant jugador" i el de final de partida estan dissenyats amb la mateixa cura que la taula.
- **Coherència absoluta.** Un únic radi de cantonada per família d'element, una única escala d'ombra, una única corba d'acceleració. La sensació de producte car ve de la repetició, no de la varietat.
- **So i hàptica com a part del disseny**, no com a afegit del final.

**El que NO prenem del pòquer** — i això és igual d'important:

- Res de fitxes, ni piles de fitxes, ni monedes, ni bitllets.
- Res de neó, ni daurats saturats, ni partícules brillants, ni feixos de llum.
- Res de comptadors que pugen amb cerimònia, ni cofres, ni recompenses diàries amb foguera d'animació.
- Res de vermell d'alarma per crear urgència artificial.
- Res de taules "temàtiques" (Egipte, Far West, Nadal). **Una taula. Ben feta.**
- Res que suggereixi diners reals. La botifarra no s'hi juga, i el públic no ho vol.

**El referent físic exacte:** *una taula de fusta noble en un casal, cap al tard, amb una làmpada penjant just a sobre. La partida de després de dinar. Ningú no crida.* Si una decisió visual no cabria en aquesta escena, és incorrecta.

**El públic real.** La competència fa "cartes grans per a gent gran" perquè **aquest és el mercat**, no un gest d'accessibilitat. Es dissenya per a un jugador de 65 anys amb un mòbil de 6 polzades i llum de finestra a l'esquena. Resulta que això és millor per a tothom: la llegibilitat mai no ha perjudicat ningú de 25 anys.

**La tensió que cal resoldre bé:** l'artesania premium tendeix al contrast baix, l'ombra subtil i el detall fi. El públic gran necessita el contrari. **Es resol amb jerarquia:** el detall fi va als materials de fons (tapet, fusta, vores); el contrast alt i el traç gruixut van a tot allò que el jugador ha de llegir per decidir (índexs, pals, marcador, torn, cartes legals). **El fons és subtil. La informació, no.**

---

## 2. Referents: què es pren de cada un

| Referent | Què se n'agafa | Què NO |
|---|---|---|
| **PokerStars / GGPoker** | Qualitat del tapet i de la fusta; ombra de carta; fiabilitat de la lectura sota pressió | Fitxes, ostentació, tot l'aparell de casino |
| **Balatro** | Pes i tacte de la carta; el detall del *joc de carta* com a objecte | Estètica CRT, saturació, caos visual |
| **Marvel Snap** | Coreografia de la revelació i claredat del torn | Efectes de raresa, brillantors, obertura de sobres |
| **Clubhouse Games 51 (Nintendo)** | Sobrietat, netedat, cartes llegibles, bon gust sense afectació | Simplicitat excessiva del material |
| **Baralla Fournier nº1 / Heraclio Fournier clàssica** | **El vocabulari formal de la baralla espanyola**: què és un oro, com se sosté una copa, com és una espasa | Cap còpia literal. Vegeu §6.0 |
| **Apple Wallet / iOS 18 sheets** | Comportament de fulls, profunditat, transicions de capa | — |
| **Casinos reals de tapet verd** | El color del feltre gastat, no el del feltre nou | La il·luminació dramàtica |

---

## 3. El model físic: materials, llum i càmera

Tot el producte obeeix aquestes tres definicions. Són **normatives**: qualsevol ombra, degradat o reflex del producte s'ha de poder derivar d'aquí.

### 3.1 La llum

- **Una sola font principal**, càlida, de temperatura ~3200 K, situada **a dalt i lleugerament al davant**: vector `(0, −1, 0.35)` normalitzat. És la làmpada penjant de la taula.
- **Ombres:** sempre cap avall i molt lleugerament cap enrere. Mai laterals. Mai dues ombres.
- **Llum de rebot** molt feble del tapet cap a la part inferior de les cartes: un `+2%` de verd a la vora inferior. És el detall que fa que les cartes "seguin" a la taula i no "surin".
- **Especular:** només tres materials en tenen — el llautó de la vora, el vernís de la carta (molt contingut) i el vidre dels comptadors. El tapet **no brilla mai**.
- **Viyeta:** el tapet s'enfosqueix un 14% cap a les vores. Suau, radial, mai perceptible com a efecte.

### 3.2 Els materials

| Material | On | Descripció executable |
|---|---|---|
| **Feltre de tapet** | Superfície de joc | Base `#2C4A3E`. Gra de soroll monocrom a **3% d'opacitat, 1,5 px**, no animat. Degradat radial central `rgba(255,255,255,.06)` que s'extingeix al 62%. **Gastat, no nou**: lleugerament desaturat |
| **Fusta de noguera** | Marc de la taula, barres | Base `#3A2E24`. Veta vertical molt subtil (línies d'1 px a 4% d'opacitat, separació irregular 6–14 px). Bisell superior il·luminat 1 px `rgba(255,235,205,.10)` |
| **Filet de llautó** | Separació entre fusta i feltre; vores de contenidors premium | Línia d'1,5 px `#C8AA78` amb ombra interior d'1 px `rgba(0,0,0,.35)` a sota. **Mai un degradat daurat brillant**: el llautó vell és mat |
| **Paper de carta** | Cara de la carta | `#F5F1E8`. Textura de fibra a **2%**. Vora viva d'1 px `rgba(0,0,0,.10)`, i un filet interior blanc `rgba(255,255,255,.55)` a 1 px que imita el tall del cartó |
| **Dors de carta** | Revers | Vegeu §6.2 |
| **Vidre** | Marcador, capes flotants | `rgba(20,26,22,.72)` + `backdrop-filter: blur(20px) saturate(140%)` + vora `rgba(255,255,255,.08)` |

### 3.3 La càmera

- **Perspectiva molt lleu**, gairebé zenital: com si el jugador fos assegut i mirés la taula des de dalt, no des del sostre.
- Les cartes de la mà pròpia tenen **una inclinació de ≤ 4°** respecte del pla; les de la taula, **0°**. Res de 3D real, res de `perspective` agressiu.
- **La taula no es mou mai.** Cap gir, cap zoom, cap *shake*. El que es mou són les cartes.

---

## 4. Paleta completa

### 4.1 Base (mode clar de sala, per defecte)

```
--feltre-base      #2C4A3E   Tapet
--feltre-alt       #33574A   Tapet il·luminat (centre)
--feltre-baix      #243D33   Tapet a la vinyeta
--fusta            #3A2E24   Marc
--fusta-alta       #4A3B2E   Bisell il·luminat
--llauto           #C8AA78   Filet
--llauto-fosc      #8A7450   Ombra del filet

--paper            #F5F1E8   Cara de carta
--paper-ombra      #E8E1D2   Zona baixa de la carta
--tinta            #1A1814   Text principal sobre paper
--tinta-2          #5C5449   Text secundari
--tinta-3          #8B8275   Deshabilitat
```

### 4.2 Els quatre pals

Cada pal es distingeix **per forma abans que per color**. El color és redundant, mai portador únic d'informació.

```
--oros             #B8860B   Or vell, no groc
--oros-fosc        #8A6408
--copes            #A32E2E   Vermell terrós
--copes-fosc       #7A2222
--espases          #2E4A6B   Blau acer
--espases-fosc     #223855
--bastos           #4A6B2E   Verd oliva
--bastos-fosc      #375020
```

> **Comprovació obligatòria:** copes (`#A32E2E`) i bastos (`#4A6B2E`) s'han de poder distingir en simulació de **protanopia i deuteranopia**. Si en escala de grisos dos pals tenen la mateixa lluminositat, **la forma i el patró ho han de resoldre sols**. Vegeu §6.8.

### 4.3 Estat i acció

```
--accent           #C2703D   El teu torn · acció principal
--accent-clar      #D98B58
--ok               #3E7A56   Confirmació, bases guanyades
--avis             #C9952F   Contro disponible, temps curt
--err              #A33A28   Error, desconnexió
--neutre           #6B6459
```

### 4.4 Superfícies de la interfície

```
--capa-1           rgba(20,26,22,.72)    Marcador, barres
--capa-2           rgba(16,21,18,.88)    Fulls (cantar, final de mà)
--capa-3           #131A16               Modals opacs
--vora-suau        rgba(255,255,255,.08)
--vora-forta       rgba(200,170,120,.22) Filet de llautó a la interfície
--ombra-1          0 2px 6px -2px rgba(0,0,0,.35)
--ombra-2          0 8px 20px -8px rgba(0,0,0,.45)
--ombra-3          0 18px 40px -18px rgba(0,0,0,.60)
--ombra-carta      0 3px 8px -2px rgba(0,0,0,.40)
--ombra-carta-alta 0 12px 24px -8px rgba(0,0,0,.50)
```

### 4.5 Mode nocturn

**Obligatori**: es juga de nit i al sofà. No és una inversió de colors: és **abaixar la llum de la sala**.

- El tapet baixa a `#223A30`; la fusta, a `#2C231B`.
- El **paper de la carta no s'enfosqueix per sota de `#EDE8DC`**. Les cartes són l'única cosa que continua ben il·luminada — com a la vida real, on la làmpada il·lumina les cartes i la resta queda a l'ombra.
- L'accent es rebaixa un 8% de saturació per no cremar.

### 4.6 Mode d'alt contrast

Activable des dels ajustos i **enllaçat a `prefers-contrast: more`**.

- Tapet gairebé pla `#1E3329`, sense gra ni vinyeta.
- Cartes amb **vora de 2 px `--tinta`**.
- Índexs un 15% més grans.
- Ombres reduïdes a una sola, dura.
- Els pals reben el **patró de trama** de §6.8 sempre actiu.

---

## 5. Tipografia

| Rol | Família | Pes | Notes |
|---|---|---|---|
| Interfície | **Inter** (variable) | 400 / 500 / 600 | `font-optical-sizing: auto` |
| Xifres, marcador, BR, temporitzadors | **IBM Plex Mono** | 500 / 600 | **`font-variant-numeric: tabular-nums` obligatori.** Les xifres no han de ballar mai |
| Títols, marca, noms de contracte | **Bitter** | 600 / 700 | Serif de pantalla, càlida, gens infantil |
| Índexs de carta | **Bitter** 700, o el vectoritzat propi de §6.6 | 700 | Vegeu §6.6 |

### 5.1 Escala

Base **17 px**. Escala 1.200 (tercera menor), arrodonida a enters.

```
--t-xs    13px / 18px    Etiquetes menors, peus
--t-s     15px / 21px    Text secundari
--t-b     17px / 25px    Base
--t-m     20px / 27px    Subtítols, noms de jugador
--t-l     24px / 30px    Marcador (MÍNIM ABSOLUT)
--t-xl    30px / 36px    Títol de full
--t-2xl   40px / 44px    Resultat de mà
```

### 5.2 Regles dures

1. **El marcador mai per sota de 24 px**, en cap breakpoint, en cap mode.
2. **Tot el text del producte ha de suportar un zoom del 200%** sense que la taula es trenqui ni aparegui desplaçament horitzontal.
3. **Res de text en majúscules per sobre de 3 paraules.** Costa de llegir a qui té vista cansada.
4. **Interlletratge `0` o positiu.** Mai negatiu en text petit.
5. **Cap text important sobre el tapet sense una capa de contrast al darrere.**

---

## 6. La baralla

> Aquesta secció **és l'encàrrec complet de l'il·lustrador**. Es pot lliurar sola.

### 6.0 Marc legal i de propietat — llegiu-ho abans de dibuixar

#### El que és lliure és el patró, no els fitxers

La baralla espanyola és de **domini públic com a sistema** (48 cartes, quatre pals, 1–9 + 10/11/12) **i també com a dibuix**: el patró castellà que tothom reconeix el va dissenyar **Augusto Rius el 1889** per a Heraclio Fournier, i fa dècades que és de domini públic per antiguitat. **Qualsevol pot dibuixar aquest patró sense demanar permís a ningú.**

El que **no** és lliure és cada **digitalització moderna** concreta: les fotografies, els escanejats i les vectoritzacions que altres persones han fet i han publicat amb llicència pròpia. I això inclou pràcticament tot el que es troba buscant "baraja española gratis".

#### Inventari del que hi ha realment disponible (comprovat el 25-09-2026)

| Font | Llicència real | Format i pes | Verdicte |
|---|---|---|---|
| **Basquetteur / Germarquezm** — Wikimedia Commons | **CC BY-SA 3.0** | PNG 208 × 319, ~87 kB per carta | **És l'única baralla espanyola lliure que existeix a la pràctica.** Copyleft |
| **`gjenkins20/spanish-playing-cards-svg`** (GitHub) | **CC BY-SA 3.0** | 49 SVG · **86,4 MB en total** · mitjana **1,8 MB per carta** · el dors, **11 MB** | Vectorització automàtica amb Inkscape del PNG anterior. **216 vegades per sobre del pressupost de §6.9** |
| **`mcmd/playingcards.io-spanish.playing.cards`** | GPL-3.0 sobre l'empaquetat; **l'art continua sent el de Basquetteur** | CSV de configuració | Mateixa art, una capa més de llicència |
| **Fotografies del joc Fournier de 1889** a Commons | **CC BY-SA 4.0** *reclamada pel fotògraf* | JPG 3.024 × 4.032 | L'obra de sota **és** domini públic; la reclamació sobre una reproducció plana d'una obra 2D de domini públic és discutible (doctrina *PD-art*). **No s'hi construeix un negoci a sobre** |
| Paquets d'OpenGameArt i itch.io | CC0 els de pòquer; els espanyols, **CC BY-SA 4.0** | Píxel art o baixa resolució | No serveixen per al nivell que demana aquest document |

**Conclusió de la recerca: totes les baralles espanyoles "lliures" que circulen són el mateix dibuix de Basquetteur reempaquetat, i totes arrosseguen CC BY-SA.**

#### Què implica CC BY-SA 3.0 per a aquest producte

| | |
|---|---|
| **Fer-la servir sense tocar-la** | ✅ Permès, també comercialment. Cal **atribució visible** i enllaç a la llicència. **El codi del joc continua sent privat**: la llicència afecta les imatges, no el programa que les mostra |
| **Modificar-la** | ⚠️ **Cada carta modificada s'ha de publicar sota CC BY-SA 3.0.** I la §6.6 d'aquest document **exigeix** modificar-la: índexs al 13%, trama per a daltonisme, mode gran, tractament de la manilla. **Tota aquesta feina acabaria sent reutilitzable per la competència** |
| **El pes** | ❌ 86,4 MB contra un pressupost de 400 kB. No és optimitzable: és traçat automàtic, no dibuix vectorial |

#### La decisió (revisada el 26-09-2026)

**El Marcel ha decidit fer servir la baralla Naipes Libres com a baralla per defecte del producte.** Queda així:

| | |
|---|---|
| **Per defecte** | **Clàssica** — el full `Baraja_española_completa.png` de Basquetteur, CC BY-SA 3.0 |
| **Alternativa** | **Il·lustrada** — la baralla pròpia de `web/src/Carta.tsx`, seleccionable als ajustos |
| **Com es mostra** | Com a **mosaic CSS del full sencer i sense modificar**: retícula de 12 × 5 cel·les de 208 × 319 px, amb la carta a 206 × 317 i un solc d'1 px. No es retalla, no es reempaqueta i no es torna a publicar cap fitxer derivat |
| **Atribució** | Visible a **Ajustos → La baralla**, amb el nom de l'autor i l'enllaç a la llicència. **No es pot treure** |

**Per què mosaic i no 48 fitxers retallats:** retallar i desar cada carta crea una obra derivada, i CC BY-SA obligaria a publicar-la amb la mateixa llicència. Mostrar una regió d'un fitxer íntegre és ús, no adaptació. A més, és un sol fitxer d'1,2 MB en lloc de 48, i la retícula ja és exacta.

**El que continua valent:** si algun dia es vol una baralla **sense copyleft i optimitzada** —perquè convingui modificar-ne els índexs segons la §6.6, o perquè no interessi que la competència pugui reutilitzar la feina—, la sortida és la baralla pròpia, que ja existeix, ocupa 5 kB i es pot canviar sense demanar permís a ningú. Les regles de dibuix d'aquesta secció valen per a aquell cas.

Regles de treball si es reprèn la baralla pròpia:

- **Es dibuixa nova**, amb el vocabulari formal tradicional: una copa és una copa, el rei duu corona.
- **El patró de 1889 es pot mirar tant com es vulgui com a referència**, perquè és de domini públic. **El que no es fa és calcar, vectoritzar automàticament ni retocar una digitalització d'altri.**
- **Les baralles comercials vives (Fournier actual, Comas) queden fora del tot.**
- **L'encàrrec es tanca amb cessió escrita de drets d'explotació** a favor de la societat andorrana.
- Cal **comprovar la marca** abans de tancar el nom «Manilla» (§22 de `PROMPT.md`).

La baralla que s'acabi triant ha de superar aquesta prova: **un jugador de tota la vida l'obre i la reconeix a l'instant com "la baralla de sempre", i alhora no la pot confondre amb cap baralla concreta que tingui a casa.**

### 6.1 Format i geometria

| | Valor |
|---|---|
| **Proporció** | **1 : 1,5** (62 × 93 unitats). És la de la baralla espanyola, no la de pòquer |
| **Llenç vectorial mestre** | **1000 × 1500 px** |
| **Sagnat** | 24 px per costat (per si mai s'imprimeix) |
| **Àrea segura** | Marge intern de 60 px: cap element essencial a fora |
| **Radi de cantonada** | 56 px al mestre (≡ 8 px a 144 px d'amplada) |
| **Mida mínima a la mà (mòbil)** | **64 × 96 px** — límit dur |
| **Mida objectiu a la mà (mòbil)** | 88 × 132 px |
| **Mida a la basa (escriptori)** | 120 × 180 px |
| **Mode "carta gran"** | +35% sobre l'objectiu, sense excepcions |

### 6.2 El dors

El dors és **la peça de marca del producte**. És el que es veu tres vegades més sovint que el logotip.

- **Camp:** vermell terrós profund `#7A2E2A` amb el gra de paper al 3%.
- **Patró:** reticulat geomètric propi, de densitat mitjana, derivat de **la creu de les quatre barres reinterpretada com a mòdul repetible** — un guiny andorrà/català llegit com a ornament, mai com a bandera literal.
- **Marc:** doble filet crema `#E8DCC0` — exterior de 6 px, interior de 2 px, separats per 10 px.
- **Medalló central:** òval amb la marca en monograma, mai el logotip complet.
- **Cap text, cap any, cap URL.**
- **Ha de ser simètric a 180°** — un dors que es veu del revés és un error d'aficionat.
- **Variant de dors per a l'equip rival** en partida: el mateix patró en blau `#2E3E5A`. Ajuda a llegir la taula d'un cop d'ull.

### 6.3 La cara: estructura

Cada cara té **exactament tres zones**, sempre en el mateix lloc:

1. **Índex superior esquerre** (i el seu bessó girat 180° a la inferior dreta): xifra + símbol de pal petit.
2. **Camp central**: la composició de pips o la figura.
3. **Marc**: doble vora fina crema/or segons el pal, amb **floró de cantonada** discret als quatre angles.

**El marc canvia de color per pal.** És el segon senyal redundant de pal, després de la forma: `--oros`, `--copes`, `--espases`, `--bastos`, aplicats al filet exterior al 55% d'opacitat.

### 6.4 Els quatre pals: direcció d'art

Cada pal necessita **una silueta inconfusible a 20 px**. Dibuixeu-lo, reduïu-lo a 20 px, i si dubteu entre dos pals, torneu a començar.

| Pal | Silueta | Detall a mida gran | Color |
|---|---|---|---|
| **Oros** | **Cercle ple** | Moneda d'or vell: **anell de 28 perles** al perímetre, roseta central de **vuit pètals**, doble anell intern gravat. Llum especular al quadrant superior esquerre | `--oros` amb ombrejat a `--oros-fosc` |
| **Copes** | **Copa amb peu, silueta de rellotge de sorra** | Calze amb **gallons verticals**, nus esfèric al tronc, **dues nanses corbades** simètriques, base circular amb motllura. Un punt de llum al llavi de la copa | `--copes` amb ombrejat a `--copes-fosc` |
| **Espases** | **Vertical, prima, punxeguda** | Fulla recta amb **canal central**, **guardes corbades cap amunt**, empunyadura amb **tres anells**, pom esfèric. La fulla té dos tons per llegir-ne el gruix | `--espases` amb ombrejat a `--espases-fosc` |
| **Bastos** | **Diagonal, gruixut, irregular** | Garrot de fusta **amb veta**, **nusos de branca tallada** (3 o 4, asimètrics), extrems desiguals. És l'únic pal orgànic i ha de semblar-ho | `--bastos` amb ombrejat a `--bastos-fosc` |

**Regla de dibuix:** cap pal es dibuixa amb un únic to pla. **Mínim dos tons i una llum**, coherents amb §3.1.

### 6.5 Les figures (10 sota, 11 cavall, 12 rei)

- **Estil:** figura sencera, traç ferm, plans de color, **sense degradats suaus**. Xilografia moderna, no aquarel·la.
- **Postura tradicional**: el **rei** dret, de front, corona i ceptre, mantell; el **cavall** de perfil, muntat, amb el pal alçat; la **sota** dreta, de front o tres quarts, vestit d'escuder, sostenint el pal.
- **Cada figura sosté el pal del seu coll** i és l'element més gran de la composició després de la figura mateixa.
- **Paleta limitada per figura: 5 colors + tinta.** Això manté la coherència i abarateix l'encàrrec.
- **Les cares no miren el jugador amb expressió.** Serenes, neutres. Res de personatges simpàtics, res de caricatura, res de *fan service*.
- **Mai una figura girada/reflectida ("doble cap")**: la baralla espanyola tradicional és de figura sencera, i és part del que la fa reconeixible.

### 6.6 Índexs i llegibilitat — la part que no es pot fallar

Aquest és **el requisit funcional més important de tota la baralla**. Una carta en ventall ensenya una franja de 18–22 px de l'extrem superior esquerre. **Aquesta franja ha de contenir tota la informació necessària per decidir.**

1. **Alçada de la xifra: 13% de l'alçada de la carta** (130 px al llenç mestre). És notablement més gran que en una baralla física, i és deliberat.
2. **Símbol de pal just a sota**, al **9%** de l'alçada.
3. **Gruix del traç de la xifra ≥ 9% de la seva alçada.** Res de tipografia fina.
4. **La franja dels 22 px superiors esquerres no conté res més.** Ni marc, ni floró, ni pip.
5. **Índex bessó girat 180°** a la cantonada inferior dreta, idèntic.
6. **Prova d'acceptació:** imprimir la mà de 12 cartes en ventall a mida real de mòbil, mirar-la **a un braç de distància amb ulleres de lectura de +2,00**, i identificar les 12 cartes sense dubtar. Si falla, la baralla no està acabada.

### 6.7 Tractament especial de la manilla

El **9 és la carta més forta** de la botifarra i el jugador nou ho oblida constantment. La carta ho ha de dir sense text.

- El **9 duu un floró de cantonada diferenciat** als quatre angles — una corona oberta molt discreta.
- El filet interior del marc és **llautó `--llauto`** en lloc del color del pal.
- **Cap etiqueta, cap insígnia, cap brillantor.** És un privilegi ornamental, no un cartell.
- A **mode principiant** (§9.7 de `PROMPT.md`), i **només allà**, s'hi afegeix una etiqueta textual "manilla" sota l'índex, que desapareix per sempre quan el jugador la desactiva.

### 6.8 Variants obligatòries de la baralla

| Variant | Què canvia | Quan s'activa |
|---|---|---|
| **Estàndard** | — | Per defecte |
| **Gran** | Tot +35%; la mà passa a dues files si cal | Ajustos. **Ha de ser visible i fàcil de trobar**: és la funció que decideix si un jugador de 70 anys es queda |
| **Alt contrast** | §4.6 | `prefers-contrast: more` o ajustos |
| **Trama de pal** | Cada pal rep un **patró de fons distintiu** al camp central: oros = punts; copes = línies horitzontals; espases = línies verticals; bastos = diagonals. Al 8% d'opacitat | Ajustos → "distingir pals sense color". **Provat amb protanopia i deuteranopia** |
| **Índex doble** | Índex també a les cantonades superior dreta i inferior esquerra | Per a jugadors esquerrans, que sostenen el ventall al revés. **Gairebé ningú ho implementa i es nota** |

### 6.9 Pipeline tècnic

| | Decisió |
|---|---|
| **Punt de partida** | **`web/src/Carta.tsx` ja conté una baralla original completa i pròpia** (352 línies, **5 kB comprimida**, drets nets): pals dibuixats amb dos tons i llum, taula de disposició de pips, marc doble amb florons. **No es comença de zero: s'hi puja el nivell**, sobretot a les 12 figures, que ara són esquemàtiques |
| **Format mestre** | **SVG optimitzat**, un fitxer per carta, sense `<image>` incrustades, sense filtres de mapa de bits |
| **Per què SVG** | 48 cartes × 5 variants × 3 densitats en rasteritzat són centenars de fitxers. En vectorial, **la baralla sencera cap en menys de 400 kB** i és nítida a qualsevol mida i a qualsevol DPI |
| **Excepció** | Les **figures** (12 cartes) poden portar textura rasteritzada incrustada si cal, però com a **WebP a 3×**, mai PNG |
| **Entrega** | `assets/baralla/{pal}-{rang}.svg` + un **sprite `baralla.svg`** amb `<symbol>` per a producció |
| **Pressupost de pes** | Baralla completa **≤ 400 kB** comprimida. Primer pintat de la taula **≤ 180 kB** |
| **Optimització** | SVGO amb `convertPathData` de precisió 2; ids amb prefix per pal per evitar col·lisions al sprite |
| **Android** | Les mateixes SVG via `androidx.compose.ui.res` / conversió a `VectorDrawable` en compilació. **La font d'art és única per a les tres plataformes** |
| **Prohibit** | Fonts d'icones, emojis com a pals, caràcters Unicode de cartes (`🂡`) en cap circumstància |

---

## 7. La taula: layout per breakpoint

### 7.1 Mòbil vertical — 390 × 844 (el cas que mana)

```
┌──────────────────────────────┐
│  MARCADOR   36 px            │  Nosaltres · Ells · mà · fites
├──────────────────────────────┤
│  CONTRACTE  32 px            │  Pal de trumfo, multiplicador, qui canta
│                              │
│         ▓▓ rival dalt ▓▓     │
│                              │
│   ░░              ░░         │
│  esq.   ⬭ TAPET ⬭   dreta    │  El·lipse de feltre, 100% d'amplada
│   ░░              ░░         │
│                              │
│         [ la basa ]          │  4 posicions fixes, no apilades
│                              │
├──────────────────────────────┤
│                              │
│    L A   M E V A   M À       │  Terç inferior. Ventall.
│      ▐▌▐▌▐▌▐▌▐▌▐▌            │  Tocable amb el polze
└──────────────────────────────┘
```

- **El tapet és el·líptic**, no rectangular: `border-radius: 50% / 48%`. Omple l'espai i elimina la zona morta central que tenia el prototip.
- **La mà ocupa el terç inferior** i no la tapa mai cap altre element.
- **Zona del polze:** els últims 120 px verticals són intocables per a qualsevol element no interactiu.
- **Rotació bloquejada en vertical** al mòbil.

### 7.2 Mòbil apaïsat — 844 × 390

Permès però **no optimitzat**. El tapet s'eixampla, la mà passa a una sola fila més ampla, el marcador es col·lapsa a una barra lateral dreta de 120 px.

### 7.3 Tauleta — 834 × 1194

Mateixa estructura, tot escalat. **Les cartes creixen fins a 110 × 165**. Apareix la columna lateral d'**historial de bases** (les bases guanyades, en miniatura, a la dreta).

### 7.4 Escriptori — ≥ 1280

- **Amplada màxima del tapet: 900 px.** Mai més. Una taula que ocupa un monitor de 32 polzades no és premium, és mandra.
- **Tres columnes:** historial i xat a l'esquerra (280 px) · taula al centre · perfil, BR i anàlisi a la dreta (300 px).
- **Les columnes laterals són col·lapsables** i recorden l'estat.
- La taula manté la mateixa composició que al mòbil. **Un jugador que canvia de dispositiu no ha de reaprendre res.**

### 7.5 Reixa i espaiat

```
--e-1  4px    --e-2  8px    --e-3  12px
--e-4  16px   --e-5  24px   --e-6  32px
--e-7  48px   --e-8  64px
```

Res no fa servir un valor fora d'aquesta escala. **Cap `margin: 13px`.**

### 7.6 Radis

```
--r-carta   8px     (≡ 56px al llenç mestre)
--r-ui      4px     Botons, camps
--r-capa    16px    Fulls, targetes
--r-pill    999px   Insígnies, comptadors
```

---

## 8. Seients, jugadors i temps

### 8.1 Placa de jugador

Cada rival és una placa de **fusta amb filet de llautó**, no una targeta plana.

```
┌─────────────────────────────┐
│ ◯  Nom del jugador      1842│   avatar 40px · nom · BR
│    ▰▰▰▰▰▰▰▱▱▱  Mestre       │   anell de temps · categoria
└─────────────────────────────┘
```

- **Avatar:** 40 px, circular, amb **anell de 2 px del color de l'equip** (`--ok` per al teu equip, `--espases` per al rival). L'equip es llegeix abans que el nom.
- **El company sempre és a dalt.** Mai canvia de posició entre partides. La memòria muscular importa.
- **Nom truncat a 14 caràcters** amb el·lipsi, tooltip complet.
- **BR en mono tabular**, sempre visible.

### 8.2 El torn

**El senyal de torn és el més important de la interfície.** S'ha de poder llegir amb el mòbil a mig braç i sense fixar-s'hi.

- **Anell progressiu** al voltant de l'avatar, `--accent`, que es buida en sentit horari.
- **La placa del qui juga té elevació `--ombra-2`**; les altres, cap ombra.
- **Quan és el teu torn:** la vora inferior de la pantalla s'il·lumina amb un degradat `--accent` de 3 px, **la teva mà puja 8 px**, i hi ha **una vibració curta de 12 ms** (desactivable).
- **Mai un text "És el teu torn"** com a element principal. La llum ho diu.
- **Quan queden ≤ 5 s**, l'anell passa a `--avis`. **Mai a `--err`**, i mai amb parpelleig: crear ansietat a una partida de casal és un error de disseny.

### 8.3 Cartes vistes

Les cartes ja jugades per cada jugador es recullen en **una pila en miniatura** sota la seva placa (24 × 36 px, apilades amb 3 px de desplaçament). **Tocar-la la desplega.** És informació que a la taula real és pública i que els competidors amaguen sense motiu.

---

## 9. Components

### 9.1 Marcador — sempre visible, mai tapat

Barra superior de vidre (`--capa-1`), 36 px, fixa.

```
NOSALTRES  4        mà 3        ELLS  2
```

- Xifres a **`--t-l` (24 px) mínim**, mono tabular.
- **L'equip propi sempre a l'esquerra**, sempre `--ok`.
- **Quan canvia**, la xifra nova **entra des de baix amb un desplaçament de 8 px en 240 ms**. No compta amunt, no gira, no explota.
- Toc → desplega el **full de puntuació complet** de la partida.

### 9.2 Barra de contracte

Just sota el marcador, 32 px. **Respon la pregunta "a què estem jugant?" sense pensar-hi.**

```
[♦ símbol]  OROS  ×2        canta: Jordi
```

- Símbol del pal de trumfo **dibuixat**, no textual.
- **El multiplicador és el que la gent oblida**: `×2`, `×4`… en `--llauto` i a `--t-m`.
- Amb botifarra: `SENSE TRUMFO ×2`, amb el fons de la barra lleugerament més fosc.

### 9.3 Full de cantar

**No s'ha de poder cantar per error.** És la decisió més cara de la mà.

- **Full inferior** (`bottom sheet`) que ocupa el 58% de l'alçada, `--capa-2`, radi `--r-capa` a dalt, rerefons difuminat.
- **Quatre pals en reixa 2×2**, cada botó de **88 px d'alçada mínima**, amb:
  - el símbol del pal dibuixat, 32 px;
  - el nom del pal a `--t-m`;
  - **el nombre de cartes que en tens**, en mono, a la dreta. Aquesta xifra és l'ajuda de decisió i ha de ser-hi sempre.
- **Botifarra i Delegar, ample complet, separats per `--e-5` dels pals.** Han d'estar clarament en una altra categoria.
- **Cap temporitzador agressiu.** Si n'hi ha, és generós i no parpelleja.
- **Entrada del full:** 320 ms amb `--ease-entra`. **Sortida:** 220 ms amb `--ease-surt`.

### 9.4 Finestra de contro

- **Barra flotant** sobre la mà, `--avis`, amb **anell de temps generós i visible**.
- Dos botons: **Contro** (destacat) i **Passo** (secundari). **El gest de tancar equival a passar.**
- Amb Recontro i superiors, la barra puja el multiplicador i **canvia d'etiqueta**, no de color: el color ja diu "decisió pendent".

### 9.5 Cartes il·legals

**Impedir l'error val més que explicar-lo.**

- Carta il·legal: **opacitat 0.38, saturació 0.4, sense ombra, sense hover, `pointer-events: none`**.
- Si s'hi insisteix (toc a la zona), apareix **una etiqueta d'una línia sobre la mà** durant 2,2 s: *"Has de matar si pots"*, *"Has de jugar del pal"*, *"El company va guanyant"*. Un missatge concret per obligació, mai genèric.
- **Mai un modal. Mai un so d'error. Mai una vibració d'error.**

### 9.6 Final de mà — el moment que la gent vol comptar

Full complet amb **desglossament línia a línia**, no un total.

```
Cartes guanyades        41
Bases (últimes)          4
                    ─────
Total mà                45
Llindar                 36
Diferència              +9
Multiplicador           ×2
                    ─────
PUNTS                  +18
```

- Les línies **apareixen escalonadament, 90 ms entre línies**, mono tabular.
- El total final entra amb `--ease-carta` i **una única pulsació d'escala de 1.0 → 1.04 → 1.0** en 300 ms. Això és tota la celebració que hi ha.
- **Botó primari: "Una altra".** Secundari: "Per què?" → obre l'anàlisi.
- **Cap confeti. Cap fanfàrria. Cap pluja de monedes.**

### 9.7 Anàlisi post-mà ("Per què l'IA ha fet aquesta jugada?")

- **Línia de temps horitzontal** de les 12 bases, cadascuna amb la carta jugada en miniatura.
- Cada jugada té un **punt de color**: `--ok` (òptima), `--neutre` (acceptable), `--avis` (pèrdua notable). **Mai `--err`**: no es renya el jugador.
- En seleccionar una jugada: la carta jugada, **les 2 o 3 alternatives** amb el cost estimat, i **l'explicació en text**, generada asíncronament.
- Mentre l'explicació es genera: **esquelet de text**, no filadora.
- **L'anàlisi numèrica sempre hi és, encara que el text no arribi mai.** El text és un plus; el motor és el producte.

### 9.8 Botó de regles

- **Sempre accessible**, a la barra superior, com a **"?" de 44 × 44 px**.
- Obre un full lateral amb: **jerarquia amb cartes reals dibuixades**, valors, **les cinc obligacions**, multiplicadors.
- **No és un tutorial ni un modal d'onboarding**: és una fitxa de consulta que es pot obrir enmig d'una jugada sense perdre el torn.

---

## 10. Moviment

### 10.1 Corbes

```
--ease-carta   cubic-bezier(.22,.85,.28,1)    Tot el que és una carta amb massa
--ease-entra   cubic-bezier(.16,1,.30,1)      Capes que apareixen
--ease-surt    cubic-bezier(.40,0,1,1)        Capes que marxen
--ease-ui      cubic-bezier(.4,0,.2,1)        Micro-transicions d'interfície
```

**`linear` està prohibit** excepte en anells de progrés i barres de temps, on és l'única cosa honesta.

### 10.2 Coreografia, moment a moment

| Moment | Durada | Descripció |
|---|---|---|
| **Repartir** | **40 ms d'escalonament per carta**, 520 ms cada una | Surten del centre cap a cada seient, amb un gir d'entrada de −6° a 0°. 12 cartes ≈ 1,0 s en total. **Es pot saltar tocant la pantalla** |
| **Obrir el ventall** | 260 ms | Les cartes s'obren en arc; radi de l'arc = 3,2× l'amplada de la mà |
| **Passar per sobre / seleccionar** | 120 ms | La carta puja **14 px**, guanya `--ombra-carta-alta`, i **les veïnes s'aparten 4 px**. Aquest últim detall és el que ho fa semblar car |
| **Jugar una carta** | 300 ms | Arc cap a la seva posició a la basa, amb un gir aleatori final de **±3°** — les cartes reals no cauen rectes |
| **Aterratge** | +80 ms | Micro-rebot d'1,5 px i l'ombra que es tanca. **És el que dona pes** |
| **Recollir la basa** | 400 ms + 120 ms de pausa abans | Les 4 cartes s'apilen amb 30 ms d'escalonament i viatgen juntes cap a la placa del guanyador, encongint-se fins al 40% |
| **Canvi de torn** | 200 ms | L'anell es trasllada; les elevacions de placa s'intercanvien |
| **Final de mà** | 700 ms | El tapet es rebaixa un 6% de lluminositat i el full puja |
| **Full amunt** | 320 ms `--ease-entra` | Amb el rerefons difuminant-se en paral·lel |
| **Full avall** | 220 ms `--ease-surt` | Sempre més ràpid de sortir que d'entrar |

### 10.3 `prefers-reduced-motion`

**No és desactivar les animacions: és substituir-les.** Una carta que apareix de cop és pitjor que una que es mou.

- Les translacions es converteixen en **fosos de 120 ms**.
- Els escalonaments es col·lapsen a 0.
- **Es manté**: l'anell de torn, el canvi d'elevació, l'atenuació de cartes il·legals. Tot el que és informació es queda.

---

## 11. So

El so és part de la sensació premium i és **el que més barat surt i menys es fa**.

| Esdeveniment | Caràcter | Durada |
|---|---|---|
| **Repartir** | Frec de cartó sobre feltre, lleugerament diferent cada vegada (5 mostres en rotació) | 90 ms |
| **Jugar carta** | Cop sec i suau sobre tapet | 70 ms |
| **Recollir basa** | Lliscament de quatre cartes, més greu | 260 ms |
| **El teu torn** | **Cap so per defecte.** Opcional: una nota de fusta molt suau | 140 ms |
| **Cantar** | Clic de fusta, sòlid | 60 ms |
| **Contro** | El mateix clic, un to més alt | 60 ms |
| **Final de mà** | Un sol acord càlid, breu, sense cua | 500 ms |

**Regles:** volum per defecte al **40%** · **variació de to del ±4% aleatòria** a cada repetició perquè no soni a màquina · **cap música de fons, mai** · silenci total en un sol interruptor accessible · **res de veus, res de locutor, res d'aplaudiments**.

---

## 12. Hàptica (mòbil)

| Esdeveniment | Patró |
|---|---|
| Carta seleccionada | Impacte lleuger, 8 ms |
| Carta jugada | Impacte mitjà, 12 ms |
| És el teu torn | Impacte lleuger doble, 8 + 8 ms, separats per 90 ms |
| Contro disponible | Impacte mitjà, 14 ms |
| Final de mà guanyada | Impacte lleuger triple ascendent |
| **Error / jugada il·legal** | **Res.** Mai vibració negativa |

Tot desactivable en un sol interruptor. Per defecte **actiu** a mòbil, absent a escriptori.

---

## 13. Estats que normalment ningú dissenya

| Estat | Com es veu |
|---|---|
| **Càrrega inicial** | El tapet i el marc es pinten primer (són CSS, pesen zero). Les cartes apareixen quan arriben. **Cap filadora sobre pantalla en blanc** |
| **Esperant jugadors** | Els seients buits mostren **una placa de fusta buida amb el filet de llautó apagat** i el text "esperant". Si passen 12 s, s'ofereix **omplir amb IA** — botó clar, mai automàtic i silenciós |
| **Jugador desconnectat** | La seva placa es desatura (grisos) i l'avatar rep una insígnia de reconnexió. **L'IA agafa el seient als 30 s** amb avís visible a tots |
| **Reconnexió pròpia** | Barra superior `--avis`: "reconnectant…". **La taula no es buida ni es reinicia**: es congela tal com estava |
| **Partida abandonada** | Full sobri amb el resultat i el motiu. Cap culpabilització de ningú |
| **Sense connexió** | **Es pot jugar contra la màquina offline.** És una PWA; això és mig producte |
| **Zero partides jugades (perfil nou)** | El perfil no diu "no hi ha dades": mostra la taula de progressió Novell→Mestre buida i **on s'entra en guanyar la primera partida** |
| **Error de servidor** | Text humà, en català, i un botó de reintent. **Mai un codi d'error a la cara de l'usuari** |

---

## 14. Accessibilitat com a requisit de disseny

No és una llista de compliment: és **el nucli del producte**, perquè el públic té 65 anys.

1. **Contrast AA a tot arreu; AAA al text sobre tapet i a tots els índexs de carta.**
2. **Àrea tàctil mínima 48 × 48 px.** Sense excepcions, ni en icones de barra.
3. **Zoom del 200%** sense trencament ni desplaçament horitzontal.
4. **Pals distingits per forma sempre**, i per trama en la variant de §6.8.
5. **Lector de pantalla:** cada carta s'anuncia com "*nou d'oros, manilla, la més forta d'oros*"; l'estat de la basa i el marcador s'anuncien com a **regions `aria-live="polite"`**.
6. **Navegació completa per teclat** a escriptori: fletxes per recórrer la mà, `Enter` per jugar, `R` per a les regles, `Esc` per tancar fulls. **Focus visible amb anell `--accent` de 3 px**, mai suprimit.
7. **Mode gran (§6.8) promocionat al primer arrencada**, no amagat a tres nivells d'ajustos.
8. **Cap informació transmesa només per color, només per so o només per animació.**

---

## 15. Prohibicions

Llista tancada. Qualsevol d'aquests elements en una revisió és motiu de rebuig directe.

- ❌ Fitxes, monedes, bitllets, piles, qualsevol referència a diners.
- ❌ Neó, brillantors, partícules, espurnes, raigs, *lens flares*.
- ❌ Confeti, focs artificials, cofres, recompenses diàries animades.
- ❌ Taules temàtiques o cartes "de col·lecció" amb rareses.
- ❌ Gradients de tres o més parades a superfícies grans.
- ❌ Tipografia fina (pes < 400) en qualsevol text funcional.
- ❌ Text sobre imatge sense capa de contrast.
- ❌ Modals per confirmar una jugada.
- ❌ Compte enrere vermell i parpellejant.
- ❌ Text en anglès a la interfície catalana. **La interfície és en català, i el vocabulari és el del joc: *basa*, *trumfo*, *manilla*, *contro*, *cantar*, *delegar*.**
- ❌ Emojis com a pals o com a icones funcionals.
- ❌ Animació que impedeixi actuar. **El jugador ha de poder tocar durant qualsevol animació.**
- ❌ Qualsevol calc d'una baralla comercial (§6.0).

---

## 16. Tokens copiables

```css
:root{
  /* Materials */
  --feltre-base:#2C4A3E; --feltre-alt:#33574A; --feltre-baix:#243D33;
  --fusta:#3A2E24; --fusta-alta:#4A3B2E;
  --llauto:#C8AA78; --llauto-fosc:#8A7450;
  --paper:#F5F1E8; --paper-ombra:#E8E1D2;

  /* Tinta */
  --tinta:#1A1814; --tinta-2:#5C5449; --tinta-3:#8B8275;

  /* Pals */
  --oros:#B8860B;    --oros-fosc:#8A6408;
  --copes:#A32E2E;   --copes-fosc:#7A2222;
  --espases:#2E4A6B; --espases-fosc:#223855;
  --bastos:#4A6B2E;  --bastos-fosc:#375020;

  /* Estat */
  --accent:#C2703D; --accent-clar:#D98B58;
  --ok:#3E7A56; --avis:#C9952F; --err:#A33A28; --neutre:#6B6459;

  /* Superfícies */
  --capa-1:rgba(20,26,22,.72);
  --capa-2:rgba(16,21,18,.88);
  --capa-3:#131A16;
  --vora-suau:rgba(255,255,255,.08);
  --vora-forta:rgba(200,170,120,.22);

  /* Ombres */
  --ombra-1:0 2px 6px -2px rgba(0,0,0,.35);
  --ombra-2:0 8px 20px -8px rgba(0,0,0,.45);
  --ombra-3:0 18px 40px -18px rgba(0,0,0,.60);
  --ombra-carta:0 3px 8px -2px rgba(0,0,0,.40);
  --ombra-carta-alta:0 12px 24px -8px rgba(0,0,0,.50);

  /* Tipografia */
  --f-ui:'Inter',system-ui,sans-serif;
  --f-num:'IBM Plex Mono',ui-monospace,monospace;
  --f-titol:'Bitter',Georgia,serif;
  --t-xs:13px; --t-s:15px; --t-b:17px; --t-m:20px;
  --t-l:24px; --t-xl:30px; --t-2xl:40px;

  /* Espaiat */
  --e-1:4px; --e-2:8px; --e-3:12px; --e-4:16px;
  --e-5:24px; --e-6:32px; --e-7:48px; --e-8:64px;

  /* Radis */
  --r-carta:8px; --r-ui:4px; --r-capa:16px; --r-pill:999px;

  /* Moviment */
  --ease-carta:cubic-bezier(.22,.85,.28,1);
  --ease-entra:cubic-bezier(.16,1,.30,1);
  --ease-surt:cubic-bezier(.40,0,1,1);
  --ease-ui:cubic-bezier(.4,0,.2,1);
  --d-rapid:120ms; --d-base:260ms; --d-carta:300ms; --d-capa:320ms;
}

@media (prefers-color-scheme: dark){
  :root:not([data-tema="clar"]){
    --feltre-base:#223A30; --feltre-alt:#2A4739; --feltre-baix:#1B2E26;
    --fusta:#2C231B; --fusta-alta:#3A2E24;
    --paper:#EDE8DC; --paper-ombra:#DED8C9;
    --accent:#B8683A;
  }
}
:root[data-tema="fosc"]{ /* idèntic al bloc de dalt */ }

@media (prefers-contrast: more){
  :root{
    --feltre-base:#1E3329; --feltre-alt:#1E3329; --feltre-baix:#1E3329;
    --tinta-2:#3A342B;
    --ombra-carta:0 0 0 2px var(--tinta);
  }
}

@media (prefers-reduced-motion: reduce){
  :root{ --d-rapid:0ms; --d-base:120ms; --d-carta:120ms; --d-capa:120ms; }
}
```

---

## 17. Lliurables

### De l'il·lustrador de la baralla

1. **48 SVG** de cara, llenç 1000 × 1500, capes anomenades, a `assets/baralla/`.
2. **2 SVG de dors** (propi i rival).
3. **4 SVG de símbol de pal** aïllats, optimitzats per a 20 px.
4. **Variant de trama** (§6.8) com a capa commutable dins de cada SVG.
5. **Sprite `baralla.svg`** amb `<symbol id="oros-9">`… generat i verificat.
6. **Prova impresa** de la mà de 12 cartes a mida real, per a la prova de §6.6.
7. **Cessió de drets signada** (§6.0). **Sense això, res no entra al repositori.**

### Del dissenyador d'interfície

1. **Fitxer de disseny** amb els tokens de §16 com a variables reals, no colors solts.
2. **Pantalles a 390, 834 i 1440** de: taula en joc · full de cantar · finestra de contro · final de mà · anàlisi · perfil · llista de partides · sala d'espera · desconnexió.
3. **Els tres modes** (clar, fosc, alt contrast) de la pantalla de taula.
4. **Prototip de moviment** dels sis moments de §10.2 que decideixen la sensació.
5. **Full de components** amb estats: repòs, damunt, premut, focus, deshabilitat, carregant.
6. **Especificació de so** amb els set fitxers de §11.

---

## 18. Criteris d'acceptació

Es passa o no es passa. Sense terme mitjà.

- [ ] Un jugador identifica **les 12 cartes de la seva mà en ventall** a 390 px, a un braç de distància, amb ulleres de +2,00.
- [ ] Es distingeixen **els quatre pals en escala de grisos**.
- [ ] Es distingeixen **els quatre pals amb simulació de deuteranopia**.
- [ ] **De qui és el torn** es llegeix en menys d'1 segon sense buscar-ho.
- [ ] **El trumfo i el multiplicador** són visibles en tot moment sense cap gest.
- [ ] **Cap carta il·legal és tocable**, i el motiu s'explica en una sola línia concreta.
- [ ] **Zoom al 200%**: cap desplaçament horitzontal, cap solapament.
- [ ] **Tot el joc és navegable per teclat** a escriptori, amb focus visible.
- [ ] Amb **`prefers-reduced-motion`** el joc continua sent llegible i agradable.
- [ ] La **baralla completa pesa ≤ 400 kB**; el primer pintat, ≤ 180 kB.
- [ ] **60 fps** durant el repartiment i la recollida de basa en un mòbil de gamma mitjana de fa cinc anys.
- [ ] **Cap estat lleig**: càrrega, espera, desconnexió i error estan dissenyats.
- [ ] **Silenci total** amb un sol interruptor; **moviment reduït**, amb un altre.
- [ ] Un jugador de 70 anys troba el **mode gran** sense ajuda.
- [ ] **Cap element de la llista de §15** és present.

---

## 19. Els prompts tancats

### 19.1 Per a un dissenyador humà o un agent de disseny

> Dissenya la interfície completa de **Manilla**, una plataforma de botifarra en línia per a web, Android i Windows.
>
> **Principi rector: artesania de pòquer premium, iconografia de casal, no de casino.** Pren del millor programari de pòquer la qualitat dels materials, la coherència de la llum, el pes de les cartes, la cura dels estats i la consistència absoluta dels tokens. No en prenguis res de l'imaginari de casino: cap fitxa, cap moneda, cap neó, cap brillantor, cap confeti, cap referència a diners.
>
> L'escena de referència és **una taula de fusta noble en un casal, cap al tard, amb una làmpada penjant just a sobre**. Si una decisió visual no cabria en aquesta escena, és incorrecta.
>
> **El jugador tipus té 65 anys i un mòbil de 6 polzades.** Dissenya primer a 390 px d'amplada. El detall fi va als materials de fons; el contrast alt i el traç gruixut van a tot el que cal llegir per decidir: índexs de carta, pals, marcador, de qui és el torn i quines cartes són legals.
>
> Un sol model de llum: font càlida a dalt i lleugerament al davant, ombres sempre cap avall, mai dues ombres, el tapet no brilla mai. El feltre és verd fosc gastat amb gra al 3%; la fusta té veta subtil; el filet de llautó és mat, no daurat brillant; el paper de la carta és crema amb fibra al 2%.
>
> Lliura: taula en joc, full de cantar, finestra de contro, final de mà amb desglossament línia a línia, anàlisi post-partida, perfil, sala d'espera i estat de desconnexió — a 390, 834 i 1440 px, en mode clar, fosc i d'alt contrast. Inclou el prototip de moviment de sis moments: repartir, obrir el ventall, seleccionar una carta, jugar-la, recollir la basa i tancar la mà.
>
> Regles dures: àrea tàctil mínima de 48 × 48 px; marcador mai per sota de 24 px; contrast AA arreu i AAA als índexs; els pals distingits per forma abans que per color; cap informació transmesa només per color, so o animació; cap modal per confirmar una jugada; cap compte enrere vermell i parpellejant; interfície en català amb el vocabulari del joc (basa, trumfo, manilla, contro, cantar, delegar).
>
> La sensació objectiu: **un producte que un jugador de tota la vida obre i reconeix, i que un jugador de 25 anys troba millor fet que qualsevol cosa que hagi vist en aquesta categoria.**

### 19.2 Per a generació d'imatge (baralla i taula)

> **Baralla.** Una baralla espanyola de 48 cartes completament nova i original, dibuixada en vectorial, mai una còpia ni una reinterpretació de cap baralla comercial existent. Proporció 1:1,5. Paper crema `#F5F1E8` amb textura de fibra molt fina. Doble marc fi amb florons discrets a les quatre cantonades, del color del pal.
>
> Quatre pals, cadascun inconfusible per silueta a 20 píxels: **oros**, moneda d'or vell amb anell de 28 perles, roseta central de vuit pètals i doble anell gravat; **copes**, calze amb gallons verticals, nus esfèric al tronc, dues nanses corbades i base amb motllura; **espases**, fulla recta amb canal central, guardes corbades cap amunt, empunyadura amb tres anells i pom esfèric; **bastos**, garrot de fusta amb veta i tres o quatre nusos de branca tallada, asimètrics. Cada pal amb dos tons i una llum, mai color pla. Colors: or vell `#B8860B`, vermell terrós `#A32E2E`, blau acer `#2E4A6B`, verd oliva `#4A6B2E`.
>
> Figures de cos sencer en estil de xilografia moderna, plans de color, traç ferm, sense degradats suaus, cinc colors per figura més la tinta: rei dret de front amb corona, ceptre i mantell; cavall de perfil muntat amb el pal alçat; sota dret d'escuder sostenint el pal. Expressions serenes i neutres, mai caricatura.
>
> Índexs de cantonada molt grans i gruixuts: xifra al 13% de l'alçada de la carta, símbol de pal al 9% just a sota, traç gruixut, res més en aquesta cantonada, i el bessó girat 180° a la cantonada oposada.
>
> Dors vermell terrós `#7A2E2A` amb reticulat geomètric de densitat mitjana, doble filet crema i medalló oval central amb monograma; simètric a 180°, sense cap text.
>
> **Taula.** Vista gairebé zenital d'una taula de joc: feltre verd fosc gastat i mat, amb vinyeta suau, dins d'un marc de fusta de noguera amb veta i un filet de llautó mat de separació. Una sola llum càlida des de dalt, ombres curtes cap avall. Atmosfera de casal al capvespre, tranquil·la i sòbria. Absolutament res de fitxes, monedes, neó, brillantors, partícules ni cap element de casino.

### 19.3 Per a un agent de codi

> Implementa la capa visual de Manilla seguint `DISSENY.md` al peu de la lletra.
>
> Comença per **declarar els tokens de la §16 com a variables CSS a `:root`**, incloent-hi els blocs de `prefers-color-scheme: dark`, `prefers-contrast: more` i `prefers-reduced-motion: reduce`. **Cap valor literal de color, espaiat, radi, ombra o corba pot aparèixer enlloc més del codi**: tot passa pels tokens.
>
> Construeix el tapet com una **el·lipse (`border-radius: 50% / 48%`)** amb el degradat radial i el gra de la §3.2, i la vora com a filet de llautó amb ombra interior. Les cartes són **SVG del sprite `baralla.svg` via `<use>`**, mai imatges rasteritzades ni caràcters Unicode.
>
> Implementa **exactament les durades i corbes de la §10.2**, amb `transform` i `opacity` únicament — cap animació de propietats que provoquin *layout*. El jugador ha de poder tocar durant qualsevol animació.
>
> **Les cartes il·legals reben `pointer-events: none`** i els estils de la §9.5, i el motiu concret s'obté de la funció de regles del nucli de Rust, no d'una cadena genèrica del front-end.
>
> Compleix les **regles d'accessibilitat de la §14** com a requisits de compilació: àrea tàctil de 48 px, `aria-live` al marcador i a la basa, navegació completa per teclat amb anell de focus visible, i anunci de carta en el format "*nou d'oros, manilla, la més forta d'oros*".
>
> Verifica cada punt de la **llista de la §18** abans de donar res per acabat.

---

*Fi de `DISSENY.md` v1.0. Les decisions obertes que afecten el disseny són a la §22 de `PROMPT.md`: encàrrec i cessió de drets de la baralla, i comprovació de marca del nom.*
