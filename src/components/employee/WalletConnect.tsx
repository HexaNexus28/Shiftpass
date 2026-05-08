import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '../../hooks/useWallet';

export function WalletConnect() {
  const { connected, address, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-mono text-green-700">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Déconnecter
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="px-6 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
    >
      Connecter Phantom
    </button>
  );
}
