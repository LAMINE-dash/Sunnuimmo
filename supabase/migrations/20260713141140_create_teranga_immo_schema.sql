/*
# TerangaImmo — Schema initial

## Description
Schéma complet pour la plateforme SaaS immobilière TerangaImmo (Sénégal).

## Tables créées

### profiles
Profil enrichi lié à auth.users. Contient le rôle métier (acheteur, vendeur, agence,
notaire, banque, etc.), le plan d'abonnement, les indicateurs de vérification.

### properties
Annonces immobilières. Contient le type de bien, le type de transaction (vente/location),
le prix, la surface, les caractéristiques, les images, la géolocalisation et le statut.

### messages
Messagerie interne entre utilisateurs, éventuellement rattachée à une annonce.

### visit_requests
Demandes de visite d'un acheteur/locataire pour un bien, avec date souhaitée et statut.

## Sécurité
- RLS activé sur toutes les tables.
- Politiques séparées par opération CRUD.
- Les profils sont accessibles en lecture publique (anon) pour permettre l'affichage
  des vendeurs dans les annonces ; les modifications sont restreintes au propriétaire.
- Les annonces actives sont publiques en lecture. Les modifications sont restreintes
  au propriétaire.
- La messagerie est strictement owner-scoped.
- Les demandes de visite sont visibles du demandeur et du propriétaire du bien.
*/

-- ================================================
-- TABLE: profiles
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text NOT NULL DEFAULT '',
  email        text NOT NULL DEFAULT '',
  phone        text,
  role         text NOT NULL DEFAULT 'buyer'
                 CHECK (role IN ('buyer','tenant','seller','agency','promoter','notary','bank','admin')),
  avatar_url   text,
  is_verified  boolean NOT NULL DEFAULT false,
  subscription_plan text NOT NULL DEFAULT 'free'
                 CHECK (subscription_plan IN ('free','starter','pro','enterprise')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_anon" ON profiles;
CREATE POLICY "profiles_select_anon" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ================================================
-- TABLE: properties
-- ================================================
CREATE TABLE IF NOT EXISTS properties (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  type          text NOT NULL DEFAULT 'apartment'
                  CHECK (type IN ('apartment','house','villa','land','commercial','office')),
  listing_type  text NOT NULL DEFAULT 'sale'
                  CHECK (listing_type IN ('sale','rent')),
  price         bigint NOT NULL CHECK (price >= 0),
  surface       integer NOT NULL CHECK (surface >= 0),
  rooms         integer,
  bedrooms      integer,
  bathrooms     integer,
  address       text NOT NULL DEFAULT '',
  city          text NOT NULL DEFAULT '',
  neighborhood  text,
  latitude      double precision,
  longitude     double precision,
  images        text[] NOT NULL DEFAULT '{}',
  features      text[] NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','pending','sold','rented','archived')),
  is_premium    boolean NOT NULL DEFAULT false,
  is_verified   boolean NOT NULL DEFAULT false,
  views         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS properties_user_id_idx   ON properties(user_id);
CREATE INDEX IF NOT EXISTS properties_city_idx       ON properties(city);
CREATE INDEX IF NOT EXISTS properties_type_idx       ON properties(type);
CREATE INDEX IF NOT EXISTS properties_listing_type_idx ON properties(listing_type);
CREATE INDEX IF NOT EXISTS properties_status_idx     ON properties(status);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_select_public" ON properties;
CREATE POLICY "properties_select_public" ON properties FOR SELECT
  TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "properties_insert_own" ON properties;
CREATE POLICY "properties_insert_own" ON properties FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "properties_update_own" ON properties;
CREATE POLICY "properties_update_own" ON properties FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "properties_delete_own" ON properties;
CREATE POLICY "properties_delete_own" ON properties FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ================================================
-- TABLE: messages
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   uuid REFERENCES properties(id) ON DELETE SET NULL,
  content       text NOT NULL,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_sender_idx   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages(receiver_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_participant" ON messages;
CREATE POLICY "messages_select_participant" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_update_receiver" ON messages;
CREATE POLICY "messages_update_receiver" ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_delete_sender" ON messages;
CREATE POLICY "messages_delete_sender" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- ================================================
-- TABLE: visit_requests
-- ================================================
CREATE TABLE IF NOT EXISTS visit_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_date   date NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled','completed')),
  message          text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visit_requests_property_idx   ON visit_requests(property_id);
CREATE INDEX IF NOT EXISTS visit_requests_requester_idx  ON visit_requests(requester_id);

ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visits_select_participant" ON visit_requests;
CREATE POLICY "visits_select_participant" ON visit_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_requests.property_id
        AND properties.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "visits_insert_own" ON visit_requests;
CREATE POLICY "visits_insert_own" ON visit_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "visits_update_owner_or_requester" ON visit_requests;
CREATE POLICY "visits_update_owner_or_requester" ON visit_requests FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_requests.property_id
        AND properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = visit_requests.property_id
        AND properties.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "visits_delete_own" ON visit_requests;
CREATE POLICY "visits_delete_own" ON visit_requests FOR DELETE
  TO authenticated USING (auth.uid() = requester_id);
