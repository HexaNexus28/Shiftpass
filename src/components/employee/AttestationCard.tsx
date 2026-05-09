import { SkillBadge } from '../shared/SkillBadge';
import { SolanaStatus } from '../shared/SolanaStatus';
import type { AttestationCardProps } from '../../props/AttestationCard.props';

export function AttestationCard({ attestation, onConfirm, confirming }: AttestationCardProps) {
  return (
    <div className={`p-5 bg-white border rounded-2xl shadow-sm space-y-3 ${
      attestation.verified ? 'border-green-200' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <SkillBadge skill={attestation.skill} level={attestation.level} />
        <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
          <span className="text-xs text-gray-400">
            {new Date(attestation.issued_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {attestation.verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Confirmée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              En attente
            </span>
          )}
        </div>
      </div>

      {attestation.employers && (
        <p className="text-xs text-gray-500">
          {attestation.employers.restaurant}
          {attestation.employers.name && ` · ${attestation.employers.name}`}
        </p>
      )}

      <SolanaStatus txSignature={attestation.tx_signature} />

      {!attestation.verified && onConfirm && (
        <button
          onClick={() => onConfirm(attestation.id, attestation.payload_hash ?? '')}
          disabled={confirming}
          className="w-full py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {confirming ? 'Signature...' : 'Confirmer avec mon wallet'}
        </button>
      )}
    </div>
  );
}
