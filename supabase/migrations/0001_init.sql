-- RepLog Supabase schema + Row Level Security.
-- Apply in the Supabase SQL editor (or `supabase db push`).
-- Every table is owned by a user; RLS restricts all access to auth.uid().

-- Helper: timestamps + ownership columns are mirrored from the local SQLite model.
-- Booleans are real booleans; arrays use text[]; timestamps use timestamptz.

create table if not exists profiles (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  default_unit text not null check (default_unit in ('kg','lb')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists gym_profiles (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists exercises (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null = built-in seed
  name text not null,
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  is_custom boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists exercise_notes (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null,
  gym_profile_id uuid,
  machine_settings text, grip text, stance text,
  injury_caution text, substitutions text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists routines (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists routine_exercises (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null,
  exercise_id uuid not null,
  order_index int not null,
  target_sets int not null,
  target_reps_min int not null,
  target_reps_max int not null,
  target_rest_sec int not null,
  progression_rule text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists workouts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid,
  name text not null,
  status text not null check (status in ('active','completed')),
  started_at timestamptz not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists workout_exercises (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null,
  exercise_id uuid not null,
  order_index int not null,
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists sets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null,
  set_index int not null,
  set_type text not null check (set_type in ('warmup','normal','drop','failure')),
  weight_kg double precision not null,
  reps int not null,
  rpe double precision,
  completed boolean not null default false,
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists personal_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null,
  workout_id uuid not null,
  kind text not null check (kind in ('weight','e1rm','volume')),
  value double precision not null,
  reps int,
  weight_kg double precision,
  achieved_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists body_metrics (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg double precision not null,
  body_fat_pct double precision,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- Enable RLS and add owner-only policies for every user-owned table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','gym_profiles','exercise_notes','routines','routine_exercises',
    'workouts','workout_exercises','sets','personal_records','body_metrics'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format($f$
      create policy %I on %I
        for all to authenticated
        using (user_id = auth.uid())
        with check (user_id = auth.uid());
    $f$, t || '_owner', t);
  end loop;
end $$;

-- Exercises: users see built-in (user_id is null) + their own custom exercises.
alter table exercises enable row level security;
create policy exercises_read on exercises
  for select to authenticated
  using (user_id is null or user_id = auth.uid());
create policy exercises_write on exercises
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
