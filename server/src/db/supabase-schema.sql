create or replace function public.synapse_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id text primary key,
  auth_provider text not null,
  auth_subject text not null,
  email text,
  display_name text,
  auth_mode text,
  role text not null default 'student',
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  subscription_status text not null default 'inactive',
  current_period_end timestamptz,
  metadata_json jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists users_auth_provider_subject_idx
  on public.users (auth_provider, auth_subject);

create index if not exists users_email_idx
  on public.users (email);

create index if not exists users_stripe_customer_idx
  on public.users (stripe_customer_id);

create index if not exists users_stripe_subscription_idx
  on public.users (stripe_subscription_id);

create index if not exists users_plan_status_idx
  on public.users (plan, subscription_status);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.synapse_set_updated_at();

create table if not exists public.generated_contents (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  source_fingerprint text not null,
  client_fingerprint text,
  title text,
  summary text not null,
  language text,
  detail_level text,
  prompt_mode text,
  source_count integer not null default 0,
  cached boolean not null default false,
  sections_json jsonb,
  connections_json jsonb,
  mind_map_json jsonb,
  visual_gallery_json jsonb,
  sources_json jsonb,
  full_result_json jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists generated_contents_user_fingerprint_idx
  on public.generated_contents (user_id, source_fingerprint);

create index if not exists generated_contents_user_updated_idx
  on public.generated_contents (user_id, updated_at desc);

create index if not exists generated_contents_fingerprint_idx
  on public.generated_contents (source_fingerprint);

drop trigger if exists generated_contents_set_updated_at on public.generated_contents;
create trigger generated_contents_set_updated_at
before update on public.generated_contents
for each row
execute function public.synapse_set_updated_at();
