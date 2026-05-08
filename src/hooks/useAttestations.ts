import { useState, useEffect } from 'react';
import {
  listAttestations,
  listAttestationsWithEmployer,
  createAttestation as createAttestationService,
} from '../services/attestations';
import {
  listEmployees,
  createEmployee,
  getEmployeeById,
  getEmployeeByWallet,
  setEmployeeWallet,
} from '../services/employees';
import type { Attestation, AttestationWithEmployer } from '../types/attestation';
import type { Employee } from '../types/employee';

export function useAttestations(params: { employeeId?: string; employerId?: string }) {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.employeeId && !params.employerId) { setLoading(false); return; }
    fetchAttestations();
  }, [params.employeeId, params.employerId]);

  async function fetchAttestations() {
    setLoading(true);
    try {
      setAttestations(await listAttestations(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function createAttestation(
    attestation: Omit<Attestation, 'id' | 'issued_at' | 'verified'>,
  ): Promise<{ error: string | null; data: Attestation | null }> {
    const result = await createAttestationService(attestation);
    if (!result.error && result.data) {
      setAttestations(prev => [result.data!, ...prev]);
    }
    return result;
  }

  return { attestations, loading, error, createAttestation, refetch: fetchAttestations };
}

export function usePassportAttestations(employeeId: string | null) {
  const [attestations, setAttestations] = useState<AttestationWithEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    setLoading(true);
    listAttestationsWithEmployer(employeeId)
      .then(setAttestations)
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  return { attestations, loading, error };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Pick<Employee, 'id' | 'name' | 'email' | 'wallet_address'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    setEmployees(await listEmployees());
    setLoading(false);
  }

  async function addEmployee(name: string, email: string): Promise<string | null> {
    const err = await createEmployee(name, email);
    if (!err) fetchEmployees();
    return err;
  }

  return { employees, loading, addEmployee, refetch: fetchEmployees };
}

export function useEmployee(id: string | null) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getEmployeeById(id).then(data => {
      if (!data) setNotFound(true);
      else setEmployee(data);
      setLoading(false);
    });
  }, [id]);

  async function updateWalletAddress(walletAddress: string): Promise<string | null> {
    if (!employee) return 'Employé non chargé';
    const err = await setEmployeeWallet(employee.id, walletAddress);
    if (!err) setEmployee(prev => prev ? { ...prev, wallet_address: walletAddress } : prev);
    return err;
  }

  return { employee, loading, notFound, updateWalletAddress };
}

export function useEmployeeByWallet(walletAddress: string | undefined) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }
    getEmployeeByWallet(walletAddress).then(data => {
      if (!data) setNotFound(true);
      else setEmployee(data);
      setLoading(false);
    });
  }, [walletAddress]);

  return { employee, loading, notFound };
}
