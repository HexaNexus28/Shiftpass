-- ShiftPass initial schema

CREATE TABLE IF NOT EXISTS employers (
  id         uuid PRIMARY KEY,
  name       text NOT NULL,
  restaurant text NOT NULL,
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  wallet_address text UNIQUE,
  email          text UNIQUE NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attestations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid REFERENCES employees(id) ON DELETE CASCADE,
  employer_id  uuid REFERENCES employers(id) ON DELETE CASCADE,
  skill        text NOT NULL,
  level        text NOT NULL CHECK (level IN ('En formation','Certifié','Expert')),
  tx_signature text,
  payload_hash text,
  issued_at    timestamptz DEFAULT now(),
  verified     boolean DEFAULT false
);

-- RLS
ALTER TABLE employers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

-- Employers: can only read/write their own row
CREATE POLICY "employer_own_select" ON employers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "employer_own_insert" ON employers
  FOR INSERT WITH CHECK (id = auth.uid());

-- Employees: public read, insert by any authenticated user (managers add their staff)
CREATE POLICY "employees_public_read" ON employees
  FOR SELECT USING (true);

CREATE POLICY "employees_authenticated_insert" ON employees
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "employees_update_wallet" ON employees
  FOR UPDATE USING (true) WITH CHECK (true);

-- Attestations: manager writes their own, public reads all
CREATE POLICY "attestations_employer_insert" ON attestations
  FOR INSERT TO authenticated WITH CHECK (employer_id = auth.uid());

CREATE POLICY "attestations_public_read" ON attestations
  FOR SELECT USING (true);
