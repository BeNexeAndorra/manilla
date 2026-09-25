# Manilla — Brief tècnic de construcció

> **Document mestre del projecte.** La plataforma definitiva de botifarra en línia. Conté tots els requisits de producte, de joc, tècnics i de disseny per construir el servei des de zero. Escrit per ser executable per un desenvolupador o per un agent de codi sense context previ.

| | |
|---|---|
| **Producte** | Botifarra en línia: multijugador, contra la màquina i mixt, **amb un motor que t'ensenya a jugar millor** |
| **Nom comercial** | `Manilla` — **provisional**, pendent de comprovar domini i marca (§2) |
| **Territori** | Catalunya · País Valencià · Balears · Catalunya Nord · **Andorra** · catalans a fora |
| **Idiomes** | Català primer · castellà · francès · anglès |
| **Plataformes** | **1r Web + PWA · 2n Android · 3r Windows.** iOS més endavant |
| **Backend** | Rust |
| **Nucli de joc i IA** | Rust, compilat a tres destins |
| **Servidor de proves** | Hetzner propi (Ryzen 5 3600 · 62 GB RAM · sense GPU útil) |
| **Versió** | 1.2 · 25 de setembre del 2026 |

---

## 0. Resum executiu i posicionament

### 0.1 El que ja existeix

Abans d'escriure res s'ha comprovat la competència. **La categoria està ocupada:**

| Producte | Què fa | Què no fa |
|---|---|---|
| **Butifarra** (Piqture Games) | Android i iOS. Partides amb amics o contra IA. Trumfo, botifarra, delegar, contra i recontra, fins a 101 amb regles oficials. **Tres nivells d'IA: fàcil, mitjà i difícil, aquest últim recordant les cartes vistes.** Català, castellà, anglès, francès. Funciona sense connexió. **Cartes grans i interfície clara pensada per a gent gran.** Compra única que treu la publicitat per sempre, sense seguiment | Cap eina d'aprenentatge |
| **botifarra.app** | Multijugador en temps real, IA amb dificultat adaptativa, lligues, tornejos, rànquings, estadístiques, il·lustracions pròpies. Beta oberta, iOS i Android | **Zero contingut educatiu.** Ni anàlisi, ni explicacions, ni tutoria |
| **ButiCard** · **ButiNET** · **Ludoteka** | Multijugador, sales, rànquings, xat | Ídem |

### 0.2 La conclusió que dona sentit al projecte

**Tot el que existeix és un lloc per JUGAR. Cap és un lloc per MILLORAR.**

Un jugador de botifarra que vol progressar només té dues vies: que algú gran li expliqui els senyals al casal, o perdre moltes partides fins a deduir-ho. **No hi ha cap producte que li digui per què aquella carta era un error.**

Això és el producte. La resta —multijugador, rànquings, tornejos, clans— és el preu d'entrada, no el diferenciador. **Tothom ho té; ningú té el motor.**

### 0.3 Les quatre decisions que determinen si funciona

1. **La IA que juga ha de ser demostrablement millor** que un comptador de cartes. La competència arriba a «recorda les cartes vistes»; això és memòria, no càlcul. La §4 hi respon amb cerca d'arbre sobre informació imperfecta.
2. **La IA que ensenya ha de dir coses certes.** Un consell genèric destrueix la credibilitat més de pressa que el silenci. Regla dura a la §5: **cap explicació que el motor no pugui demostrar amb números**.
3. **Mai s'ha d'esperar taula.** Un joc de quatre en un territori petit es mor esperant. La §6.2 ho resol amb relleu automàtic d'IA.
4. **El rating ha de mesurar com jugues, no amb qui et toca.** En botifarra depens del company; un ELO clàssic castiga qui juga bé amb un company fluix. La §10 usa el motor d'anàlisi per mesurar la **qualitat de les decisions**, que és una cosa que cap competidor pot fer perquè no té motor.

---

## 1. El joc — especificació formal

> Aquesta secció **és l'especificació del motor de regles**. Qualsevol ambigüitat aquí es converteix en un error reproduïble a taula.

### 1.1 Taula i repartiment

- **4 jugadors, 2 parelles fixes**, els companys asseguts un davant de l'altre.
- Baralla espanyola de **48 cartes**: oros, copes, espases i bastos, de l'1 al 12.
- Repartiment **en sentit antihorari**, en grups de 4 cartes, començant pel jugador de la dreta del qui reparteix.
- Cada jugador rep **12 cartes**.

### 1.2 Jerarquia dins d'un pal

```
9 (manilla) · 1 (as) · 12 (rei) · 11 (cavall) · 10 (sota) · 8 · 7 · 6 · 5 · 4 · 3 · 2
```

**El 9 és la manilla** i mana per sobre de l'as.

### 1.3 Valor en punts

| Carta | Punts |
|---|---|
| 9 · manilla | **5** |
| 1 · as | **4** |
| 12 · rei | **3** |
| 11 · cavall | **2** |
| 10 · sota | **1** |
| 8 · 7 · 6 · 5 · 4 · 3 · 2 | 0 |
| **Cada basa guanyada** | **1** |

**Total per mà: 72 punts.** 60 de cartes (15 per pal × 4) més 12 de bases.

### 1.4 Cantar el trumfo

Qui reparteix fa una d'aquestes tres coses:

1. **Cantar un pal** com a trumfo.
2. **Cantar botifarra**: es juga sense trumfo.
3. **Delegar** al company, que **està obligat a cantar** i no pot tornar a delegar.

### 1.5 Multiplicadors

| Declaració | Qui la pot dir | Multiplicador | Amb botifarra |
|---|---|---|---|
| — | — | ×1 | **×2** |
| **Contro** | La parella contrària a qui ha cantat | ×2 | ×4 |
| **Recontro** | La parella que havia cantat | ×4 | ×8 |
| **Sant Vicenç** | La contrària | ×8 | no aplica |
| **Barraca** | La que havia cantat | ×16 | no aplica |

> La barraca és pròpia d'algunes comarques de Lleida, només després del recontro i en partides sense botifarra. **Configurable per taula, desactivada per defecte.**

### 1.6 Recompte

```
punts_anotats = (punts_obtinguts − 36) × multiplicador
```

Guanya la primera parella que arriba a **101**.

### 1.7 Obligacions en jugar

La part on més s'equivoquen les implementacions, i la que fa que la botifarra sigui un joc de deducció.

1. **Cal servir el pal** que s'ha sortit, si se'n té.
2. **Si el company no va guanyant la basa, cal matar** sempre que es pugui.
3. **Si no es té el pal i el company no va guanyant, cal fallar** (jugar trumfo).
4. **Si el company va guanyant, no hi ha obligació** de matar ni de fallar.
5. Si no es pot matar ni fallar, es juga lliurement.
6. **La comunicació entre companys està prohibida** fora del que diuen les cartes.

> **Conseqüència de disseny:** aquestes obligacions **eliminen gairebé tot el faroleig**. La botifarra no és pòquer. L'«engany» hi existeix però és **legal i indirecte**: està en quina carta tries quan en tens diverses de vàlides, i en el que això diu o amaga. La §5.3 hi torna, perquè és el nucli del que cal ensenyar.

### 1.8 Reglament de referència

**Font de veritat: el reglament oficial del Campionat de Catalunya de Botifarra.** És el mateix que diu seguir la competència directa —l'app de Piqture anuncia «regles oficials»— i és el que fan servir els casals i les colles que seran els primers clients.

**Per què aquest i no un altre:** quan un jugador de casal discuteixi una jugada, la resposta ha de ser «el reglament del campionat diu això», no «nosaltres ho hem interpretat així». **Discutir el reglament amb un client és una discussió que no es guanya.**

La transcripció en línia que fa servir la comunitat és la publicada a **butinet.cat**, i serveix com a referència accessible per a l'equip.

> **Regla d'implementació:** cada prova del mòdul `rules` porta al comentari **l'article concret** del reglament que verifica. Quan algú qüestioni una jugada, s'ha de poder anar de la queixa a la prova en trenta segons.

### 1.9 Variants configurables per taula

| Variant | Opcions | Per defecte |
|---|---|---|
| Obligada / Lliure | Rigor de les obligacions | **Obligada** |
| Barraca | Sí / No | No |
| Punts de partida | 101 · 51 (curta) | 101 |
| Delegació | Permesa / No | Permesa |

**Les variants són dades, no branques de codi.** Una taula guarda el seu conjunt de regles i el motor l'obeeix. Això permet que un casal del Pallars i un de Manresa juguin cadascú com juga a casa, que és una demanda real.

---

## 2. El nom

**`Manilla`** és la proposta principal:

- És **la carta que mana** i identifica el joc per a qualsevol jugador.
- Dues síl·labes, es pronuncia igual en català i castellà.
- No conté «botifarra», cosa que **evita col·lisió directa** amb `botifarra.app`, `butinet.cat` i l'app de Piqture, i deixa espai per créixer cap a la manilla i el guinyot.

**Alternatives:** `Trumfo` · `Basa` · `Arrossega` · `Cantar`.

> ⚠️ Comprovar `manilla.cat` i `manilla.app` i fer cerca de marca abans d'invertir en identitat.

---

## 3. Arquitectura

### 3.1 El principi que ho ordena tot

**Un sol nucli en Rust, tres destins.** Regles i IA s'escriuen **una vegada** i es compilen per a:

| Destí | Com | Per a què |
|---|---|---|
| **Natiu** (servidor) | `cargo build` | Àrbitre autoritatiu del multijugador |
| **WASM** (navegador i PWA) | `wasm-pack` | Joc contra la màquina **sense connexió** i validació instantània |
| **Android** | Tauri 2 / UniFFI | La mateixa lògica dins de l'app |

Tres conseqüències que valen molt:

1. **Impossible que client i servidor discrepin** sobre la legalitat d'una jugada: és el mateix codi.
2. **El joc contra la màquina no consumeix servidor.** Cost marginal zero i funciona al metro.
3. **Una sola bateria de proves** valida les tres plataformes.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Web + PWA        │  │ Android (Tauri 2)│  │  Servidor Rust   │
│ Vite + React     │  │   core natiu     │  │   core natiu     │
│ core.wasm        │  │                  │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │      WebSocket      │                     │
         └─────────────────────┴─────────────────────┤
                    ┌──────────────────────────────  ┴─────────┐
                    │ Axum · sales · emparellament · BR        │
                    │ PostgreSQL · historial · repeticions      │
                    │ LLM (només explicar, mai jugar)          │
                    └──────────────────────────────────────────┘
```

### 3.2 `botifarra-core`

```
core/
├── src/
│   ├── cards.rs        Pal, Carta, ordre, valor
│   ├── deal.rs         Repartiment reproduïble amb llavor
│   ├── rules.rs        Jugades legals, obligacions (§1.7), variants
│   ├── trick.rs        Resolució de la basa
│   ├── scoring.rs      Comptatge, multiplicadors, 101
│   ├── state.rs        Estat de la mà, serialitzable
│   ├── infoset.rs      El que sap cada jugador
│   ├── ai/
│   │   ├── ismcts.rs   Cerca d'arbre sobre informació imperfecta
│   │   ├── policy.rs   Heurístiques de cantar, contrar i recontrar
│   │   ├── infer.rs    Deducció a partir del que s'ha jugat
│   │   ├── signals.rs  Lectura i emissió de senyals al company
│   │   ├── style.rs    Estil de joc configurable (§4.6)
│   │   └── levels.rs   Nivells de dificultat
│   └── analysis.rs     Avaluació de jugades alternatives (§5)
└── tests/
    ├── rules/          Cada obligació de la §1.7, cas a cas
    ├── scoring/        Cada multiplicador
    └── replay/         Partides reals reproduïdes
```

**Regles de codi no negociables:** `#![forbid(unsafe_code)]` · `#![deny(clippy::all)]` · el nucli **no fa entrada/sortida** i és una funció pura de l'estat · tot estat és serialitzable i reproduïble des d'una llavor · cap `unwrap()` fora de tests.

### 3.3 Llenguatges i versions

| Capa | Tecnologia | Per què |
|---|---|---|
| Nucli i IA | **Rust 2024** | Rendiment per a la cerca, i un sol codi per a tres plataformes |
| Servidor | **Rust · Axum 0.8 · Tokio** | WebSockets natius, mateix llenguatge que el nucli |
| Base de dades | **PostgreSQL 16 · SQLx** | Consultes verificades en compilació |
| Web i PWA | **Vite · React 19 · TypeScript estricte** | SPA darrere d'autenticació: **no cal Next.js**, i Tauri vol sortida estàtica |
| Animació | **Motion** | Les cartes s'han de moure bé: és mitja sensació del producte |
| Estils | **Tailwind 4** amb els tokens de la §9 | |
| Android | **Kotlin + Jetpack Compose** amb el nucli Rust via **UniFFI** | Rendiment natiu on el públic té mòbils modestos (§3.5) |
| Windows | **Tauri 2** | Reaprofita el frontend web; **l'escriptori és el camí madur** de Tauri |
| Model de llenguatge | **Salamandra 7B-instruct** (BSC) al servidor propi | §5.6 |
| Veu | **LiveKit** (§8.4) | WebRTC gestionat, fase tardana |

> **Per què Vite i no Next.js:** no hi ha res a renderitzar al servidor —tot passa darrere d'autenticació i en temps real— i Tauri necessita sortida estàtica. Next.js hi afegiria complexitat sense donar res. **Decisió conscient, diferent de la dels altres projectes del Marcel.**

### 3.4 PWA

La web **és** la PWA: instal·lable, amb icona, pantalla completa i **joc contra la màquina sense connexió** gràcies al nucli en WASM. Treballador de servei que cacha l'aplicació i les cartes; la partida local es guarda a IndexedDB i es reprèn.

**Per a molts usuaris la PWA serà suficient i no caldrà que instal·lin res d'una botiga.** L'app d'Android és per a qui vol presència a la botiga i notificacions natives.

### 3.5 Android — decisió presa: Kotlin natiu

**Android es fa en Kotlin amb Jetpack Compose, i el nucli Rust s'hi enllaça via UniFFI.** No amb Tauri.

**Per què, i és una decisió de risc, no de comoditat:**

| Motiu | |
|---|---|
| **El públic** | Aquest joc el juga gent gran amb **mòbils de gamma mitjana i baixa**. És exactament on una WebView pateix amb animacions contínues de cartes, i on una interfície nativa guanya de carrer |
| **Maduresa** | El suport mòbil de Tauri és **la part més nova** del framework. L'escriptori fa anys que va; el mòbil, no |
| **Dependència de plataforma** | Amb WebView depens dels canvis de la WebView d'Android i de les polítiques de Google sobre aplicacions embolcallades. Amb Kotlin, no |
| **Futur** | Widgets, notificacions, integració amb el sistema, rendiment: tot és més senzill i més estable en natiu |

**El que es comparteix igualment:** **tota la lògica.** Regles, comptatge, variants i **la IA sencera** viuen a `botifarra-core` en Rust i es compilen per a Android via UniFFI, que genera els lligams de Kotlin automàticament. **La part difícil no es reescriu mai.**

**El que costa:** la interfície d'Android s'escriu una segona vegada en Compose. És un cost real i s'assumeix conscientment. A canvi:

- **Desapareix la porta de decisió de la F3.** La incertesa que hi havia al pla ja no hi és.
- La interfície d'Android pot ser **més simple** que la web: menys pantalles de gestió, més joc.
- Compose i React s'assemblen prou perquè el disseny de la §9 es tradueixi gairebé directament.

> **Windows sí amb Tauri.** Allà l'argument s'inverteix: l'escriptori és el camí madur del framework, el públic juga en una pantalla gran sense restriccions de rendiment, i **reaprofita el frontend web sencer**. És una setmana de feina, no un projecte.

**Resum de l'arquitectura per plataforma:**

```
botifarra-core (Rust)  ────┬──→  WASM      →  Web i PWA (React)
   regles + IA            ├──→  UniFFI    →  Android (Kotlin + Compose)
   escrit UNA vegada      ├──→  natiu     →  Windows (Tauri, frontend web)
                          └──→  natiu     →  Servidor (Axum)
```


---

## 4. La IA que juga

### 4.1 Per què no un model de llenguatge

**Un model de llenguatge és l'eina equivocada per triar cartes.** És lent, costa diners per jugada i és feble en càlcul combinatori. Un motor de cerca hi juga infinitament millor, gratis i al dispositiu.

**El model de llenguatge té un únic lloc: explicar. Mai decidir.**

### 4.2 L'algorisme

La botifarra és un joc d'**informació imperfecta**. L'algorisme adequat és **ISMCTS** (cerca d'arbre de Monte Carlo sobre conjunts d'informació):

1. **Determinització.** Es generen repartiments possibles de les cartes ocultes, **compatibles amb tot el que s'ha jugat** i amb les obligacions de la §1.7.
2. **Cerca.** Cerca d'arbre sobre cada determinització.
3. **Agregació.** Es tria la jugada que millor es comporta de mitjana.

> **La clau és el pas 1, i és on la competència no arriba.** Cada carta jugada és informació dura: si un jugador **no ha servit un pal, no en té** — i això és certesa, no probabilitat, perquè les obligacions no permeten mentir. Un comptador de cartes **recorda**; aquest motor **dedueix**. La diferència es nota exactament a les mans difícils.

### 4.3 Què ha de tenir a la memòria

Requisit explícit del producte. L'estat intern de la IA manté, a cada moment:

| | |
|---|---|
| **Cartes jugades** | Totes, amb ordre i basa |
| **Cartes impossibles** | Per jugador i pal, deduïdes de cada vegada que no ha servit |
| **Distribució probable** | Probabilitat per carta i jugador, actualitzada a cada jugada |
| **Mà del company** | Inferida dels seus senyals i de la seva declaració |
| **Trumfo i trumfos vius** | Quants en queden i qui els pot tenir |
| **Punts sobre la taula** | Els de la basa en curs i els ja guanyats per banda |
| **Situació de la partida** | Marcador global: a 95-40 no es juga igual que a 40-40 |
| **Estil del rival** | Model per jugador: agressiu al contro, conservador arrossegant… |

### 4.4 Nivells

| Nivell | Determinitzacions | Deducció | Perfil |
|---|---|---|---|
| **Aprenent** | 50 | Bàsica | Juga raonablement i **comet errors versemblants**, no aleatoris |
| **Casal** | 300 | Completa | El jugador habitual d'un casal |
| **Comarcal** | 800 | Completa + senyals | Bon jugador de colla |
| **Campió** | 2.000 | Completa + modelatge del rival | Ha de guanyar el Marcel |
| **Anàlisi** | 20.000 | Completa | **No juga en directe**: motor de referència de la §5 |

**Requisit dur:** al nivell Casal, la jugada surt en **menys de 800 ms al mòbil**. Si no, es baixen determinitzacions. Un rival que fa esperar arruïna el ritme.

### 4.5 Cantar, contrar i recontrar

No és cerca d'arbre: és valoració de la mà pròpia amb informació nul·la sobre les altres. S'implementa com a **política avaluada per simulació**: per a cada opció —cada pal, botifarra, delegar— es simulen mans dels altres tres i es mesura el resultat esperat, **ponderat per la situació del marcador**.

### 4.6 Estil de joc

Cada bot té un **estil** que modifica la seva política sense tocar la cerca: propensió al contro, agressivitat arrossegant, tendència a guardar la manilla. Això fa que **quatre bots del mateix nivell no juguin igual**, que és el que evita que el joc contra la màquina es torni previsible.

### 4.7 «Per què l'IA ha fet aquesta jugada?»

Funció explícita del producte, disponible **a la revisió de la partida**: qualsevol jugada d'un bot es pot desplegar i el motor mostra les alternatives que va considerar i per què va triar aquella.

Té un efecte secundari valuós: **fa la IA auditable**. Si un jugador sospita que el bot fa trampes —queixa universal en jocs de cartes— pot veure exactament amb quina informació va decidir. **Cap competidor pot oferir això, perquè per oferir-ho cal tenir un motor que raoni.**

### 4.8 Com es demostra que és millor

No val dir-ho, cal mesurar-ho:

- **Torneig intern:** cada nivell juga 10.000 mans contra els altres i contra una implantació de referència de comptatge de cartes.
- **Criteri de sortida:** Campió guanya **>65% de les mans** contra un comptador ben fet, amb el mateix repartiment jugat des de les dues bandes per eliminar la sort.
- **Mesura pública:** taxa de victòria contra humans per tram de nivell, ensenyada al producte.

---

## 5. La IA que ensenya — el producte de veritat

### 5.1 Regla dura

**Cap explicació que el motor no pugui demostrar amb números.**

El model de llenguatge **mai decideix què va estar malament**. Rep del motor una taula d'alternatives avaluades i **només posa les paraules**. Si el motor no troba diferència significativa, **el producte calla**. Val més no dir res que dir una obvietat: la credibilitat d'un entrenador es perd una sola vegada.

### 5.2 Com funciona

Acabada la mà, el nivell **Anàlisi** reavalua cada decisió amb 20.000 determinitzacions i coneixement complet a posteriori:

```
Basa 7 · vas jugar: 7 de copes
  7 de copes      probabilitat de guanyar la basa  72%    valor esperat  +2,1
  5 d'espases     probabilitat de guanyar la basa  81%    valor esperat  +7,4   ← millor
  4 de copes      probabilitat de guanyar la basa  64%    valor esperat  +6,9
  Diferència: 5,3 punts
```

Si la diferència supera el llindar, es marca com a **error** i es demana al model que ho expliqui **en català natural, en dues frases, sense tecnicismes**.

### 5.3 De què ha de saber parlar

Aquí viu «estratègies, tècniques i enganys», i cal precisió perquè **en botifarra aquestes paraules no volen dir el que semblen**:

| Concepte | Què ha d'explicar |
|---|---|
| **Senyals** | Què li dius al company quan tries entre cartes igualment legals. És el llenguatge real del joc |
| **Arrossegar** | Quan treure trumfos i quan no; el cost d'arrossegar massa aviat |
| **Guardar la manilla** | Quan és per matar i quan és per fer punts |
| **Comptar el pal** | Deduir qui té què a partir de qui no ha servit |
| **Cantar** | Per què aquella mà era de botifarra i no d'oros |
| **Contrar** | Quan el contro és rendible i quan és vanitat |
| **Situació** | Per què a 95-40 es juga diferent |
| **Engany legal** | **No és faroleig.** És escollir, entre jugades vàlides, la que amaga informació o fa deduir malament. Les obligacions de la §1.7 fan que sigui l'únic engany possible, i això s'ha de dir explícitament: qui ve del pòquer ho entén al revés |

### 5.4 On apareix al producte

| Lloc | Què |
|---|---|
| **Final de mà** | «Tens 2 jugades a revisar» — discret, mai interromp |
| **Repetició** | Reproducció basa a basa amb alternatives i «per què l'IA va jugar això» |
| **El meu joc** | Patrons repetits: «arrossegues massa aviat en 6 de les últimes 10 partides» |
| **Entrenament** | Mans preparades amb objectiu concret i correcció immediata |
| **Durant la partida** | **Res.** Cap consell en directe: seria trampa en multijugador i una crossa contra la màquina |

### 5.5 Cost

L'anàlisi del motor és local i gratuïta. El model de llenguatge només s'invoca **per a jugades ja marcades com a error**, en lot i de manera asíncrona: **2–4 crides per partida, menys d'1 cèntim**. Només l'assumeixen els comptes de pagament.

### 5.6 Quin model, i quant costa

> **La pregunta important té una resposta que sorprèn: la part caríssima d'una IA de cartes aquí és gratis.**
> El motor que juga (§4) és **cerca, no model**: no crida cap API, no costa ni un cèntim i corre al dispositiu de l'usuari. L'única despesa possible és **escriure les explicacions**, i és una tasca petita.

**Per què la tasca és petita.** El model **no analitza la partida** —això ja ho ha fet el motor— sinó que rep una taula de números i escriu dues frases en català. És generació restringida, no raonament. Per tant no cal un model gran.

| | Entrada | Sortida |
|---|---|---|
| Per explicació | ~800 tokens (context de la mà + alternatives avaluades) | ~80 tokens |
| Per partida | 2–4 explicacions | |

#### Recomanació: model propi al teu servidor Hetzner

**`Salamandra 7B-instruct`**, del Barcelona Supercomputing Center.

| Motiu | |
|---|---|
| **Fet per al català** | Família de models per a llengües europees on **el català s'ha sobremostrat ×2**. La variant *instruct* s'ha entrenat amb 276.000 instruccions en anglès, castellà i **català** |
| **Llicència Apache 2.0** | Ús comercial permès sense condicions |
| **Hi cap de sobres** | Quantitzat a `Q4_K_M` ocupa ~4,5 GB i en demana 5–6 de RAM. **En tens 55 de lliures** |
| **Cost marginal: zero** | Cap crida externa, cap factura per explicació |
| **Les mans no surten del teu servidor** | Argument real de privadesa i un cost operatiu menys |

**Rendiment esperat al teu Ryzen 5 3600 amb `llama.cpp`:** un model de 7B a `Q4_K_M` es mou entre **5 i 9 tokens per segon** en CPU d'aquesta generació. Una explicació de 80 tokens són **10–16 segons**.

> **Això és perfectament acceptable perquè la tasca és asíncrona.** L'explicació es genera **després de la mà**, en segon pla i en lot. L'usuari no espera mai: quan obre la revisió, ja hi és. **Si la generació fos síncrona, aquesta decisió seria equivocada.**

**Variant més ràpida:** `Salamandra 2B-instruct` va unes tres vegades més de pressa (3–5 segons per explicació). Com que la feina és escriure dues frases amb els números donats, **és molt probable que n'hi hagi prou**.

**Regla: començar pel 2B i pujar al 7B només si la validació de la §15 falla.** No al revés.

#### Sortida de seguretat

Tot darrere d'un `trait ExplainProvider`, igual que el nucli. Canviar de model o passar a una API és **una línia de configuració**, no una reescriptura.

```toml
[explain]
provider = "local"              # local | gemini | openai
model    = "salamandra-2b-instruct-q4_k_m"
endpoint = "http://127.0.0.1:8080"
max_tokens = 120
timeout_s  = 45
```

**Si algun dia cal API** —perquè la qualitat no arriba o perquè el volum supera el servidor— l'opció barata és un model de gamma *flash*: amb ~800 tokens d'entrada i 80 de sortida, l'explicació surt **per sota d'un cèntim de cèntim**, i una partida sencera per unes **dues centèsimes de cèntim**. És a dir: **ni tan sols llavors el cost és un problema.** La raó per triar el model propi no és el preu, és no dependre de ningú i que les dades no surtin.

#### El que el model NO pot fer, mai

- **No tria cartes.** Ni en el joc ni a l'anàlisi.
- **No decideix què va estar malament.** Això ho diu el motor amb números (§5.1).
- **No inventa probabilitats.** Totes les xifres del text venen del motor i es validen abans de mostrar-les: si el text conté un número que no és a la taula d'entrada, **l'explicació es descarta**.

---

## 6. Modes de joc i emparellament

### 6.1 Modes

| Mode | Descripció |
|---|---|
| **Contra la màquina** | 3 bots, estil i nivell configurables. **Sense connexió** |
| **Partida pública** | Emparellament per BR (§10) |
| **Amb amics** | Sala privada amb codi o enllaç |
| **Mixt** | Els llocs buits els ocupen bots del nivell que decideix la sala |
| **Repte** | Desafiar un jugador concret, amb notificació |
| **Entrenament** | Mans preparades amb objectiu i correcció |
| **Torneig** | Eliminació o lliga, per a clubs i colles |
| **Espectador** | Veure una partida en curs (§7) |

### 6.2 El relleu d'IA — la decisió que fa viable el producte

> **El problema:** un joc de quatre jugadors en un territori petit **es mor esperant taula**. A les 3 de la matinada, un dimarts d'agost, o a Perpinyà, no hi ha ningú connectat. Si l'usuari ha d'esperar, no torna.

**Regla: la partida comença sempre.**

```
00:00  Entres a una sala pública
00:08  No hi ha ningú → entren 3 bots del teu nivell de BR
00:09  La partida comença
02:30  Entra un humà → substitueix un bot
       · el relleu es fa NOMÉS entre mans, mai a mitja mà
       · la mà en curs l'acaba el bot
       · s'avisa els dos jugadors afectats
04:10  Entren dos humans més → substitueixen els bots restants
```

**Detalls que decideixen si això és agradable o molest:**

- **El relleu només passa entre mans.** Substituir algú a mitja mà trencaria la partida.
- **El jugador pot bloquejar el seu lloc** si vol acabar contra bots.
- **Es marca a la interfície qui és bot i qui és humà**, sempre. Amagar-ho seria enganyós i es descobriria.
- **Les mans jugades amb bots compten per a l'historial però no per al BR** (§10.4).
- **Si algú cau**, un bot del seu nivell ocupa el lloc i el jugador **pot recuperar-lo** durant 120 segons. Això mata l'abandonament, que és el que enfonsa els jocs de quatre.

---

## 7. Espectador i retransmissió

Surt gairebé gratis perquè **tota partida es reconstrueix des de `seed` + `moves`** (§12).

| Funció | |
|---|---|
| **Espectar en directe** | Veure una partida en curs **amb retard de 30 segons** i sense veure cap mà, o amb totes si els quatre hi consenten |
| **Repetició** | Qualsevol partida acabada, basa a basa, amb l'anàlisi superposada |
| **Retransmissió de torneig** | Taula final amb comentari automàtic del motor: «la parella de la Núria té un 78% de probabilitat de guanyar aquesta mà» |
| **Compartir una mà** | Enllaç públic a una mà concreta. **És el millor canal de captació que tindrà el producte**: els jugadors discuteixen mans, i discutir-les amb l'anàlisi a la vista ven sol |
| **Exportar** | La mà en format de text per enganxar a un grup de missatgeria |

> **El retard de 30 segons és obligatori** a l'espectador en directe: sense ell, un espectador pot avisar un jugador per fora i el sistema antitrampes queda inútil.

---

## 8. Social

### 8.1 Perfil i avatars

Àlies · avatar · comarca opcional · club · BR i categoria · estadístiques · assoliments · historial públic o privat.

**Avatars:** joc propi il·lustrat —no fotos— amb peces desbloquejables per assoliments. Evita moderació d'imatges pujades, que és un cost operatiu constant, i reforça la identitat visual.

### 8.2 Clubs, penyes i colles

**És el camí comercial real:** la botifarra es juga en grups que **ja existeixen fora de línia**. El producte hi ha d'entrar com a grup, no un a un.

Grup privat amb rànquing propi · tornejos i campionats interns · calendari de partides · gestió de membres · estadístiques del club · retransmissió de la final.

### 8.3 Xat

- **Durant la partida: només frases predefinides** («bona jugada», «me'n vaig», «ben jugat»), en totes les llengües. Text lliure entre companys **és una via de trampa** i s'ha de tancar.
- **Text lliure a la sala d'espera, al club i entre amics.**
- Denúncia i bloqueig a tot arreu. Silenci automàtic per denúncies repetides.

### 8.4 Veu opcional

**Fase tardana, i amb els ulls oberts.** La veu és el que més s'assembla a jugar al casal, i alhora el que més cost i risc porta.

| | |
|---|---|
| Tecnologia | **LiveKit**: WebRTC gestionat, sales efímeres |
| Abast | **Només sales privades i clubs.** Mai en partides públiques classificades: és una via directa de confabulació |
| Requisits | Consentiment explícit · silenciar i expulsar · indicador de qui parla · **cap gravació** |
| Cost | Per minut i participant. **Només per a comptes de pagament** |

### 8.5 Assoliments i reptes

**Assoliments** amb sentit botifarrer, no genèrics: guanyar una mà amb botifarra contrada · fer les 12 bases · guanyar amb 10 companys diferents · 30 dies seguits jugant · superar una categoria de BR · **no cometre cap error greu en una partida sencera** (aquest només és possible perquè hi ha motor).

**Reptes** directes a un jugador, setmanals del sistema, i de club.

---

## 9. Disseny i UX

### 9.1 Direcció

**Net, professional i sense infantilisme.** El referent no és un casino: és **una taula de fusta en un casal, ben il·luminada**. Res de verd llampant, res de brillantor, res d'animacions de monedes.

**La decisió que més afecta el producte:** la competència ha fet «cartes grans per a gent gran» perquè **aquest és el mercat real de la botifarra**. No és un nínxol d'accessibilitat, és el públic principal. Es dissenya per a un jugador de 65 anys amb un mòbil de 6 polzades — i resulta que això també és millor per a tothom.

### 9.2 Tokens

```css
:root{
  --feltre:   #2C4A3E;   /* verd fosc de tapet, apagat */
  --fusta:    #3A2E24;   /* vora de taula */
  --paper:    #F5F1E8;   /* cara de la carta */
  --tinta:    #1A1814;
  --tinta-2:  #5C5449;
  --oros:     #B8860B;
  --copes:    #A32E2E;
  --espases:  #2E4A6B;
  --bastos:   #4A6B2E;
  --accent:   #C2703D;   /* el teu torn, acció principal */
  --ok:       #3E7A56;
  --err:      #A33A28;
  --r-carta: 8px;  --r-ui: 4px;
}
```

Mode fosc **sí**: es juga de nit i al sofà.

### 9.3 Tipografia

| Rol | Família |
|---|---|
| Interfície | **Inter** |
| Xifres, marcador, BR | **IBM Plex Mono**, `tabular-nums` |
| Títols i marca | **Bitter** — serif de pantalla, càlida, gens infantil |

Mida base **17 px**; el marcador **mai per sota de 24 px**.

### 9.4 Les cartes

- **Baralla espanyola tradicional, dibuixada de nou i pròpia.** Prou clàssica perquè un jugador de tota la vida la reconegui a l'instant.
- **Índex gran a la cantonada**, llegible amb la carta mig tapada pel ventall.
- **Pals distingits per forma i per color, mai només per color:** entre el 8 i el 10% dels homes tenen dificultats amb el vermell i el verd, i aquest públic és majoritàriament masculí i gran.
- Mida mínima a la mà: **64 × 96 px** al mòbil.

### 9.5 Regles dures de mòbil

1. Es dissenya **a 390 px primer**.
2. **La mà ocupa el terç inferior** i es toca amb el polze sense recol·locar el mòbil.
3. **Àrea tàctil mínima 48 × 48 px.** Les cartes s'obren en ventall en tocar la mà.
4. **Les jugades il·legals no es poden tocar**: atenuades i sense resposta. Val més impedir l'error que explicar-lo.
5. **Arrossegar i deixar anar, o tocar dues vegades.** Mai un diàleg de confirmació per carta.
6. **Rotació bloquejada en vertical** al mòbil.
7. **Jugable amb 3G i en un mòbil de fa cinc anys.**

### 9.6 Moments que decideixen la sensació

| Moment | Requisit |
|---|---|
| **És el teu torn** | Inequívoc sense mirar: vora il·luminada, vibració curta opcional |
| **Cantar** | Pantalla dedicada, 4 pals grans, botifarra i delegar ben separats. **No s'ha de poder cantar per error** |
| **Contro** | Finestra de temps visible i generosa |
| **Recollir la basa** | Animació de 400 ms cap al guanyador |
| **Final de mà** | Desglossament clar: cartes, bases, multiplicador, total. **La gent vol comptar-ho** |
| **Error detectat** | Discret. Una etiqueta, mai una interrupció |

### 9.7 Accessibilitat

Contrast AA mínim · text fins al 200% sense trencar la taula · lectors de pantalla amb cartes i estat anunciats · **mode d'alt contrast** amb cartes de vora gruixuda.

---

## 10. Botifarra Rating

### 10.1 El problema que resol

**En botifarra depens del company.** Un ELO clàssic castiga qui juga bé amb un company fluix i premia el contrari. És el defecte de tots els rànquings de jocs per parelles.

### 10.2 La solució, que només tu pots construir

El BR combina **dos components**:

```
BR = component_de_resultat  (70%)  +  component_de_qualitat  (30%)
```

| Component | Què mesura | Com |
|---|---|---|
| **Resultat** | Guanyar, contra qui | **Glicko-2**, no Elo: modela la incertesa, i la botifarra té atzar alt al repartiment. Ponderat per la força dels rivals |
| **Qualitat** | **Com de bones van ser les teves decisions**, independentment de si vas guanyar | Mitjana de la pèrdua per jugada respecte de l'òptim, segons el motor d'anàlisi |

> **Això és el fossat.** Mesurar la qualitat d'una decisió exigeix un motor capaç d'avaluar alternatives. **Cap competidor pot copiar aquest rànquing sense construir primer el motor**, i el motor és sis mesos de feina. Un jugador que perd amb un company fluix però juga impecablement **puja de BR igualment**, i això es nota i es comenta.

### 10.3 Categories

**Novell · Aprenent · Aficionat · Avançat · Expert · Mestre**

S'ensenya la categoria i el número (`BR 1.245`). La categoria és el que la gent diu en veu alta; el número és per a qui el vol.

### 10.4 Regles

- Les mans contra bots **no puntuen**.
- Les partides amb amics **no puntuen** (evita l'acord entre coneguts).
- Cal un mínim de **20 mans** per tenir BR visible.
- Inactivitat: la incertesa de Glicko creix, el número no baixa.
- Temporades de 3 mesos amb **reinici parcial** cap a la mitjana.

---

## 11. Monetització

**Decisió del promotor: subscripció com a producte principal**, amb producte de club com a segona via.

| Nivell | Preu | Inclou |
|---|---|---|
| **Gratuït** | 0 € | Jugar contra IA sense límit · partides amb amics · algunes partides públiques al dia · perfil · BR bàsic · **1 anàlisi de mà al dia** |
| **Premium** | **3,99 €/mes** o **29,90 €/any** | IA avançada (Comarcal i Campió) · **anàlisi il·limitada** · estadístiques avançades · historial complet · repeticions · entrenament · tornejos · personalització · **sense anuncis** |
| **Club / Penya** | **49–99 €/any** | Fins a 30–100 membres · tornejos privats · classificacions · gestió de jugadors · calendari · campionats · **retransmissions** · panell |

**Publicitat:** només al nivell gratuït, **mai durant una mà**, mai vídeo obligatori. Una franja discreta entre partides.

**Cobrament:** subscripció i venda global → **Freemius**, que accepta venedors andorrans i resol l'IVA europeu com a revenedor. Per al producte de club, facturació local des de la societat andorrana.

> **Advertència honesta, i és important:** el competidor directe (Piqture) ven **una compra única que treu la publicitat per sempre, sense seguiment**, i el seu públic —gent gran— aprecia exactament això. Una subscripció mensual toparà amb aquesta comparació el primer dia.
>
> **Mitigació recomanada:** oferir també una **compra única de 49,90 € per accés permanent**, al costat de la subscripció. Qui vulgui pagar una vegada, paga una vegada; qui prefereixi 3,99 €/mes, els paga. El cost marginal d'oferir les dues coses és gairebé nul i tanca l'objecció més previsible.

---

## 12. Model de dades

```sql
users (
  id uuid pk, email citext unique, email_verified_at timestamptz,
  alias text unique not null, avatar jsonb, comarca text,
  locale text not null default 'ca',
  tier text not null default 'free',          -- free | premium | lifetime
  br real not null default 1500, br_rd real not null default 350,
  quality_avg real, hands_played int not null default 0,
  created_at, updated_at, deleted_at
)

clubs (id uuid pk, name text, slug text unique, owner_user_id uuid,
       seats int not null, until date, settings jsonb)
club_members (club_id uuid, user_id uuid, role text,
              primary key (club_id, user_id))

tables (
  id uuid pk, kind text not null,             -- public | private | training | tournament
  rules jsonb not null,                       -- variants de la §1.8
  seats jsonb not null,                       -- 4 llocs: user_id o bot amb nivell i estil
  allow_spectators bool not null default true,
  status text not null, created_at
)

games (
  id uuid pk, table_id uuid fk, tournament_id uuid,
  seed bigint not null,                       -- reproductibilitat total
  score_ns int not null default 0, score_ew int not null default 0,
  target int not null default 101,
  winner text, started_at, ended_at
)

hands (
  id uuid pk, game_id uuid fk, hand_no int not null,
  dealer_seat int not null, deal jsonb not null,
  bid jsonb not null, multiplier int not null default 1,
  moves jsonb not null,                       -- 48 jugades en ordre
  seat_kinds jsonb not null,                  -- humà o bot per lloc, per al BR
  points_ns int, points_ew int, scored int,
  analysed_at timestamptz,
  unique (game_id, hand_no)
)

reviews (
  id uuid pk, hand_id uuid fk, seat int not null, trick_no int not null,
  played text not null, best text not null,
  win_prob_played real, win_prob_best real, delta real not null,
  explanation_ca text, severity text,         -- minor | notable | greu
  created_at
)

player_patterns (user_id uuid, pattern text, occurrences int,
                 last_seen timestamptz, primary key (user_id, pattern))

achievements (user_id uuid, code text, earned_at timestamptz,
              primary key (user_id, code))

tournaments (id uuid pk, club_id uuid, name text, format text,
             rules jsonb, starts_at, ends_at, status text)

reports (id uuid pk, reporter_id uuid, target_id uuid, game_id uuid,
         reason text, status text, created_at)
```

**`hands.seed` + `hands.moves` és tot el que cal per reconstruir qualsevol partida.** Aquesta decisió sosté l'anàlisi, la repetició, l'espectador, la retransmissió, el BR i la investigació de trampes. **És la peça d'arquitectura més rendible del document.**

---

## 13. Servidor, temps real i antitrampes

### 13.1 Principis

1. **El servidor és l'àrbitre.** El client proposa; el servidor valida amb el mateix nucli i difon. Una jugada il·legal no és possible ni amb un client modificat.
2. **Cada jugador rep només el que pot saber.** L'estat es filtra per conjunt d'informació. **Mai s'envien les cartes dels altres al client**, ni xifrades.
3. **Tota partida és reproduïble.**

### 13.2 Protocol

WebSocket amb missatges tipats generats des d'un sol esquema compartit entre Rust i TypeScript.

```
→ Join { table_id }        ← State { your_hand, trick, score, legal_moves }
→ Bid { Suit | Botifarra | Delegate }
→ Double { Contro | Recontro | SantVicenc | Barraca }
→ Play { card }            ← TrickWon { by, points }
→ Leave                    ← HandEnded { breakdown, review_available }
                           ← SeatChanged { seat, from, to }
```

**`legal_moves` l'envia sempre el servidor.** El client no calcula la legalitat per decidir, sinó per pintar.

### 13.3 Reconnexió

L'estat viu a la base de dades, no a la memòria del procés. Una reconnexió en **menys de 120 segons** recupera el lloc exacte. Passat aquest temps, un bot ocupa el lloc i es pot recuperar. **Un reinici del servidor no ha de perdre cap partida.**

### 13.4 Antitrampes

El problema real d'un joc per parelles és **la confabulació**: dos jugadors parlant per fora.

| Mesura | |
|---|---|
| Estat filtrat per jugador | Impossible veure cartes alienes des del client |
| **Detecció per motor** | Jugades «impossiblement bones» respecte del que el jugador podia saber. **Això només ho pot fer qui té motor d'anàlisi** |
| Xat limitat en partida | Només frases predefinides |
| Espectador amb retard | 30 segons obligatoris |
| Veu | Mai en partides públiques classificades |
| Emparellament | Evitar repetició sistemàtica de parelles en sales classificades |
| Partides amb amics | No puntuen al BR |
| Denúncia | Amb reproducció completa per a la investigació |

---

## 14. Onboarding i tutorial

> **El buit més gran que tenia aquest document.** La botifarra té una regla que sorprèn tothom que ve d'altres jocs de baralla espanyola: **el 9 mana per sobre de l'as**. I les obligacions de servir, matar i fallar són estrictes. Un jugador nou que no ho sap **fa tres jugades il·legals seguides i se'n va**.

### 14.1 Tres portes d'entrada

| Perfil | Què necessita |
|---|---|
| **Ja sap jugar** | Res. Botó «Sé jugar» i a taula. **No se'l pot obligar a fer cap tutorial** |
| **Ha jugat alguna vegada** | Un recordatori de 60 segons: jerarquia amb la manilla, valors, multiplicadors |
| **No hi ha jugat mai** | Tutorial guiat de 5 mans preparades |

### 14.2 El tutorial

Cinc mans **preparades**, no aleatòries, cadascuna amb un objectiu:

1. **La manilla mana.** Una mà on l'as perd contra el 9 i es veu.
2. **Servir el pal.** Les cartes il·legals estan atenuades i s'explica per què.
3. **Matar i fallar.** Quan hi estàs obligat i quan no, perquè el company va guanyant.
4. **Comptar.** Es fa el recompte a la vista, carta a carta, fins als 72.
5. **Cantar i contrar.** Què canta cadascú amb aquesta mà i per què.

**El tutorial fa servir el motor d'anàlisi**, no textos fixos: quan el jugador s'equivoca, l'explicació surt del mateix lloc que la de les partides reals. **Cost de construcció gairebé nul, i coherència total.**

### 14.3 Ajuda permanent

- **Les jugades il·legals no es poden tocar** (§9.5) i, si s'intenten, apareix el motiu en una línia: «has de servir espases».
- **Taula de valors sempre accessible** amb un toc, sense sortir de la partida.
- **Mode principiant**: es marca visualment quina és la carta més alta sobre la taula. Desactivat per defecte i **desactivat sempre en partides classificades**.

---

## 15. So

**Mitja sensació d'un joc de cartes és el so**, i no hi era en aquest document.

| So | Quan |
|---|---|
| Repartir | Inici de mà, seqüència curta |
| Deixar carta | Cada jugada, amb variació lleu per no cansar |
| Recollir basa | Arrossegament cap al guanyador |
| El teu torn | Discret, i **només si l'aplicació no és en primer pla o fa estona que no jugues** |
| Cantar | Un to per pal, un altre per botifarra |
| Contro | Marcat, és el moment de tensió |
| Final de mà | Segons qui guanya |

**Regles:** tot en **menys de 300 ms** · silenci per defecte al mòbil **la primera vegada** · commutador sempre visible · **cap música de fons** (aquest públic la desactiva i molesta al casal) · so i vibració independents.

---

## 16. Legal

### 16.1 Joc d'atzar — la comprovació que cal fer abans de llançar

**La botifarra amb rànquing, lligues i tornejos no és joc d'atzar si no hi ha premi econòmic ni aposta.** El document ho fixa com a requisit dur:

- **Cap premi en diners ni convertible en diners**, en cap mode, ni en tornejos de club.
- **Cap aposta entre jugadors**, ni funcionalitat que la faciliti.
- **Cap moneda virtual comprable** que es pugui guanyar jugant.
- La subscripció paga **funcions**, mai avantatge competitiu ni accés a premis.

> ⚠️ Si algun dia es vol fer un torneig amb premi —encara que sigui una panera d'un patrocinador— **cal consultar-ho abans amb un advocat**, perquè creua la línia cap a normativa de joc a Espanya i a Andorra. **És el canvi de producte més perillós que es pot fer sense adonar-se'n.**

### 16.2 La baralla

**Els dissenys tradicionals de la baralla espanyola són de domini públic, però les edicions modernes concretes de cada fabricant estan protegides.** No es pot escanejar ni redibuixar de prop cap baralla comercial.

**Requisit: il·lustració original encarregada**, amb cessió de drets per escrit per a ús comercial, digital i imprès. És a les decisions obertes i cal pressupostar-ho.

### 16.3 Dades

Societat andorrana venent a la UE: **LQPD andorrana i RGPD europeu**. Condicions i política de privacitat acceptades explícitament · esborrat de compte real amb finestra de gràcia · exportació de dades · mínim necessari (àlies i correu; **cap dada que no calgui**) · les partides es conserven per a l'historial i el BR, i es purguen amb el compte.

**Menors:** no es demana l'edat i no es fa perfilat. Si s'afegeix xat de veu, **cal repensar-ho** perquè canvia el risc.

### 16.4 Botigues

Google Play: classificació per edat, declaració de dades, política de privacitat, i **declarar que no hi ha joc d'atzar**. La subscripció dins de l'app obliga a facturació de Google amb la seva comissió; **per això la subscripció es ven al web** (§11) i l'app només la reconeix.

---

## 17. Infraestructura i desplegament

### 17.1 Ordre de plataformes

**1r Web i PWA · 2n Android · 3r Windows.** Decisió del promotor i és la correcta:

| Ordre | Per què |
|---|---|
| **1. Web + PWA** | Zero fricció per provar, cap botiga que aprovi res, desplegament en segons. **És on es valida si el producte funciona** |
| **2. Android** | On és el públic. **Kotlin natiu** (§3.5): més feina, menys risc de futur |
| **3. Windows** | **Gairebé gratis amb Tauri**: reaprofita el frontend web i l'escriptori és el camí madur del framework. Públic que juga a casa amb pantalla gran |

### 17.2 Servidor de proves: el Hetzner que ja tens

Per a les fases F0 a F4 **no cal contractar res**. El teu Hetzner (Ryzen 5 3600, 62 GB de RAM) fa de sobres per a:

| Ús | Consum |
|---|---|
| Servidor de joc | Mínim. Una partida són 4 connexions i uns quants missatges per minut |
| PostgreSQL | Mínim en aquesta fase |
| **Model d'explicacions** | ~5 GB de RAM (§5.6), en lot i fora d'hores |
| Compilació i proves | El torneig intern de la §4.8 aprofita els 12 fils |

> ⚠️ **Dues condicions abans de posar-hi res** (heretades de l'auditoria del 22 de setembre):
> 1. **Comprovar l'espai lliure.** Aquest servidor ja allotja webs de clients en producció.
> 2. **Aïllar-ho en contenidors amb límits de memòria i CPU.** El torneig intern de la IA pot consumir els 12 fils durant hores; **no pot afectar les webs que ja hi corren**.

**Quan calgui sortir-ne:** el dia que hi hagi multijugador públic obert, el joc passa a una màquina pròpia. El senyal és l'ús sostingut de CPU o qualsevol degradació de les webs existents, **no una data**.

### 17.3 Desplegament

| Peça | Elecció |
|---|---|
| Contenidors | Docker Compose: `game` (Axum), `db`, `explain` (llama.cpp), `caddy` |
| Proxy i TLS | Caddy amb certificats automàtics |
| Base de dades | PostgreSQL 16 · **còpia diària fora del servidor** i prova de restauració mensual |
| Estàtics i PWA | Servits per Caddy; més endavant CDN |
| CI | GitHub Actions: `fmt`, `clippy -D warnings`, `test`, `wasm-pack build`, `tsc --noEmit`, i **el torneig de la IA com a prova de no-regressió** |
| Traces | `tracing` en JSON |
| Errors | Sentry al servidor i al client |
| Vigilància | Disponibilitat externa · alerta si una partida queda encallada · alerta si la cua d'explicacions creix |

**Variables d'entorn** (cap valor al repositori):

```
DATABASE_URL, APP_BASE_URL, SESSION_COOKIE_DOMAIN
EXPLAIN_PROVIDER, EXPLAIN_ENDPOINT, EXPLAIN_MODEL
SMTP_URL, MAIL_FROM
FREEMIUS_PUBLIC_KEY, FREEMIUS_SECRET_KEY
LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_SECRET      # fase tardana
SENTRY_DSN, ADMIN_ALERT_EMAIL
```

### 17.4 Pressupost de rendiment

| Peça | Límit |
|---|---|
| **Nucli en WASM** | **< 400 KB** comprimit. És el que decideix si la PWA arrenca de pressa amb 3G |
| Paquet inicial de la web | < 250 KB comprimit sense el WASM |
| LCP amb 4G | < 2,5 s |
| Memòria a l'Android | < 250 MB en partida |
| Binari d'Android | < 30 MB · **60 fps sostinguts en gamma baixa** |

> Si el nucli en WASM se'n va de mida, **es compila una versió reduïda per al client** (regles i validació) i la IA forta es queda al servidor. **Cal mesurar-ho a la F2, no al final.**

---

## 18. Idiomes

**Català primer**, i no com a traducció: és la llengua en què es va escriure el producte. Després castellà, francès (Catalunya Nord) i anglès.

- **Cap cadena a codi** des del primer dia. Tot a fitxers de missatges.
- **La terminologia del joc no es tradueix**: *manilla*, *botifarra*, *contro*, *recontro*, *Sant Vicenç*, *arrossegar*, *fallar*. Són els noms del joc i un jugador castellanoparlant de Lleida també els diu així. **Traduir-los seria un error de producte, no d'idioma.**
- **Les explicacions de la IA es generen en la llengua de l'usuari**, no es tradueixen després. El model ho fa directament (§5.6).
- Formats de data i nombre localitzats; el marcador sempre amb xifres tabulars.

---

## 19. Mètriques i moderació

### 19.1 Les set xifres que importen

| Mètrica | Per què |
|---|---|
| **Temps fins a la primera partida** | Si passa d'un minut, hi ha fricció a matar |
| **Partides per usuari i setmana** | El senyal d'hàbit, el més important de tots |
| **Retenció al dia 7 i al 30** | |
| **% de partides acabades** | Un abandonament alt vol dir que el relleu d'IA no funciona |
| **% d'usuaris que obren la revisió** | **Aquesta és la mètrica del producte.** Si ningú obre l'anàlisi, el diferenciador no existeix |
| **Errors per partida, per jugador** | Ha de baixar amb el temps. **És la prova que el producte ensenya** |
| **Conversió a pagament** | Segmentada per qui fa servir l'anàlisi i qui no |

**Analítica pròpia i sense seguidors de tercers.** El públic de Piqture valora explícitament que no hi hagi seguiment, i aquí hi ha una oportunitat de coherència.

### 19.2 Moderació

Cua de denúncies amb **reproducció completa de la partida** · sancions graduals (silenci, suspensió, bloqueig) · registre d'auditoria de tota acció administrativa · revisió de les alertes de confabulació (§13.4).

---

## 20. Fases

| Fase | Setmanes | Contingut | Criteri de sortida |
|---|---|---|---|
| **F0 — Nucli** | 1–3 | Regles, repartiment, bases, comptatge, variants. **Sense interfície** | Les proves cobreixen **totes** les obligacions de la §1.7 i **tots** els multiplicadors |
| **F1 — IA** | 3–7 | ISMCTS, deducció, senyals, estils, nivells, política de cantar | Campió guanya **>65%** contra un comptador de cartes |
| **F2 — Web i PWA local** | 7–10 | Interfície, animacions, joc contra la màquina amb WASM, instal·lable i sense connexió | Una partida sencera contra bots, offline, al mòbil |
| **F3 — Multijugador** | 10–14 | Servidor, sales, reconnexió, **relleu d'IA (§6.2)** | 4 persones juguen a 101 amb una caiguda de xarxa provocada, i el relleu funciona |
| **F4 — L'anàlisi** | 14–18 | Motor d'anàlisi, explicacions, repeticions, «per què l'IA», «El meu joc» | **10 jugadors de casal diuen que l'explicació és correcta i útil** |
| **F5 — Competició** | 18–21 | BR amb component de qualitat, categories, lligues, tornejos, assoliments, reptes | Una lliga completa d'un club, acabada |
| **F6 — Android** | 21–27 | **Kotlin + Compose**, nucli via UniFFI, proves en dispositius reals, publicació | A Google Play, **60 fps en un mòbil de gamma baixa** |
| **F6b — Windows** | 27–28 | Tauri 2 amb el frontend web | Instal·lable. **1 setmana**: reaprofita tot |
| **F7 — Social avançat** | 24+ | Espectador, retransmissió, clans, **veu**, iOS | — |

> **F4 no es pot avançar ni retallar.** És l'única part que la competència no té i l'única raó per la qual algú canviaria d'aplicació. **Si el pressupost s'escurça, es retalla F7, mai F4.**
>
> I **F3 conté el relleu d'IA**, que no és una floritura: sense ell el producte no és usable fora de les hores punta.

---

## 21. Criteris d'acceptació

**Joc**
- [ ] Cap jugada il·legal és possible des de cap client, ni modificat.
- [ ] Les 4 variants de la §1.8 es combinen i el motor les obeeix.
- [ ] El recompte quadra amb **72 punts** a cada mà, sempre.
- [ ] Una partida es reconstrueix sencera des de `seed` i `moves`.

**IA**
- [ ] Campió guanya **>65%** contra un comptador de cartes, amb repartiments jugats des de les dues bandes.
- [ ] La jugada de nivell Casal surt en **menys de 800 ms** en un mòbil de gamma mitjana.
- [ ] Aprenent comet **errors versemblants**, no aleatoris.
- [ ] Quatre bots del mateix nivell amb estils diferents **no juguen igual**.

**Ensenyar**
- [ ] Cap explicació sense diferència numèrica que la justifiqui.
- [ ] **Deu jugadors experimentats validen 50 explicacions** i n'accepten més del 90%.
- [ ] Zero consells durant la partida.
- [ ] «Per què l'IA ha jugat això» funciona per a qualsevol jugada de qualsevol bot.

**Producte**
- [ ] **La partida comença sempre**, a qualsevol hora, amb relleu d'IA.
- [ ] El relleu només passa entre mans i s'avisa els afectats.
- [ ] Reconnexió en menys de 120 s recupera el lloc exacte.
- [ ] L'espectador en directe té 30 s de retard i no veu cap mà.

**Tècnics**
- [ ] El mateix nucli corre al servidor, al navegador, a Android (UniFFI) i a Windows.
- [ ] L'app d'Android manté **60 fps** durant les animacions en un mòbil de gamma baixa.
- [ ] La PWA és instal·lable i juga contra la màquina sense connexió.
- [ ] Un reinici del servidor no perd cap partida.
- [ ] Jugable amb 3G i en un mòbil de fa cinc anys.
- [ ] `cargo clippy -- -D warnings` i `tsc --noEmit` nets.

---

## 22. Decisions obertes

| # | Decisió | Bloqueja |
|---|---|---|
| 1 | **Nom i domini.** Comprovar `manilla.cat` / `.app` i cerca de marca | La identitat visual |
| 2 | ~~Reglament de referència~~ → **decidit: el del Campionat de Catalunya de Botifarra**, el mateix «reglament oficial» que diu seguir la competència directa. Transcripció en línia de referència: el reglament publicat a butinet.cat | — |
| 3 | ~~Android: Tauri o Kotlin~~ → **decidit: Kotlin natiu amb UniFFI** (§3.5) | — |
| 4 | **Il·lustració de la baralla.** Encàrrec propi, cal pressupostar-lo | El disseny |
| 5 | **Compra única al costat de la subscripció** (§11) | El llançament comercial |
| 6 | **Un club o casal disposat a fer de pilot.** És la validació comercial real i no és codi | La F5 |
| 7 | **Cost de la veu** amb LiveKit a volum real | La F7 |

---

## 23. Com fer servir aquest document

Aquest fitxer és el contracte del projecte. Qualsevol decisió que el contradigui s'escriu aquí abans d'implementar-se.

Les quatre seccions on un error costa car:

- **§1.7** — les obligacions en jugar. Un error aquí fa que el joc sigui una altra cosa, i els jugadors ho detecten a la primera partida.
- **§5.1** — cap explicació sense números al darrere. És la credibilitat del producte sencer.
- **§6.2** — el relleu d'IA. Sense això, el producte només funciona a les hores punta.
- **§13.1** — el servidor com a àrbitre. És el que fa impossible fer trampes.

---

*Manilla · Brief tècnic v1.3 · 25 de setembre del 2026*
