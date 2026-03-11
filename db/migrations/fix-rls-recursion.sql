-- Fix infinite recursion between accounts and account_members RLS policies.
-- Run this if you're seeing 500 errors on accounts, account_members, maintenance_logs, etc.
-- Usage: insforge db query "$(cat db/migrations/fix-rls-recursion.sql)"

-- 1. Create SECURITY DEFINER helper functions (breaks recursion)
CREATE OR REPLACE FUNCTION user_owns_account(p_account_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM accounts
    WHERE id = p_account_id AND owner_user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION user_is_account_member(p_account_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_members
    WHERE account_id = p_account_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Drop old policies (they cause recursion)
DROP POLICY IF EXISTS "users_select_own_accounts" ON accounts;
DROP POLICY IF EXISTS "owners_add_self_to_account" ON account_members;
DROP POLICY IF EXISTS "users_select_own_memberships" ON account_members;

-- 3. Recreate policies using helper functions
CREATE POLICY "users_select_own_accounts" ON accounts FOR SELECT TO authenticated USING (
  user_owns_account(id) OR user_is_account_member(id)
);

CREATE POLICY "owners_add_self_to_account" ON account_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND user_owns_account(account_id)
);

CREATE POLICY "users_select_own_memberships" ON account_members FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR user_owns_account(account_id)
);
