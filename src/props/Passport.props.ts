import type { Employee } from '../types/employee';
import type { AttestationWithEmployer } from '../types/attestation';

export interface PassportProps {
  employee: Employee;
  attestations: AttestationWithEmployer[];
  loading: boolean;
  onWalletLinked: (walletAddress: string) => void;
}
