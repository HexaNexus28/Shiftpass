import { Buffer } from 'buffer';
import {
  Connection, PublicKey, Transaction, TransactionInstruction,
} from '@solana/web3.js';
import { DEVNET_RPC, MEMO_PROGRAM_ID } from '../config/constants';

export const connection = new Connection(DEVNET_RPC, 'confirmed');
const memoProgramId = new PublicKey(MEMO_PROGRAM_ID);

export async function sendMemoTransaction(
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
  payload: Record<string, unknown>,
): Promise<string> {
  const ix = new TransactionInstruction({
    keys: [],
    programId: memoProgramId,
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
}
