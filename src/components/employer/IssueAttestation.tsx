import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { sha256 } from '../../services/hash';
import { useSolana } from '../../hooks/useSolana';
import { ATTESTATION_TYPE, ATTESTATION_VERSION, SKILL_PRESETS } from '../../config/constants';
import { SolanaStatus } from '../shared/SolanaStatus';
import type { IssueAttestationProps } from '../../props/IssueAttestation.props';
import type { AttestationLevel } from '../../types/attestation';
import type { Employee } from '../../types/employee';

const LEVELS: AttestationLevel[] = ['En formation', 'Certifié', 'Expert'];

export function IssueAttestation({ employerId, restaurantName, onSuccess }: IssueAttestationProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState<AttestationLevel>('Certifié');
  const [submitting, setSubmitting] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { sendMemo, sending, error: solanaError } = useSolana();

  useEffect(() => {
    supabase.from('employees').select('*').order('name').then(({ data }) => setEmployees(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;
    if (!employee.wallet_address) {
      setFormError('Cet employé n\'a pas encore connecté son wallet Phantom.');
      return;
    }

    setSubmitting(true);
    try {
      const basePayload = {
        type: ATTESTATION_TYPE,
        version: ATTESTATION_VERSION,
        employee_wallet: employee.wallet_address,
        skill,
        level,
        issuer_id: employerId,
        restaurant: restaurantName,
        date: new Date().toISOString().split('T')[0],
      };
      const hash = await sha256(basePayload);
      const txSignature = await sendMemo({ ...basePayload, hash });

      const { error } = await supabase.from('attestations').insert({
        employee_id: selectedEmployee,
        employer_id: employerId,
        skill,
        level,
        tx_signature: txSignature,
        payload_hash: hash,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      setTxSig(txSignature);
      setTimeout(() => {
        setSkill('');
        setSelectedEmployee('');
        setLevel('Certifié');
        setTxSig(null);
        onSuccess();
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const isLoading = submitting || sending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
        <select
          value={selectedEmployee}
          onChange={e => setSelectedEmployee(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        >
          <option value="">Sélectionner un employé...</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}{emp.wallet_address ? '' : ' ⚠ (pas de wallet)'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Compétence</label>
        <input
          list="skill-presets"
          type="text"
          value={skill}
          onChange={e => setSkill(e.target.value)}
          placeholder="Ex: Formation caisse, Hygiène alimentaire..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <datalist id="skill-presets">
          {SKILL_PRESETS.map(s => <option key={s} value={s} />)}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
        <div className="flex gap-2">
          {LEVELS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                level === l
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {(formError || solanaError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {formError ?? solanaError}
        </div>
      )}

      {txSig && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium mb-1">Attestation émise !</p>
          <SolanaStatus txSignature={txSig} />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !selectedEmployee || !skill}
        className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Ancrage on-chain...' : 'Émettre l\'attestation'}
      </button>
    </form>
  );
}
