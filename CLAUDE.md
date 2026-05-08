markdown# ShiftPass — CLAUDE.md

ShiftPass = passeport professionnel portable pour travailleurs frontline, ancré sur Solana.
Contexte : Dev3Pack Global Hackathon — 8-10 mai 2026. Soumission dimanche 8h00.
Stack : React 19 + Vite + TypeScript | Supabase | Solana devnet | @solana/web3.js
Langue : Français. Ce fichier est la source de vérité du projet.

---

## Problème adressé

Turnover 70-130%/an en restauration rapide. Un employé part → son historique disparaît.
Formations, compétences maîtrisées, reconnaissances reçues : tout appartient à l'employeur,
stocké dans ses outils, inaccessible au salarié. Le nouvel employeur repart de zéro.

ShiftPass : l'employé possède ses attestations on-chain. L'employeur les émet,
l'employé les conserve à vie dans son wallet. Portable, vérifiable, non falsifiable.

---

## Architecture
shiftpass/
├── frontend/     React 19 + Vite + TypeScript + TailwindCSS
├── backend/      Supabase (BDD + Auth + RLS)
├── CLAUDE.md     CE FICHIER
└── README.md     Pitch + démo instructions

### Flux principal
Employeur (manager)                Employé
───────────────────                ────────
Connexion email/password           Connecte wallet Phantom
Sélectionne un employé
Émet une attestation       →       Transaction Memo on-chain
Visible sur profil public
Vérifiable sur Explorer

### Stack Solana — Choix techniques
Réseau    : devnet (SOL factice gratuit via faucet)
SDK       : @solana/web3.js
Wallets   : @solana/wallet-adapter-react + phantom
Mécanisme : Memo Program (program natif Solana, ancre du texte on-chain)
Pas de Rust, pas de smart contract custom.
Pourquoi Memo et pas NFT/Anchor :
Anchor (Rust) = 3-5 jours pour un dev non-Solana → hors scope 2 jours
Metaplex NFT = complexité inutile pour un hackathon
Memo Program = natif, 0 déploiement, vérifiabilité publique identique
Résultat : 1 transaction Memo par attestation, payload JSON signé par le manager,
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

Le hash est aussi stocké en Supabase pour affichage rapide sans requêter la blockchain.

---

## BDD Supabase

```sql
CREATE TABLE employers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  restaurant text NOT NULL,
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE employees (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  wallet_address text UNIQUE,
  email          text UNIQUE NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE attestations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid REFERENCES employees(id),
  employer_id  uuid REFERENCES employers(id),
  skill        text NOT NULL,
  level        text NOT NULL CHECK (level IN ('En formation','Certifié','Expert')),
  tx_signature text,
  payload_hash text,
  issued_at    timestamptz DEFAULT now(),
  verified     boolean DEFAULT false
);

ALTER TABLE employers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employer_own" ON attestations
  USING (employer_id = auth.uid());

CREATE POLICY "public_read" ON attestations
  FOR SELECT USING (true);
```

---

## Structure frontend
frontend/src/
├── components/
│   ├── employer/
│   │   ├── Dashboard.tsx         # Liste employés + émettre attestation
│   │   ├── IssueAttestation.tsx  # Formulaire + envoi Memo
│   │   └── AttestationList.tsx
│   ├── employee/
│   │   ├── Passport.tsx          # Profil portable
│   │   ├── WalletConnect.tsx
│   │   └── AttestationCard.tsx   # Carte + lien Explorer
│   └── shared/
│       ├── SkillBadge.tsx
│       └── SolanaStatus.tsx
├── hooks/
│   ├── useWallet.ts              # Wrapper wallet-adapter
│   ├── useSolana.ts              # RPC devnet + memo
│   ├── useAttestations.ts        # CRUD Supabase
│   └── useAuth.ts
├── services/
│   ├── supabase.ts               # Client centralisé
│   ├── solana.ts                 # sendMemoTransaction()
│   └── hash.ts                   # sha256
├── config/constants.ts
├── types/
│   ├── attestation.ts
│   ├── employee.ts
│   └── employer.ts
├── pages/
│   ├── Landing.tsx
│   ├── EmployerDashboard.tsx
│   └── EmployeePassport.tsx      # /passport/:walletAddress — URL publique
└── App.tsx

---

## Code de référence

### services/solana.ts
```typescript
import {
  Connection, PublicKey, Transaction, TransactionInstruction
} from '@solana/web3.js';

export const DEVNET_RPC = 'https://api.devnet.solana.com';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
export const connection = new Connection(DEVNET_RPC, 'confirmed');

export async function sendMemoTransaction(
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  payload: Record<string, unknown>
): Promise<string> {
  const ix = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(payload), 'utf-8'),
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  const signed = await wallet.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
  // https://explorer.solana.com/tx/${sig}?cluster=devnet
}
```

### services/hash.ts
```typescript
export async function sha256(data: Record<string, unknown>): Promise<string> {
  const text = JSON.stringify(data, Object.keys(data).sort());
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### types/attestation.ts
```typescript
export type AttestationLevel = 'En formation' | 'Certifié' | 'Expert';

export interface Attestation {
  id: string;
  employee_id: string;
  employer_id: string;
  skill: string;
  level: AttestationLevel;
  tx_signature: string | null;
  payload_hash: string | null;
  issued_at: string;
  verified: boolean;
}
```

---

## Plan de build

### Vendredi soir — socle
- [ ] Init Vite + Tailwind + dépendances
- [ ] Supabase : tables + RLS
- [ ] Auth employer
- [ ] Wallet Phantom devnet connecté
- [ ] sendMemoTransaction fonctionnel → signature sur Explorer

### Samedi — MVP
- [ ] Dashboard employer complet
- [ ] Envoi attestation (Memo + Supabase)
- [ ] Page passeport employé
- [ ] URL publique /passport/:walletAddress
- [ ] UI responsive

### Dimanche matin — wrap
- [ ] Test end-to-end
- [ ] Déploiement Vercel
- [ ] Soumission 8h00

---

## Install

```bash
npm create vite@latest shiftpass -- --template react-ts
cd shiftpass && npm install
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
npm install @supabase/supabase-js
npm install @solana/web3.js
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-base
npm install react-router-dom
```

---

## .env.local

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SOLANA_RPC=https://api.devnet.solana.com
```

---

## Règles

- Strict TypeScript — no any
- Supabase : toujours via services/supabase.ts
- Solana : toujours via services/solana.ts — jamais de Connection inline dans les composants
- Hooks : logique métier dans les hooks, composants = affichage uniquement
- try/catch sur tout appel Supabase/Solana
- RLS activé sur toutes les tables
- Devnet uniquement pendant le hackathon

---

## Pitch (60s)

Problème : 130% de turnover en restauration. Un employé part, son historique disparaît.
Solution : attestations de compétences ancrées sur Solana — appartiennent à l'employé, pas à l'employeur.
Vérifiable par n'importe quel recruteur, en 2 secondes, sans intermédiaire.
Solana : $0.00025/transaction, 400ms de confirmation, explorateur public.
Marché : restauration, retail, logistique, hôtellerie mondiale.

---

## Liens

- Explorer devnet  : https://explorer.solana.com/?cluster=devnet
- Faucet SOL       : https://faucet.solana.com
- Phantom          : https://phantom.app
- Memo Program ID  : MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
- Wallet adapter   : https://github.com/solana-labs/wallet-adapter