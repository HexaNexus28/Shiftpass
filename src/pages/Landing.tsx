import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-20">

        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="ShiftPass" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">ShiftPass</span>
          </div>
          <Link
            to="/employer"
            className="text-sm font-medium text-purple-300 hover:text-white transition-colors"
          >
            Espace manager →
          </Link>
        </nav>

        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/60 border border-purple-700/50 rounded-full text-xs text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Solana devnet · Bêta publique
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
            Ton historique pro
            <br />
            <span className="text-purple-400">t'appartient.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 leading-relaxed max-w-xl">
            130% de turnover en restauration rapide. À chaque départ, tout disparaît.
            ShiftPass ancre tes compétences sur Solana — vérifiables par n'importe quel recruteur,
            en 2 secondes, sans intermédiaire.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              to="/employer"
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 active:scale-95 transition-all text-center shadow-lg shadow-purple-600/30"
            >
              Je suis manager →
            </Link>
            <a
              href="#employee"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 active:scale-95 transition-all text-center border border-white/15"
            >
              Je suis employé(e)
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { stat: '400ms', label: 'confirmation on-chain' },
            { stat: '0', label: 'intermédiaire requis' },
            { stat: '∞', label: 'durée de vie' },
          ].map(({ stat, label }) => (
            <div key={label} className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{stat}</p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              ),
              title: 'Non falsifiable',
              desc: "Chaque attestation est signée on-chain par l'employeur et confirmée par l'employé via son wallet.",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 15h3" />
                </svg>
              ),
              title: 'Portable',
              desc: "Ton passeport est lié à ton wallet Phantom. Tu le gardes à vie, même en changeant d'employeur.",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                </svg>
              ),
              title: 'Vérifiable',
              desc: "N'importe quel recruteur peut vérifier une attestation en 2 secondes sur l'explorateur Solana.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:bg-white/[0.07] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center">
                {icon}
              </div>
              <h3 className="font-semibold text-sm text-white">{title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div id="employee" className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl space-y-5">
          <div>
            <h2 className="font-semibold text-lg">Tu es employé(e) ?</h2>
            <p className="text-sm text-gray-400 mt-1">En 3 étapes, ton passeport professionnel est prêt.</p>
          </div>
          <div className="space-y-3">
            {[
              { step: '1', text: "Ton manager t'ajoute sur ShiftPass et t'envoie un lien personnalisé." },
              { step: '2', text: 'Tu ouvres ce lien et connectes ton wallet Phantom — ça prend 30 secondes.' },
              { step: '3', text: 'Ton passeport est en ligne, vérifiable par n\'importe quel futur employeur.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-700/80 border border-purple-600/50 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{step}</span>
                <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 pb-2">
          ShiftPass · Attestations professionnelles sur Solana
        </p>

      </div>
    </div>
  );
}
