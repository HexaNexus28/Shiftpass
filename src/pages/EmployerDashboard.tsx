import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Dashboard } from '../components/employer/Dashboard';

type AuthMode = 'login' | 'register';

export function EmployerDashboard() {
  const { user, employer, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurant, setRestaurant] = useState('');
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const err = await signIn(email, password);
        if (err) setError(err);
      } else {
        const err = await signUp(email, password, name, restaurant);
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

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
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
