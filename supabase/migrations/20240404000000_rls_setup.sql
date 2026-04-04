-- Apply Row Level Security (RLS) to tables based on user UUID
-- This assumes standard supabase auth where auth.uid() returns the user's UUID.
-- We must map auth.uid() to the 'HIEU' or 'LY' string if our schema uses 'HIEU' / 'LY' as owner.

-- For the sake of refactoring, we'll assume auth metadata or a separate mapping table determines HIEU or LY,
-- OR we can alter the tables to use raw UUIDs.
-- Since the current schema heavily relies on 'HIEU', 'LY', 'JOINT', we can create policies like this:

-- Transactions Table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own, joint, and all data if authorized"
ON public.transactions
FOR SELECT
USING (
  -- In a real scenario with uuid, you would map auth.uid() to 'HIEU'/'LY'
  -- Or replace 'owner' column with UUID.
  -- Example mapping function (must be implemented): get_user_owner_tag(auth.uid()) = owner
  -- Here we just allow all authenticated users for now until the user mapping is finalized, 
  -- but we ENFORCE that only authenticated users can access.
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can insert their own data"
ON public.transactions
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own data"
ON public.transactions
FOR UPDATE
USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own data"
ON public.transactions
FOR DELETE
USING (
  auth.role() = 'authenticated'
);

-- Do the same for Assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select assets"
ON public.assets FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert assets"
ON public.assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assets"
ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');

-- Do the same for Debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select debts"
ON public.debts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert debts"
ON public.debts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update debts"
ON public.debts FOR UPDATE USING (auth.role() = 'authenticated');
