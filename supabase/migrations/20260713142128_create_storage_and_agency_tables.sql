/*
# Storage bucket + agency tables

1. Creates a public storage bucket `property-images` for property photo uploads.
2. Creates `agencies` table for agency profiles (multi-user workspaces).
3. Creates `agency_members` join table so multiple users can belong to an agency.
4. Adds storage RLS to allow authenticated users to upload to their own subfolder
   and allow public read access.

Security:
- Storage: authenticated users can insert/delete in their own folder; public SELECT.
- agencies: owner-scoped write; public SELECT.
- agency_members: members can read their own membership; owners manage membership.
*/

-- Storage bucket (idempotent via ON CONFLICT)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "storage_images_public_read" ON storage.objects;
CREATE POLICY "storage_images_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "storage_images_auth_insert" ON storage.objects;
CREATE POLICY "storage_images_auth_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "storage_images_auth_delete" ON storage.objects;
CREATE POLICY "storage_images_auth_delete" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================================
-- TABLE: agencies
-- ================================================
CREATE TABLE IF NOT EXISTS agencies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  logo_url     text,
  phone        text,
  email        text,
  website      text,
  address      text,
  city         text,
  is_verified  boolean NOT NULL DEFAULT false,
  subscription_plan text NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free','starter','pro','enterprise')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agencies_select_public" ON agencies;
CREATE POLICY "agencies_select_public" ON agencies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "agencies_insert_own" ON agencies;
CREATE POLICY "agencies_insert_own" ON agencies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "agencies_update_own" ON agencies;
CREATE POLICY "agencies_update_own" ON agencies FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "agencies_delete_own" ON agencies;
CREATE POLICY "agencies_delete_own" ON agencies FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ================================================
-- TABLE: agency_members
-- ================================================
CREATE TABLE IF NOT EXISTS agency_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id  uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'agent'
    CHECK (role IN ('owner','manager','agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, user_id)
);

CREATE INDEX IF NOT EXISTS agency_members_agency_idx ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS agency_members_user_idx   ON agency_members(user_id);

ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agency_members_select" ON agency_members;
CREATE POLICY "agency_members_select" ON agency_members FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "agency_members_insert" ON agency_members;
CREATE POLICY "agency_members_insert" ON agency_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "agency_members_delete" ON agency_members;
CREATE POLICY "agency_members_delete" ON agency_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM agencies WHERE agencies.id = agency_members.agency_id AND agencies.owner_id = auth.uid()
    )
  );
