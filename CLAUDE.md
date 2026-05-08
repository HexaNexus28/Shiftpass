# ShiftPass — CLAUDE.md

ShiftPass = passeport professionnel portable pour travailleurs frontline, ancré sur Solana.
Contexte : Dev3Pack Global Hackathon — 8-10 mai 2026. Soumission dimanche 8h00.
Stack : React 19 + Vite 8 + TypeScript 6 + TailwindCSS 3 | Supabase | Solana devnet | @solana/web3.js v1
Langue : Français. Ce fichier est la source de vérité du projet.

---

## Problème adressé

Turnover 70-130%/an en restauration rapide. Un employé part → son historique disparaît.
Formations, compétences maîtrisées, reconnaissances reçues : tout appartient à l'employeur,
stocké dans ses outils, inaccessible au salarié. Le nouvel employeur repart de zéro.

ShiftPass : l'employé possède ses attestations on-chain. L'employeur les émet,
l'employé les conserve à vie dans son wallet. Portable, vérifiable, non falsifiable.

---

## Supabase

```
Project ref : poknblfcdvnipoqfsrgr
URL         : https://poknblfcdvnipoqfsrgr.supabase.co
Dashboard   : https://supabase.com/dashboard/project/poknblfcdvnipoqfsrgr
SQL Editor  : https://supabase.com/dashboard/project/poknblfcdvnipoqfsrgr/sql
```

---

## Architecture réelle (implémentée)

```
shiftpass/
├── src/
│   ├── components/
│   │   ├── employer/
│   │   │   ├── Dashboard.tsx         # Tabs : attestations / employés / émettre
│   │   │   ├── IssueAttestation.tsx  # Formulaire Memo + Supabase
│   │   │   └── AttestationList.tsx
│   │   ├── employee/
│   │   │   ├── Passport.tsx          # Profil portable + connect wallet
│   │   │   ├── WalletConnect.tsx     # Phantom connect/disconnect
│   │   │   └── AttestationCard.tsx   # Carte + lien Explorer
│   │   └── shared/
│   │       ├── SkillBadge.tsx        # Badge coloré par niveau
│   │       └── SolanaStatus.tsx      # Indicateur tx + lien Explorer
│   ├── hooks/
│   │   ├── useAuth.ts                # Supabase Auth (employer)
│   │   ├── useWallet.ts              # Wrapper @solana/wallet-adapter
│   │   ├── useSolana.ts              # sendMemo() + loading/error state
│   │   └── useAttestations.ts        # CRUD Supabase + usePassportAttestations + useEmployees
│   ├── services/
│   │   ├── supabase.ts               # Client centralisé
│   │   ├── solana.ts                 # sendMemoTransaction() — Buffer importé depuis 'buffer'
│   │   └── hash.ts                   # sha256 via crypto.subtle
│   ├── config/
│   │   └── constants.ts              # DEVNET_RPC, MEMO_PROGRAM_ID, SKILL_PRESETS
│   ├── types/
│   │   ├── attestation.ts            # Attestation, AttestationWithEmployer, MemoPayload
│   │   ├── employee.ts
│   │   └── employer.ts
│   ├── props/                        # Props interfaces (R-06) — une par composant
│   │   ├── SkillBadge.props.ts
│   │   ├── SolanaStatus.props.ts
│   │   ├── AttestationCard.props.ts
│   │   ├── AttestationList.props.ts
│   │   ├── IssueAttestation.props.ts
│   │   ├── Dashboard.props.ts
│   │   └── Passport.props.ts
│   ├── pages/
│   │   ├── Landing.tsx               # Page d'accueil dark + pitch
│   │   ├── EmployerDashboard.tsx     # Auth + Dashboard
│   │   └── EmployeePassport.tsx      # EmployeePassport + EmployeeProfile
│   ├── polyfills.ts                  # Buffer global pour @solana/web3.js en browser
│   ├── main.tsx
│   ├── App.tsx                       # Routes + WalletProvider + ConnectionProvider
│   └── index.css                     # @tailwind base/components/utilities uniquement
├── scripts/
│   └── migrate.js                    # Node.js — applique supabase/migrations/*.sql
├── supabase/
│   └── migrations/
│       └── 001_initial.sql           # Tables + RLS policies
├── public/
│   ├── logo.svg                      # Shield + chain links + checkmark vert
│   └── banner.svg                    # Bannière hackathon (1200x630)
├── .env.local                        # VITE_SUPABASE_URL/KEY + SUPABASE_DB_URL/PASSWORD
├── .env.dev                          # Copie pour migration explicite
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts                    # global polyfill + buffer alias
├── CLAUDE.md                         # CE FICHIER
└── package.json
```

---

## Routes

```
/                          Landing page
/employer                  Auth employer (login / register) → Dashboard
/passport/:walletAddress   Passeport public (par wallet) — URL partageable
/employee/:employeeId      Profil employé (par UUID, pour connecter le wallet)
```

---

## Flux principal

```
Employeur (manager)                      Employé
───────────────────                      ────────
Connexion email/password                 Reçoit lien /employee/:id
Dashboard → Onglet Employés              Connecte wallet Phantom
Ajoute l'employé (nom + email)     →     Wallet associé au profil
Onglet Émettre
Sélectionne employé + skill + niveau
sha256(payload)
sendMemoTransaction() ──────────────→   Transaction Memo on-chain
supabase.insert(attestation)
                                         Passeport public /passport/:walletAddress
                                         Vérifiable sur Explorer
```

---

## Stack Solana — Choix techniques

```
Réseau    : devnet (SOL factice gratuit via faucet.solana.com)
SDK       : @solana/web3.js v1 (pas v2 — API différente)
Wallets   : @solana/wallet-adapter-react + phantom
Mécanisme : Memo Program (program natif Solana, ancre du texte on-chain)
```

Pourquoi Memo et pas NFT/Anchor :
- Anchor (Rust) = 3-5 jours → hors scope 2 jours
- Metaplex NFT = complexité inutile
- Memo Program = natif, 0 déploiement, vérifiabilité publique identique

Résultat : 1 transaction Memo par attestation, payload JSON + sha256, signé par le manager,
vérifiable sur https://explorer.solana.com/?cluster=devnet

### Memo payload (ancré on-chain)

```json
{
  "type": "shiftpass_attestation",
  "version": "1.0",
  "employee_wallet": "7xKp...Bf3",
  "skill": "Formation caisse",
  "level": "Certifié",
  "issuer_id": "uuid-manager",
  "restaurant": "McDo Gare Saint-Lazare",
  "date": "2026-05-09",
  "hash": "sha256_of_above_fields"
}
```

---

## BDD Supabase (migration à appliquer — 001_initial.sql)

```sql
-- Tables
employers    (id uuid PK = auth.uid(), name, restaurant, email, created_at)
employees    (id uuid PK, name, wallet_address UNIQUE, email UNIQUE, created_at)
attestations (id uuid PK, employee_id FK, employer_id FK, skill, level CHECK,
              tx_signature, payload_hash, issued_at, verified)

-- RLS policies
employers    : employer_own_select (id = auth.uid()), employer_own_insert (id = auth.uid())
employees    : employees_public_read (true), employees_authenticated_insert, employees_update_wallet
attestations : attestations_employer_insert (employer_id = auth.uid()), attestations_public_read
```

**Pour appliquer la migration :** coller `supabase/migrations/001_initial.sql` dans le SQL Editor Supabase.
Ou configurer `SUPABASE_DB_PASSWORD` dans `.env.local` et lancer `npm run migrate:dev`.

---

## Commandes

```bash
npm run dev              # Vite dev server → localhost:5173
npm run migrate:dev      # Applique migrations depuis .env.local
npm run build            # TypeScript check + Vite build
```

---

## .env.local (template)

```env
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

VITE_SOLANA_RPC=https://api.devnet.solana.com

# Connexion directe DB — Supabase > Settings > Database > Connection string
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
SUPABASE_DB_PASSWORD=[password_en_clair]
```

Note : `SUPABASE_DB_URL` peut contenir des `@` dans le password — le script les gère en utilisant
`SUPABASE_DB_PASSWORD` directement (valeur brute, sans URL encoding).

---

## Dépendances clés

```
@solana/web3.js@^1            Solana RPC + transactions (v1, pas v2)
@solana/wallet-adapter-react  Contexte wallet React
@solana/wallet-adapter-react-ui + phantom
buffer@^6                     Polyfill browser pour Buffer (requis par web3.js)
@supabase/supabase-js@^2      Client Supabase
react-router-dom@^7           Routing SPA
tailwindcss@^3                Styles
pg@^8 + dotenv@^17            Migration Node.js
```

**Note Windows :** si `npm install @solana/*` échoue avec ENOTEMPTY →
`Remove-Item node_modules\es-toolkit\dist -Recurse -Force` puis réessayer.
Il faut aussi `yarn` installé (`npm install -g yarn`) pour les postinstall scripts Solana.

---

## Plan de build — état actuel

### Vendredi soir — socle ✅
- [x] Init Vite 8 + Tailwind v3 + toutes les dépendances
- [x] Structure complète (types, services, hooks, composants, pages, props)
- [x] Auth employer (signIn / signUp via Supabase Auth)
- [x] Wallet Phantom — WalletConnect + useWallet + polyfill Buffer
- [x] sendMemoTransaction — services/solana.ts
- [x] Logo + bannière SVG
- [x] Git init + push GitHub (HexaNexus28/Shiftpass)
- [ ] Migration SQL appliquée sur Supabase ← appliquer via SQL Editor

### Samedi — MVP
- [ ] Test end-to-end wallet → attestation → Explorer
- [ ] Dashboard employer complet (testé en browser)
- [ ] Page passeport employé — URL publique testée
- [ ] UI responsive validée mobile

### Dimanche matin — wrap
- [ ] Test end-to-end final
- [ ] Déploiement Vercel
- [ ] Soumission 8h00

---

## Règles projet

- Strict TypeScript — no any
- Supabase : toujours via `services/supabase.ts`
- Solana : toujours via `services/solana.ts` — jamais de `Connection` inline dans les composants
- Buffer : importé depuis `'buffer'` dans solana.ts, polyfill global dans `polyfills.ts`
- Hooks : logique métier dans les hooks, composants = affichage uniquement
- Props : interfaces dans `src/props/ComponentName.props.ts` (R-06)
- try/catch sur tout appel Supabase/Solana
- RLS activé et testé sur toutes les tables
- Devnet uniquement pendant le hackathon

---

## Pitch (60s)

Problème : 130% de turnover en restauration. Un employé part, son historique disparaît.
Solution : attestations de compétences ancrées sur Solana — appartiennent à l'employé, pas à l'employeur.
Vérifiable par n'importe quel recruteur, en 2 secondes, sans intermédiaire.
Solana : 400ms de confirmation, explorateur public, zéro intermédiaire.
Marché : restauration, retail, logistique, hôtellerie mondiale.

---

## Liens

- GitHub         : https://github.com/HexaNexus28/Shiftpass
- Explorer devnet  : https://explorer.solana.com/?cluster=devnet
- Faucet SOL       : https://faucet.solana.com
- Phantom          : https://phantom.app
- Memo Program ID  : MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
- Supabase project : https://supabase.com/dashboard/project/poknblfcdvnipoqfsrgr
