-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Leads Table
create table leads (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null, -- Required field
  owner_id uuid references auth.users(id), -- Links to Supabase Auth
  stage text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Applications Table
create table applications (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  tenant_id uuid not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tasks Table
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  related_id uuid references applications(id) on delete cascade, -- Mapped from 'applications'
  tenant_id uuid not null,
  type text check (type in ('call', 'email', 'review')), -- Constraint 
  due_at timestamptz not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_due_date check (due_at >= created_at) -- Constraint 
);

-- Indexes 
create index idx_leads_owner on leads(owner_id);
create index idx_leads_stage on leads(stage);
create index idx_tasks_due on tasks(due_at);