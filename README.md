# LearnLynk Technical Assessment
**Submitted by:** Manmohan Singh Matharoo

## Project Overview
This repository contains the solution for the LearnLynk Internship Technical Assessment. It implements a Leads & Tasks CRM backend using Supabase (PostgreSQL + Edge Functions) and a Next.js frontend dashboard.

## Folder Structure
* **/database**: Contains the SQL scripts for Schema (Phase 1) and RLS Policies (Phase 2).
* **/supabase/functions**: Contains the 'create-task' Edge Function (Phase 3).
* **/frontend**: A Next.js application with the Dashboard page (Phase 4).
* **integration_stripe.txt**: Explanation of Stripe integration flow (Phase 5).

## Setup Instructions

### 1. Database Setup
* Create a new Supabase project.
* Run the script `database/01_schema.sql` in the Supabase SQL Editor to create tables.
* Run the script `database/02_policies.sql` to enable Row Level Security (RLS).

### 2. Backend (Edge Function)
* From the root directory, deploy the function using the Supabase CLI:
  ```bash
  npx supabase functions deploy create-task