import { supabase } from './supabase';
import type { Attestation, AttestationWithEmployer } from '../types/attestation';

export async function listAttestations(params: {
  employeeId?: string;
  employerId?: string;
}): Promise<Attestation[]> {
  let query = supabase.from('attestations').select('*').order('issued_at', { ascending: false });
  if (params.employeeId) query = query.eq('employee_id', params.employeeId);
  if (params.employerId) query = query.eq('employer_id', params.employerId);
  const { data } = await query;
  return data ?? [];
}

export async function listAttestationsWithEmployer(employeeId: string): Promise<AttestationWithEmployer[]> {
  const { data } = await supabase
    .from('attestations')
    .select('*, employers(name, restaurant)')
    .eq('employee_id', employeeId)
    .order('issued_at', { ascending: false });
  return (data as AttestationWithEmployer[]) ?? [];
}

export async function createAttestation(
  attestation: Omit<Attestation, 'id' | 'issued_at' | 'verified'>,
): Promise<{ data: Attestation | null; error: string | null }> {
  const { data, error } = await supabase
    .from('attestations')
    .insert(attestation)
    .select()
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}
