-- ============================================================
-- SANEAS · Candidatos a asesor (formulario de /asesorias)
-- Pegar entero en Supabase → SQL Editor → Run. Idempotente.
--
-- Seguridad: la tabla SOLO se puede INSERTAR desde la web (clave
-- publicable). Nadie puede leer, cambiar ni borrar solicitudes desde
-- fuera: sin política de select/update/delete, RLS lo niega todo.
-- Las lees tú desde el panel de Supabase (Table Editor) o por email.
-- ============================================================

create table if not exists public.asesores_candidatos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (char_length(nombre) between 1 and 60),
  apellidos  text not null check (char_length(apellidos) between 1 and 80),
  email      text not null check (char_length(email) between 5 and 120 and position('@' in email) > 1),
  telefono   text check (telefono is null or char_length(telefono) <= 20),
  formacion  text check (formacion is null or char_length(formacion) <= 160),
  relacion   text check (relacion is null or char_length(relacion) <= 80),
  motivo     text not null check (char_length(motivo) between 1 and 1000),
  origen     text not null default 'web',
  atendido   boolean not null default false,   -- para marcar los ya contactados
  creado_en  timestamptz not null default now()
);

alter table public.asesores_candidatos enable row level security;

drop policy if exists candidatos_insert_publico on public.asesores_candidatos;
create policy candidatos_insert_publico on public.asesores_candidatos
  for insert to anon, authenticated with check (true);
-- (a propósito, NO hay política de select/insert admin aquí: lectura solo
--  desde el panel de Supabase o con service role)
