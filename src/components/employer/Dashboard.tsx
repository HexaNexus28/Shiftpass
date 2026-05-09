import { useState } from 'react';
import { useAttestations, useEmployees } from '../../hooks/useAttestations';
import { IssueAttestation } from './IssueAttestation';
import { AttestationList } from './AttestationList';
import type { DashboardProps } from '../../props/Dashboard.props';

export function Dashboard({ employer, onSignOut }: DashboardProps) {
  const { attestations, loading, refetch } = useAttestations({ employerId: employer.id });
  const { employees, addEmployee } = useEmployees();
  const [view, setView] = useState<'attestations' | 'employees' | 'issue'>('attestations');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    const err = await addEmployee(newName, newEmail, newStartDate);
    if (err) {
      setAddError(err);
    } else {
      setNewName('');
      setNewEmail('');
      setNewStartDate(new Date().toISOString().split('T')[0]);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ShiftPass</h1>
            <p className="text-xs text-gray-500">{employer.restaurant} · {employer.name}</p>
          </div>
          <button
            onClick={onSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-wrap gap-2">
          {(['attestations', 'employees', 'issue'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                view === v
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {v === 'attestations' && `Attestations (${attestations.length})`}
              {v === 'employees' && `Employés (${employees.length})`}
              {v === 'issue' && '+ Émettre'}
            </button>
          ))}
        </div>

        {view === 'issue' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Émettre une attestation on-chain</h2>
            <IssueAttestation
              employerId={employer.id}
              restaurantName={employer.restaurant}
              onSuccess={() => { setView('attestations'); refetch(); }}
            />
          </div>
        )}

        {view === 'attestations' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
            ) : (
              <AttestationList attestations={attestations} />
            )}
          </div>
        )}

        {view === 'employees' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Ajouter un employé</h2>
              <form onSubmit={handleAddEmployee} className="space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                {addError && <p className="text-sm text-red-600">{addError}</p>}
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Ajouter
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                  {emp.wallet_address ? (
                    <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {emp.wallet_address.slice(0, 4)}...{emp.wallet_address.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Wallet manquant
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
