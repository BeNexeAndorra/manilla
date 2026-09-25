# Manilla

La plataforma definitiva de botifarra en línia. Web + PWA + Android.

**Estat:** fase de definició. Encara no hi ha codi.

## Documentació

- **[PROMPT.md](PROMPT.md)** — brief tècnic complet. Document mestre del projecte.

## El posicionament, en una frase

Tot el que existeix és un lloc per **jugar**. Cap és un lloc per **millorar**.

| Competidor | Té | No té |
|---|---|---|
| Butifarra (Piqture Games) | IA de 3 nivells, offline, compra única | Cap eina d'aprenentatge |
| botifarra.app | Multijugador, lligues, tornejos | Zero contingut educatiu |
| ButiCard · ButiNET · Ludoteka | Sales, rànquings, xat | Ídem |

## Les quatre decisions que ho sostenen

1. **ISMCTS, no comptatge de cartes.** La competència recorda; aquest motor dedueix.
2. **Cap explicació sense números al darrere.** La credibilitat es perd una sola vegada.
3. **La partida comença sempre**, amb relleu automàtic d'IA als seients buits.
4. **El rating mesura la qualitat de les decisions**, no només el resultat — perquè en botifarra depens del company.

## Stack

| Capa | Tecnologia |
|---|---|
| Nucli i IA | Rust 2024 → natiu · WASM · Android |
| Servidor | Rust · Axum · Tokio · WebSockets |
| Base de dades | PostgreSQL 16 · SQLx |
| Web i PWA | Vite · React 19 · TypeScript · Tailwind 4 · Motion |
| Android | Tauri 2 (alternativa: Kotlin + UniFFI) |
| Cobrament | Freemius (accepta venedors andorrans) |

## Abans d'escriure codi

1. Comprovar `manilla.cat` / `manilla.app` i fer cerca de marca.
2. Triar el reglament públic de referència per a les variants.
3. Trobar un club o casal disposat a fer de pilot.
