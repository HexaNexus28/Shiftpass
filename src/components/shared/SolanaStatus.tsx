import type { SolanaStatusProps } from '../../props/SolanaStatus.props';

export function SolanaStatus({ txSignature, loading }: SolanaStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
        Ancrage on-chain en cours...
      </div>
    );
  }
  if (!txSignature) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
      <a
        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-purple-600 hover:text-purple-800 underline font-mono truncate max-w-xs"
      >
        {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
      </a>
    </div>
  );
}
