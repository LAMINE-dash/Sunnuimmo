/*
# Create subscriptions table for payment history

1. New Table
- `subscriptions`: tracks every subscription payment (plan, amount, payment method, status, dates).
  Columns:
  - id (uuid PK)
  - user_id (uuid, defaults to auth.uid(), FK to auth.users)
  - plan (text: free/starter/pro/enterprise)
  - amount (bigint, amount paid in FCFA including TVA)
  - payment_method (text: orange/wave/card)
  - status (text: pending/paid/cancelled/refunded)
  - started_at (timestamptz, when the subscription period starts)
  - ends_at (timestamptz, when it expires — null for free plan)
  - created_at (timestamptz)

2. Security
- RLS enabled, owner-scoped (4 CRUD policies, TO authenticated, auth.uid() = user_id).
- user_id defaults to auth.uid() so inserts from the client succeed without passing it.

3. Indexes
- subscriptions_user_idx on user_id for fast lookup
- subscriptions_status_idx on status for filtering active subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan           text NOT NULL DEFAULT 'free'
                   CHECK (plan IN ('free','starter','pro','enterprise')),
  amount         bigint NOT NULL DEFAULT 0 CHECK (amount >= 0),
  payment_method text NOT NULL DEFAULT 'orange'
                   CHECK (payment_method IN ('orange','wave','card')),
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','cancelled','refunded')),
  started_at     timestamptz NOT NULL DEFAULT now(),
  ends_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_idx   ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
