import { supabase } from './supabase';

export interface CrossAttestationResult {
  isSuspect: boolean;
  reason?: string;
}

/**
 * Détecte si l'employé visé est lui-même un employeur enregistré
 * ET a déjà émis des attestations vers des employés du restaurant courant.
 * Scénario : Alice (resto A) veut attester Bob. Bob est aussi employeur (resto B).
 * Si Bob a déjà attest des gens attestés par Alice → relation croisée suspecte.
 */
export async function detectCrossAttestation(
  employeeId: string,
  currentEmployerId: string,
): Promise<CrossAttestationResult> {
  const { data: employee } = await supabase
    .from('employees')
    .select('email')
    .eq('id', employeeId)
    .single();

  if (!employee?.email) return { isSuspect: false };

  const { data: employerMatch } = await supabase
    .from('employers')
    .select('id, restaurant')
    .eq('email', employee.email)
    .maybeSingle();

  if (!employerMatch) return { isSuspect: false };

  const { data: myEmployees } = await supabase
    .from('attestations')
    .select('employee_id')
    .eq('employer_id', currentEmployerId);

  const myEmployeeIds = (myEmployees ?? []).map((r: { employee_id: string }) => r.employee_id);

  if (myEmployeeIds.length > 0) {
    const { count } = await supabase
      .from('attestations')
      .select('id', { count: 'exact', head: true })
      .eq('employer_id', employerMatch.id)
      .in('employee_id', myEmployeeIds);

    if (count && count > 0) {
      return {
        isSuspect: true,
        reason: `Cet employé est aussi manager chez "${employerMatch.restaurant}" et a attesté des employés de votre établissement.`,
      };
    }
  }

  return {
    isSuspect: true,
    reason: `Cet employé est aussi manager enregistré chez "${employerMatch.restaurant}". Relation croisée détectée.`,
  };
}

/**
 * Vérifie que l'emploi date d'au moins N jours avant d'autoriser une attestation.
 */
export function checkMinimumTenure(
  employmentStartDate: string,
  minDays = 14,
): { allowed: boolean; daysRemaining: number } {
  const start = new Date(employmentStartDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return {
    allowed: diffDays >= minDays,
    daysRemaining: Math.max(0, minDays - diffDays),
  };
}
