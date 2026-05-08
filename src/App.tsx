import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { DEVNET_RPC } from './config/constants';
import { Landing } from './pages/Landing';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { EmployeePassport, EmployeeProfile } from './pages/EmployeePassport';

import '@solana/wallet-adapter-react-ui/styles.css';

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={DEVNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/passport/:walletAddress" element={<EmployeePassport />} />
              <Route path="/employee/:employeeId" element={<EmployeeProfile />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
