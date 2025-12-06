-- Enable RLS
alter table leads enable row level security;

-- SELECT Policy
create policy "Counselors view own or team leads" on leads
for select using (
  (auth.jwt() ->> 'role' = 'admin') OR -- Admin check
  (owner_id = auth.uid()) OR -- Own leads
  (
    exists (
      select 1 from user_teams ut
      join teams t on ut.team_id = t.team_id
      where ut.user_id = auth.uid()
      -- Logic implies checking if lead matches team criteria (simplified here)
    )
  )
);

-- INSERT Policy 
create policy "Counselors insert own leads" on leads
for insert with check (
  auth.uid() = owner_id
);

-- OPTIONAL: Mock tables to make sure policies run without error
create table if not exists teams (
  team_id uuid primary key default uuid_generate_v4(),
  name text
);

create table if not exists user_teams (
  user_id uuid references auth.users(id),
  team_id uuid references teams(team_id),
  primary key (user_id, team_id)
);

-- (Paste the rest of your Policy code below this)