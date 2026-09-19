-- ==========================================
-- PRESENTLY: DATABASE SCHEMA & RLS POLICIES
-- ==========================================

-- 1. Create Tables
-- ------------------------------------------

-- domains
CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain_lead_id uuid, -- FK added later to avoid circular dependency if needed, or just standard
  description text,
  created_at timestamptz DEFAULT now()
);

-- members
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_serial text UNIQUE,
  student_id text UNIQUE NOT NULL,
  register_no text UNIQUE NOT NULL,
  name text NOT NULL,
  photo_url text,
  email text UNIQUE NOT NULL,
  regular_email text UNIQUE,
  phone text,
  domain_ids uuid[] DEFAULT '{}',
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member','domain_lead','club_admin','super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','alumni')),
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for domains now that members table exists
ALTER TABLE domains
  ADD CONSTRAINT fk_domain_lead
  FOREIGN KEY (domain_lead_id) REFERENCES members(id) ON DELETE SET NULL;

-- sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('meeting','event','workshop','other')),
  date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  scope text NOT NULL CHECK (scope IN ('club_wide','domain_specific')),
  target_domain_ids uuid[] DEFAULT '{}',
  created_by uuid REFERENCES members(id),
  late_threshold_minutes integer,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz DEFAULT now()
);

-- attendance
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('present','late','excused','absent')),
  method text NOT NULL CHECK (method IN ('nfc','manual')),
  marked_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, member_id)
);

-- ==========================================
-- 2. Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 3. Create Security Policies
-- ==========================================

-- Note: Google OAuth users are linked to members by email.
-- auth.jwt() ->> 'email' extracts the email of the logged-in user.

-- ------------------------------------------
-- Policies for 'domains'
-- ------------------------------------------
-- Anyone authenticated can view domains
CREATE POLICY "domains_read" ON domains 
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage domains
CREATE POLICY "domains_write" ON domains 
  FOR ALL TO authenticated 
  USING ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('super_admin', 'club_admin'));


-- ------------------------------------------
-- Policies for 'members'
-- ------------------------------------------
-- Anyone authenticated can view members (needed for manual search)
CREATE POLICY "members_read" ON members 
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete members
CREATE POLICY "members_insert" ON members 
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('super_admin', 'club_admin'));

CREATE POLICY "members_update" ON members 
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('super_admin', 'club_admin'));

CREATE POLICY "members_delete" ON members 
  FOR DELETE TO authenticated
  USING ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('super_admin', 'club_admin'));


-- ------------------------------------------
-- Policies for 'sessions'
-- ------------------------------------------
-- Anyone authenticated can view sessions
CREATE POLICY "sessions_read" ON sessions 
  FOR SELECT TO authenticated USING (true);

-- Admins can do everything. Domain leads can only create/edit sessions if they belong to target_domain_ids
CREATE POLICY "sessions_write" ON sessions 
  FOR ALL TO authenticated
  USING (
    (SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('club_admin', 'super_admin')
    OR (
      (SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) = 'domain_lead'
      AND (SELECT domain_ids FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) && target_domain_ids
    )
  );


-- ------------------------------------------
-- Policies for 'attendance'
-- ------------------------------------------
-- Members can view their own attendance
CREATE POLICY "attendance_self_read" ON attendance 
  FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')));

-- Admins and Leads can view all attendance records
CREATE POLICY "attendance_admin_read" ON attendance 
  FOR SELECT TO authenticated
  USING ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('domain_lead', 'club_admin', 'super_admin'));

-- Admins and Leads can mark attendance manually
-- Members can mark their own attendance ONLY via NFC method
CREATE POLICY "attendance_write" ON attendance 
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin / Lead inserting for someone
    ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('domain_lead', 'club_admin', 'super_admin'))
    OR 
    -- Self check-in condition: must be their own ID, must be via NFC
    (member_id IN (SELECT id FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) AND method = 'nfc')
  );

-- Only Admins and Leads can update attendance records (e.g., changing present to absent)
CREATE POLICY "attendance_update" ON attendance 
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM members WHERE email ILIKE (auth.jwt() ->> 'email') OR regular_email ILIKE (auth.jwt() ->> 'email')) IN ('domain_lead', 'club_admin', 'super_admin'));
