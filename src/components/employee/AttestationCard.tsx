import { SkillBadge } from '../shared/SkillBadge';
import { SolanaStatus } from '../shared/SolanaStatus';
import type { AttestationCardProps } from '../../props/AttestationCard.props';

export function AttestationCard({ attestation }: AttestationCardProps) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <SkillBadge skill={attestation.skill} level={attestation.level} />
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(attestation.issued_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      {attestation.employers && (
        <p className="text-xs text-gray-500">
          {attestation.employers.restaurant}
          {attestation.employers.name && ` · ${attestation.employers.name}`}
        </p>
      )}

      <SolanaStatus txSignature={attestation.tx_signature} />
    </div>
  );
}
