import { useState } from 'react';
import { Buffer } from 'buffer';
import { WalletConnect } from '../shared/WalletConnect';
import { AttestationCard } from './AttestationCard';
import { useWallet } from '../../hooks/useWallet';
import { useConfirmAttestation } from '../../hooks/useAttestations';
import type { PassportProps } from '../../props/Passport.props';

export function Passport({ employee, attestations, loading, onWalletLinked }: PassportProps) {
  const { connected, address, signMessage } = useWallet();
  const { confirmAttestation, confirming } = useConfirmAttestation();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [localVerified, setLocalVerified] = useState<Set<string>>(new Set());
  const isOwner = connected && address === employee.wallet_address;

  async function handleConfirm(attestationId: string, payloadHash: string) {
    setConfirmError(null);
    if (!signMessage) {
      setConfirmError('Ton wallet ne supporte pas la signature de messages.');
      return;
    }
    try {
      const hashBytes = Uint8Array.from(Buffer.from(payloadHash, 'hex'));
      const signatureBytes = await signMessage(hashBytes);
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64');
      const ok = await confirmAttestation(attestationId, signatureBase64);
      if (ok) setLocalVerified(prev => new Set(prev).add(attestationId));
      else setConfirmError('Erreur lors de la confirmation.');
    } catch {
      setConfirmError('Signature annulée ou échouée.');
    }
  }
  const needsWallet = !employee.wallet_address;

  const levelOrder = { 'Expert': 0, 'Certifié': 1, 'En formation': 2 } as const;
  const sorted = [...attestations].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold shadow-lg">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-sm text-gray-500">Passeport professionnel</p>
          </div>

          {employee.wallet_address ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-mono text-purple-600">
                {employee.wallet_address.slice(0, 6)}...{employee.wallet_address.slice(-6)}
              </span>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <p className="text-sm text-amber-700">
                Connecte ton wallet Phantom pour activer ton passeport et recevoir des attestations.
              </p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
              {connected && address && needsWallet && (
                <button
                  onClick={() => onWalletLinked(address)}
                  className="w-full py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Associer ce wallet à mon profil
                </button>
              )}
            </div>
          )}

          {isOwner && (
            <p className="text-xs text-gray-400">
              Partage cette page :{' '}
              <span className="font-mono">/passport/{employee.wallet_address}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Attestations ({attestations.length})
            </h2>
            <span className="text-xs text-gray-400">Vérifiables sur Solana devnet</span>
          </div>

          {confirmError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {confirmError}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Aucune attestation pour l'instant.
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(att => (
                <AttestationCard
                  key={att.id}
                  attestation={{ ...att, verified: att.verified || localVerified.has(att.id) }}
                  onConfirm={isOwner && !att.verified && !localVerified.has(att.id) ? handleConfirm : undefined}
                  confirming={confirming}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
