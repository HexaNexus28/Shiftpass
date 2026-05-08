import { SkillBadge } from '../shared/SkillBadge';
import { SolanaStatus } from '../shared/SolanaStatus';
import type { AttestationListProps } from '../../props/AttestationList.props';

export function AttestationList({ attestations }: AttestationListProps) {
  if (attestations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Aucune attestation émise pour l'instant.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {attestations.map(att => (
        <div key={att.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <SkillBadge skill={att.skill} level={att.level} />
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(att.issued_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="mt-3">
            <SolanaStatus txSignature={att.tx_signature} />
          </div>
        </div>
      ))}
    </div>
  );
}
