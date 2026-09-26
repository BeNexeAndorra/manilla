# Manilla, en tres passos: el nucli a WASM, el front-end, i el servidor.
# La imatge final no porta cap cadena d'eines.

# ── 1. El nucli de regles, compilat a WebAssembly ─────────────────────────
FROM rust:1-bookworm AS wasm
WORKDIR /obra
RUN cargo install wasm-pack --locked
COPY Cargo.toml Cargo.lock ./
COPY core ./core
# El servidor encara no hi és; no cal per compilar el nucli.
RUN sed -i 's/, "server"//' Cargo.toml
RUN wasm-pack build core --target web --out-dir /obra/nucli \
      --out-name botifarra_core --release -- --features wasm

# ── 2. El front-end ───────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS web
WORKDIR /obra
COPY web/package.json web/package-lock.json* ./
RUN npm ci
COPY web ./
COPY --from=wasm /obra/nucli ./src/core
RUN npm run build

# ── 3. El servidor ────────────────────────────────────────────────────────
FROM rust:1-bookworm AS servidor
WORKDIR /obra
COPY Cargo.toml Cargo.lock ./
COPY core ./core
COPY server ./server
RUN cargo build --release -p manilla-server

# ── 4. El que s'executa ───────────────────────────────────────────────────
FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
# No corre com a root.
RUN useradd --system --create-home --uid 10001 manilla
WORKDIR /app
COPY --from=servidor /obra/target/release/manilla-server /usr/local/bin/manilla-server
COPY --from=web /obra/dist /app/public
USER manilla
ENV STATIC_DIR=/app/public PORT=8080
EXPOSE 8080
CMD ["manilla-server"]
