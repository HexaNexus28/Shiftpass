import { useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { sendMemoTransaction } from '../services/solana';

export function useSolana() {
  const wallet = useSolanaWallet();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMemo(payload: Record<string, unknown>): Promise<string | null> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Wallet non connecté');
      return null;
    }
    setSending(true);
    setError(null);
    try {
      const sig = await sendMemoTransaction(
        { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction },
        payload,
      );
      return sig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction échouée');
      return null;
    } finally {
      setSending(false);
    }
  }

  return { sendMemo, sending, error };
}
