import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Dashboard } from '../components/employer/Dashboard';
import { verifySiret } from '../services/siret';
import type { SiretResult } from '../services/siret';

type AuthMode = 'login' | 'register';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export function EmployerDashboard() {
  const { user, employer, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [siret, setSiret] = useState('');
  const [siretResult, setSiretResult] = useState<SiretResult | null>(null);
  const [siretChecking, setSiretChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  if (user && employer) {
    return <Dashboard employer={employer} onSignOut={signOut} />;
  }

  async function handleCheckSiret() {
    if (!siret) return;
    if (DEV_MODE) {
      setSiretResult({ exists: true, active: true, companyName: '[DEV] Entreprise de test' });
      if (!restaurant) setRestaurant('[DEV] Entreprise de test');
      return;
    }
    setSiretChecking(true);
    setSiretResult(null);
    const result = await verifySiret(siret);
    setSiretResult(result);
    setSiretChecking(false);
    if (result.companyName && !restaurant) setRestaurant(result.companyName);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const err = await signIn(email, password);
        if (err) setError(err);
      } else {
        if (!DEV_MODE && (!siretResult?.exists || !siretResult.active)) {
          setError('Veuillez vérifier un SIRET valide avant de créer le compte.');
          setSubmitting(false);
          return;
        }
        const err = await signUp(email, password, name, restaurant, siret.replace(/\s/g, '') || null);
        if (err) setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 text-white text-xl font-bold mb-4">S</div>
          <h1 className="text-2xl font-bold text-gray-900">ShiftPass</h1>
          <p className="text-sm text-gray-500 mt-1">Espace manager</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex rounded-lg border border-gray-200 p-1">
            {(['login', 'register'] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={restaurant}
                  onChange={e => setRestaurant(e.target.value)}
                  placeholder="Nom du restaurant / établissement"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siret}
                    onChange={e => { setSiret(e.target.value); setSiretResult(null); }}
                    placeholder="SIRET (14 chiffres)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    maxLength={17}
                  />
                  <button
                    type="button"
                    onClick={handleCheckSiret}
                    disabled={siretChecking || !siret}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
                  >
                    {siretChecking ? '...' : 'Vérifier'}
                  </button>
                </div>
                {siretResult && (
                  <div className={`p-2 rounded-lg text-xs ${
                    siretResult.exists && siretResult.active
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {siretResult.exists && siretResult.active
                      ? `✓ ${siretResult.companyName} — entreprise active`
                      : siretResult.error ?? 'SIRET invalide'
                    }
                  </div>
                )}
              </>
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              minLength={6}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
