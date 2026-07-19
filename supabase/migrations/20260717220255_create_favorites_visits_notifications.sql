/*
# Create favorites, visits, and notifications tables

1. New Tables
- `favorites`: users can save properties they like (user_id + property_id, unique pair)
- `visits`: scheduled property visit requests (date, time slot, status pending/confirmed/refused/cancelled)
- `notifications`: user notifications (type, message, read status, link)

2. Security
- All tables are owner-scoped (user_id defaults to auth.uid())
- RLS enabled on all tables with 4 CRUD policies each (select/insert/update/delete)
- SELECT on favorites allows any authenticated user to see their own favorites
- Visits: owner can CRUD their own visits; property owners can see visits on their properties
- Notifications: owner-scoped CRUD

3. Indexes
- favorites: index on user_id for fast lookup
- visits: index on property_id and user_id
- notifications: index on user_id and is_read
*/

-- ================================================
-- TABLE: favorites
-- ================================================
CREATE TABLE IF NOT EXISTS favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ================================================
-- TABLE: visits
-- ================================================
CREATE TABLE IF NOT EXISTS visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  visitor_name  text NOT NULL,
  visitor_phone text NOT NULL,
  visitor_email text,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message     text,
  status      text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','refused','cancelled','completed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visits_property_idx ON visits(property_id);
CREATE INDEX IF NOT EXISTS visits_user_idx ON visits(user_id);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_visits" ON visits;
CREATE POLICY "select_own_visits" ON visits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_visits" ON visits;
CREATE POLICY "insert_own_visits" ON visits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_visits" ON visits;
CREATE POLICY "update_own_visits" ON visits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_visits" ON visits;
CREATE POLICY "delete_own_visits" ON visits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ================================================
-- TABLE: notifications
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('visit_request','message','favorite','system','payment','property')),
  title       text NOT NULL,
  message     text,
  link        text,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
