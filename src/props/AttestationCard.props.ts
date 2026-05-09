import type { AttestationWithEmployer } from '../types/attestation';

export interface AttestationCardProps {
  attestation: AttestationWithEmployer;
  onConfirm?: (attestationId: string, payloadHash: string) => void;
  confirming?: boolean;
}
