export type AttestationLevel = 'En formation' | 'Certifié' | 'Expert';

export interface Attestation {
  id: string;
  employee_id: string;
  employer_id: string;
  skill: string;
  level: AttestationLevel;
  tx_signature: string | null;
  payload_hash: string | null;
  employee_signature: string | null;
  issued_at: string;
  verified: boolean;
}

export interface AttestationWithEmployer extends Attestation {
  employers: {
    name: string;
    restaurant: string;
  } | null;
}

export interface MemoPayload {
  type: string;
  version: string;
  employee_wallet: string;
  skill: string;
  level: AttestationLevel;
  issuer_id: string;
  restaurant: string;
  date: string;
  hash?: string;
}
