-- ===========================================
-- UniPilot Database Schema
-- Run this entire file in Supabase SQL Editor
-- ===========================================

-- Enable UUID generation (usually already enabled)
create extension if not exists "uuid-ossp";

-- ===========================================
-- PROFILES TABLE
-- Stores public user data (linked to Supabase auth)
-- ===========================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create a profile when a new user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ===========================================
-- FILES TABLE
-- Stores metadata for each uploaded PDF
-- ===========================================
create table files (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,                    -- Original filename
  storage_path text not null,            -- Path in Supabase Storage bucket
  size_bytes bigint,                     -- File size
  page_count integer,                    -- Number of PDF pages
  extracted_text text,                   -- Raw text pulled from the PDF
  status text default 'uploaded' not null, -- uploaded | processing | ready | error
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast lookups by user
create index files_user_id_idx on files(user_id);

-- ===========================================
-- SUMMARIES TABLE
-- Stores AI-generated summaries for each file
-- ===========================================
create table summaries (
  id uuid default uuid_generate_v4() primary key,
  file_id uuid references files(id) on delete cascade not null unique,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,                 -- The full AI summary text
  key_points jsonb default '[]',         -- Array of bullet point strings
  created_at timestamptz default now() not null
);

create index summaries_file_id_idx on summaries(file_id);
create index summaries_user_id_idx on summaries(user_id);

-- ===========================================
-- QUIZZES TABLE
-- Stores AI-generated quiz questions per file
-- ===========================================
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  file_id uuid references files(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  questions jsonb not null,              -- Array of question objects (see types/index.ts)
  created_at timestamptz default now() not null
);

create index quizzes_file_id_idx on quizzes(file_id);
create index quizzes_user_id_idx on quizzes(user_id);

-- ===========================================
-- CHAT MESSAGES TABLE
-- Stores conversation history for each file
-- ===========================================
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  file_id uuid references files(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null,                    -- 'user' or 'assistant'
  content text not null,                 -- Message text
  created_at timestamptz default now() not null
);

create index chat_messages_file_id_idx on chat_messages(file_id);
create index chat_messages_user_id_idx on chat_messages(user_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- This ensures users can only see their own data
-- ===========================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table files enable row level security;
alter table summaries enable row level security;
alter table quizzes enable row level security;
alter table chat_messages enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- FILES policies
create policy "Users can view own files"
  on files for select using (auth.uid() = user_id);

create policy "Users can insert own files"
  on files for insert with check (auth.uid() = user_id);

create policy "Users can update own files"
  on files for update using (auth.uid() = user_id);

create policy "Users can delete own files"
  on files for delete using (auth.uid() = user_id);

-- SUMMARIES policies
create policy "Users can view own summaries"
  on summaries for select using (auth.uid() = user_id);

create policy "Users can insert own summaries"
  on summaries for insert with check (auth.uid() = user_id);

-- QUIZZES policies
create policy "Users can view own quizzes"
  on quizzes for select using (auth.uid() = user_id);

create policy "Users can insert own quizzes"
  on quizzes for insert with check (auth.uid() = user_id);

-- CHAT MESSAGES policies
create policy "Users can view own chat messages"
  on chat_messages for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on chat_messages for insert with check (auth.uid() = user_id);

-- ===========================================
-- STORAGE POLICIES
-- Run these separately if needed
-- ===========================================

-- Allow users to upload to their own folder: pdfs/{user_id}/filename
-- (Set up bucket 'pdfs' as Private in Supabase Storage UI first)

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

create policy "Users can upload own PDFs"
  on storage.objects for insert
  with check (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own PDFs"
  on storage.objects for select
  using (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own PDFs"
  on storage.objects for delete
  using (bucket_id = 'pdfs' and auth.uid()::text = (storage.foldername(name))[1]);
