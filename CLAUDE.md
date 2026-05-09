# ShiftPass — CLAUDE.md

ShiftPass = passeport professionnel portable pour travailleurs frontline, ancré sur Solana.
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
│   │   │   ├── Dashboard.tsx         # Tabs : attestations / employés / émettre + bouton lien employé
│   │   │   ├── IssueAttestation.tsx  # Formulaire Memo + antifraud checks + Supabase
│   │   │   └── AttestationList.tsx
│   │   ├── employee/
│   │   │   ├── Passport.tsx          # Profil portable + co-signature wallet
│   │   │   ├── WalletConnect.tsx     # Phantom connect/disconnect
│   │   │   └── AttestationCard.tsx   # Carte + badge verified + bouton Confirmer
│   │   └── shared/
│   │       ├── SkillBadge.tsx        # Badge coloré par niveau (SVG icons)
│   │       └── SolanaStatus.tsx      # Indicateur tx + lien Explorer
│   ├── hooks/
│   │   ├── useAuth.ts                # Supabase Auth (employer) — signUp avec siret
│   │   ├── useWallet.ts              # Wrapper @solana/wallet-adapter + signMessage
│   │   ├── useSolana.ts              # sendMemo() + loading/error state
│   │   └── useAttestations.ts        # CRUD Supabase + usePassportAttestations + useEmployees + useConfirmAttestation
│   ├── services/
│   │   ├── supabase.ts               # Client centralisé
│   │   ├── solana.ts                 # sendMemoTransaction() — Buffer importé depuis 'buffer'
│   │   ├── hash.ts                   # sha256 via crypto.subtle
│   │   ├── siret.ts                  # Vérification SIRET via API SIRENE gouvernementale
│   │   └── antifraud.ts              # detectCrossAttestation() + checkMinimumTenure()
│   ├── config/
│   │   └── constants.ts              # DEVNET_RPC, MEMO_PROGRAM_ID, SKILL_PRESETS
│   ├── types/
│   │   ├── attestation.ts            # Attestation, AttestationWithEmployer (+ employee_signature)
│   │   ├── employee.ts               # Employee (+ employment_start_date)
│   │   └── employer.ts               # Employer (+ siret)
│   ├── props/                        # Props interfaces — une par composant
│   │   ├── SkillBadge.props.ts
│   │   ├── SolanaStatus.props.ts
│   │   ├── AttestationCard.props.ts  # + onConfirm?, confirming?
│   │   ├── AttestationList.props.ts
│   │   ├── IssueAttestation.props.ts
│   │   ├── Dashboard.props.ts
│   │   └── Passport.props.ts
│   ├── pages/
│   │   ├── Landing.tsx               # Page d'accueil dark + features + steps
│   │   ├── EmployerDashboard.tsx     # Auth (+ SIRET KYB) + Dashboard
│   │   └── EmployeePassport.tsx      # EmployeePassport + EmployeeProfile
│   ├── polyfills.ts                  # Buffer global pour @solana/web3.js en browser
│   ├── main.tsx
│   ├── App.tsx                       # Routes + WalletProvider + ConnectionProvider
│   └── index.css                     # @tailwind base/components/utilities uniquement
├── scripts/
│   └── migrate.js                    # Node.js — applique supabase/migrations/*.sql
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql           # Tables + RLS policies
│       └── 002_anti_fraud.sql        # siret, employment_start_date, employee_signature
├── public/
│   ├── logo.svg                      # Shield + chain links + checkmark vert
│   └── banner.svg                    # Bannière produit (1200x630)
├── .env.local                        # VITE_SUPABASE_URL/KEY + SUPABASE_DB credentials
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
Employeur (manager)                         Employé
───────────────────                         ────────
Inscription email/password + SIRET          —
  → vérification SIRENE API (KYB)
  → 1 compte max par SIRET
Connexion email/password
Dashboard → Onglet Employés
Ajoute l'employé (nom + email + date d'embauche)
  → bouton copie lien /employee/:id   →    Reçoit lien /employee/:id
                                            Connecte wallet Phantom
                                            Wallet associé au profil
Onglet Émettre
Sélectionne employé
  → check tenure ≥ 14 jours
  → check cross-attestation (email)
  → check auto-attestation (wallet)
Sélectionne skill + niveau
sha256(payload)
sendMemoTransaction() ─────────────────→   Transaction Memo on-chain
supabase.insert(attestation, verified=false)
                                            Passeport : bouton « Confirmer »
                                            signMessage(payloadHash)
                                   ←────── employee_signature stockée en DB
                                            verified = true ✓
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

## BDD Supabase

```sql
-- 001_initial.sql
employers    (id uuid PK = auth.uid(), name, restaurant, email, created_at)
employees    (id uuid PK, name, wallet_address UNIQUE, email UNIQUE, created_at)
attestations (id uuid PK, employee_id FK, employer_id FK, skill, level CHECK,
              tx_signature, payload_hash, issued_at, verified)

-- 002_anti_fraud.sql
employers    + siret text
employees    + employment_start_date date NOT NULL DEFAULT CURRENT_DATE
attestations + employee_signature text

-- RLS policies
employers    : employer_own_select, employer_own_insert
employees    : employees_public_read, employees_authenticated_insert, employees_update_wallet
attestations : attestations_employer_insert, attestations_public_read, attestations_employee_confirm
```

**Appliquer :** `npm run migrate:dev` (lit `.env.local` ou `.env.dev`).

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

# Migration — Supabase > Settings > Database > Host (section "Connection parameters")
SUPABASE_DB_HOST=db.[ref].supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=[password_en_clair]
```

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

## Système anti-fraude

| Vecteur | Protection |
|---|---|
| Entreprise fictive | SIRET obligatoire, vérifié via `recherche-entreprises.api.gouv.fr` |
| Attestation immédiate après embauche | `employment_start_date` + tenure check ≥ 14 jours |
| Deux amis s'attestent mutuellement | Cross-attestation detection (email match entre employers et employees) |
| Auto-attestation (même wallet) | Comparaison `employee.wallet_address === employerWallet` au moment de l'émission |
| Faux consentement | L'employé doit signer `payloadHash` avec son wallet → `employee_signature` en DB |

---

## Règles projet

- Strict TypeScript — no any
- Supabase : toujours via `services/supabase.ts`
- Solana : toujours via `services/solana.ts` — jamais de `Connection` inline dans les composants
- Antifraud : toujours via `services/antifraud.ts` + `services/siret.ts`
- Buffer : importé depuis `'buffer'` dans solana.ts, polyfill global dans `polyfills.ts`
- Hooks : logique métier dans les hooks, composants = affichage uniquement
- Props : interfaces dans `src/props/ComponentName.props.ts`
- try/catch sur tout appel Supabase/Solana
- RLS activé sur toutes les tables
- Devnet uniquement



---

## Liens

- GitHub           : https://github.com/HexaNexus28/Shiftpass
- Production       : https://shiftpass-trust.vercel.app  ← mettre à jour
- Explorer devnet  : https://explorer.solana.com/?cluster=devnet
- Faucet SOL       : https://faucet.solana.com
- Phantom          : https://phantom.app
- Memo Program ID  : MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
- Supabase project : https://supabase.com/dashboard/project/poknblfcdvnipoqfsrgr
- SIRENE API       : https://recherche-entreprises.api.gouv.fr
