-- Esquema inicial de Manilla.
-- Noms en català, com la resta del projecte.

create extension if not exists pgcrypto;

create table if not exists usuaris (
  id           uuid primary key default gen_random_uuid(),
  correu       text        not null,
  nom          text        not null,
  -- Nul per als comptes que entren amb Google: no en tenen, de contrasenya.
  contrasenya  text,
  -- La fitxa del jugador.
  lema         text        not null default '',
  color        text        not null default 'ok',
  avatar_url   text,
  creat        timestamptz not null default now(),
  vist         timestamptz not null default now()
);

-- El correu no distingeix majúscules: es desa tal com s'escriu i es compara en minúscules.
create unique index if not exists usuaris_correu_baix on usuaris (lower(correu));

-- Identitats federades. Un mateix compte pot tenir contrasenya i Google alhora:
-- si el correu de Google ja existeix, s'hi enllaça en comptes de duplicar-lo.
create table if not exists identitats (
  proveidor text not null,             -- 'google'
  subjecte  text not null,             -- el «sub» del token de Google
  usuari    uuid not null references usuaris(id) on delete cascade,
  creada    timestamptz not null default now(),
  primary key (proveidor, subjecte)
);
create index if not exists identitats_usuari on identitats (usuari);

create table if not exists sessions (
  token   text        primary key,     -- hash del testimoni, mai el testimoni
  usuari  uuid        not null references usuaris(id) on delete cascade,
  creada  timestamptz not null default now(),
  caduca  timestamptz not null
);
create index if not exists sessions_usuari on sessions (usuari);

create table if not exists ajustos (
  usuari uuid  primary key references usuaris(id) on delete cascade,
  dades  jsonb not null
);

create table if not exists partides (
  id             uuid        primary key default gen_random_uuid(),
  usuari         uuid        not null references usuaris(id) on delete cascade,
  data           timestamptz not null default now(),
  nos            int         not null,
  ells           int         not null,
  mans           int         not null,
  guanyada       boolean     not null,
  nivell         smallint    not null,
  objectiu       int         not null,
  mans_guanyades int         not null default 0,
  millor_ma      int         not null default 0
);
create index if not exists partides_usuari_data on partides (usuari, data desc);
