-- Zenith multi-tenant schema.
-- One database, every tenant-owned table carries salon_id. Every query in
-- lib/db/*.ts filters explicitly by salon_id pulled from the verified
-- session — never from client input — which is what actually guarantees
-- no cross-tenant data leakage (not just "having a column named salon_id").

CREATE TABLE IF NOT EXISTS salons (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  admin_email TEXT UNIQUE NOT NULL,
  admin_password_hash TEXT NOT NULL,
  notify_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_locations_salon ON locations(salon_id);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD'
);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);

CREATE TABLE IF NOT EXISTS addons (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  mandatory BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_addons_salon ON addons(salon_id);
CREATE INDEX IF NOT EXISTS idx_addons_service ON addons(service_id);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  available_online BOOLEAN NOT NULL DEFAULT true,
  service_ids INTEGER[] NOT NULL DEFAULT '{}',
  working_hours JSONB NOT NULL DEFAULT '[]',
  days_off JSONB NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_location ON staff(location_id);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  location_id INTEGER REFERENCES locations(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  staff_id INTEGER NOT NULL REFERENCES staff(id),
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  party_size INTEGER NOT NULL DEFAULT 1,
  group_guests JSONB NOT NULL DEFAULT '[]',
  addon_ids INTEGER[] NOT NULL DEFAULT '{}',
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'confirmed',
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_time ON bookings(staff_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(salon_id, guest_phone, guest_name);
