#!/bin/bash
#
# Arrenca Manilla sencer i l'obre al navegador.
#
# Fes-hi doble clic al Finder: no cal escriure res al terminal. S'encarrega
# d'engegar Docker si cal, de construir el que faci falta i d'obrir la pàgina
# quan el servidor respon de debò, no abans.

set -uo pipefail
cd "$(dirname "$0")" || exit 1

V=$'\e[32m'; G=$'\e[33m'; R=$'\e[31m'; N=$'\e[0m'; B=$'\e[1m'
ok()   { echo "${V}✓${N} $1"; }
info() { echo "${G}·${N} $1"; }
fatal(){ echo; echo "${R}✗ $1${N}"; echo; echo "Prem una tecla per tancar."; read -rn1; exit 1; }

echo
echo "${B}  Manilla${N} · botifarra en línia"
echo "  ─────────────────────────────────"
echo

# ── 1. Docker ─────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  fatal "No hi ha Docker en aquest ordinador. Instal·la Docker Desktop i torna-ho a provar."
fi

if ! docker info >/dev/null 2>&1; then
  info "Docker està aturat: l'engego…"
  open -a Docker 2>/dev/null || fatal "No he pogut engegar Docker Desktop."
  for i in $(seq 1 90); do
    docker info >/dev/null 2>&1 && break
    printf "\r  esperant Docker… %ds" "$i"
    sleep 1
  done
  printf "\r\033[K"
  docker info >/dev/null 2>&1 || fatal "Docker no ha arrencat en 90 segons. Obre'l a mà i torna-hi."
fi
ok "Docker a punt"

# ── 2. La pila ────────────────────────────────────────────────────────────
info "Construint i arrencant (el primer cop triga uns minuts)…"
if ! docker compose up -d --build; then
  fatal "Ha fallat la construcció. El detall és aquí sobre."
fi
ok "Contenidors en marxa"

# ── 3. Esperar que respongui de veritat ──────────────────────────────────
info "Esperant el servidor…"
LLEST=0
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null http://localhost:8080/api/config 2>/dev/null; then LLEST=1; break; fi
  printf "\r  comprovant… %ds" "$i"
  sleep 1
done
printf "\r\033[K"

if [ "$LLEST" -ne 1 ]; then
  echo "${R}El servidor no respon.${N} Registre dels últims errors:"
  echo
  docker compose logs --tail 30 servidor
  fatal "Mira el registre de sobre."
fi
ok "Servidor a punt"

# ── 4. Obrir ──────────────────────────────────────────────────────────────
open "http://localhost:8080"
echo
ok "Manilla és obert a ${B}http://localhost:8080${N}"
echo
echo "  Per aturar-ho:  ${B}docker compose down${N}   (o el botó de Docker Desktop)"
echo "  Per veure el registre:  ${B}docker compose logs -f servidor${N}"
echo
echo "Aquesta finestra es pot tancar."
