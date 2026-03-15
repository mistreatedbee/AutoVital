-- Ensure RLS policies exist for account bootstrap (signup / ensureAccountForUser).
-- Run if you see: "new row violates row-level security policy for table 'accounts'"
-- Usage: insforge db query "$(Get-Content db/migrations/2026-03-15-ensure-accounts-bootstrap-rls.sql -Raw)"

-- 1. SECURITY DEFINER helpers (avoid recursion between accounts and account_members)
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

-- 2. Enable RLS on bootstrap tables (idempotent)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- 3. Accounts: allow authenticated user to INSERT their own account (owner_user_id = self)
DROP POLICY IF EXISTS "users_insert_own_account" ON accounts;
CREATE POLICY "users_insert_own_account" ON accounts
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- 4. Accounts: SELECT own accounts or where member
DROP POLICY IF EXISTS "users_select_own_accounts" ON accounts;
CREATE POLICY "users_select_own_accounts" ON accounts
  FOR SELECT TO authenticated
  USING (user_owns_account(id) OR user_is_account_member(id));

-- 5. Accounts: owner can UPDATE
DROP POLICY IF EXISTS "owner_update_account" ON accounts;
CREATE POLICY "owner_update_account" ON accounts
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid());

-- 6. Profiles: INSERT/SELECT/UPDATE own profile
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 7. Account members: allow owner to add self to the account they just created
DROP POLICY IF EXISTS "owners_add_self_to_account" ON account_members;
CREATE POLICY "owners_add_self_to_account" ON account_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND user_owns_account(account_id));

DROP POLICY IF EXISTS "users_select_own_memberships" ON account_members;
CREATE POLICY "users_select_own_memberships" ON account_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_owns_account(account_id));
