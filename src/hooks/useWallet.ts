import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

export function useWallet() {
  const { publicKey, connected, connecting, disconnect, select, wallets, signTransaction, signMessage } = useSolanaWallet();

  return {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    wallets,
    signTransaction,
    signMessage,
    address: publicKey?.toBase58() ?? null,
  };
}
