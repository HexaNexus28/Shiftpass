import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Attestation, AttestationWithEmployer } from '../types/attestation';

export function useAttestations(params: { employeeId?: string; employerId?: string }) {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.employeeId && !params.employerId) {
      setLoading(false);
      return;
    }
    fetchAttestations();
  }, [params.employeeId, params.employerId]);

  async function fetchAttestations() {
    setLoading(true);
    let query = supabase.from('attestations').select('*').order('issued_at', { ascending: false });
    if (params.employeeId) query = query.eq('employee_id', params.employeeId);
    if (params.employerId) query = query.eq('employer_id', params.employerId);
    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setAttestations(data ?? []);
    setLoading(false);
  }

  async function createAttestation(
    attestation: Omit<Attestation, 'id' | 'issued_at' | 'verified'>,
  ): Promise<{ error: string | null; data: Attestation | null }> {
    const { data, error: err } = await supabase
      .from('attestations')
      .insert(attestation)
      .select()
      .single();
    if (err) return { error: err.message, data: null };
    setAttestations(prev => [data, ...prev]);
    return { error: null, data };
  }

  return { attestations, loading, error, createAttestation, refetch: fetchAttestations };
}

export function usePassportAttestations(employeeId: string | null) {
  const [attestations, setAttestations] = useState<AttestationWithEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    fetchWithEmployer(employeeId);
  }, [employeeId]);

  async function fetchWithEmployer(id: string) {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('attestations')
      .select('*, employers(name, restaurant)')
      .eq('employee_id', id)
      .order('issued_at', { ascending: false });
    if (err) setError(err.message);
    else setAttestations((data as AttestationWithEmployer[]) ?? []);
    setLoading(false);
  }

  return { attestations, loading, error };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string; wallet_address: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('id, name, email, wallet_address').order('name');
    setEmployees(data ?? []);
    setLoading(false);
  }

  async function addEmployee(name: string, email: string): Promise<string | null> {
    const { error } = await supabase.from('employees').insert({ name, email });
    if (!error) fetchEmployees();
    return error?.message ?? null;
  }

  return { employees, loading, addEmployee, refetch: fetchEmployees };
}
