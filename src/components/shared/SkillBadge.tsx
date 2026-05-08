import type { SkillBadgeProps } from '../../props/SkillBadge.props';
import type { AttestationLevel } from '../../types/attestation';

const levelStyles: Record<AttestationLevel, string> = {
  'En formation': 'bg-amber-100 text-amber-800 border-amber-200',
  'Certifié': 'bg-blue-100 text-blue-800 border-blue-200',
  'Expert': 'bg-purple-100 text-purple-800 border-purple-200',
};

const levelIcons: Record<AttestationLevel, string> = {
  'En formation': '📚',
  'Certifié': '✓',
  'Expert': '⭐',
};

export function SkillBadge({ skill, level }: SkillBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${levelStyles[level]}`}>
      <span>{levelIcons[level]}</span>
      <span>{skill}</span>
      <span className="opacity-60">·</span>
      <span>{level}</span>
    </span>
  );
}
