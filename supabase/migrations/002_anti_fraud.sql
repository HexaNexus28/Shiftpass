-- ShiftPass anti-fraud migration

-- SIRET sur employers (vérification entreprise réelle)
ALTER TABLE employers ADD COLUMN IF NOT EXISTS siret text;

-- Date d'embauche sur employees (anti-attestation immédiate)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Signature de l'employé sur attestations (consentement on-chain)
ALTER TABLE attestations ADD COLUMN IF NOT EXISTS employee_signature text;

-- Politique de mise à jour verified : l'employé peut signer ses propres attestations
CREATE POLICY "attestations_employee_confirm" ON attestations
  FOR UPDATE USING (
    employee_id IN (
      SELECT id FROM employees WHERE wallet_address IS NOT NULL
    )
  )
  WITH CHECK (true);
