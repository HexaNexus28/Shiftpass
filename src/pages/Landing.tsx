import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-sm font-bold">S</div>
            <span className="font-bold text-lg">ShiftPass</span>
          </div>
          <Link
            to="/employer"
            className="text-sm text-purple-300 hover:text-white transition-colors"
          >
            Espace manager →
          </Link>
        </nav>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900 border border-purple-700 rounded-full text-xs text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Hackathon Dev3Pack · Solana devnet
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Ton historique pro
            <br />
            <span className="text-purple-400">t'appartient.</span>
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed">
            130% de turnover en restauration rapide. À chaque départ, tout disparaît.
            ShiftPass ancre tes compétences sur Solana — vérifiables par n'importe quel recruteur,
            en 2 secondes, sans intermédiaire.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/employer"
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-center"
            >
              Je suis manager →
            </Link>
            <a
              href="#employee"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-center border border-white/20"
            >
              Je suis employé(e)
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { stat: '$0.00025', label: 'par transaction Solana' },
            { stat: '400ms', label: 'confirmation on-chain' },
            { stat: '∞', label: 'durée de vie de l\'attestation' },
          ].map(({ stat, label }) => (
            <div key={stat} className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-2xl font-bold text-purple-400">{stat}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div id="employee" className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <h2 className="font-semibold text-lg">Tu es employé(e) ?</h2>
          <p className="text-sm text-gray-300">
            Ton manager émet tes attestations. Pour voir ton passeport, connecte ton wallet Phantom
            et demande le lien à ton manager, ou accède à :
          </p>
          <div className="font-mono text-sm text-purple-300 bg-black/20 px-4 py-2 rounded-lg">
            /passport/[ton-adresse-wallet]
          </div>
        </div>
      </div>
    </div>
  );
}
