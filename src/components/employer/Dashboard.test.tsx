import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const useWalletMock = vi.fn();

vi.mock('../../hooks/useWallet', () => ({
  useWallet: () => useWalletMock(),
}));

vi.mock('../../hooks/useAttestations', () => ({
  useAttestations: () => ({ attestations: [], loading: false, refetch: vi.fn() }),
  useEmployees: () => ({ employees: [], addEmployee: vi.fn() }),
}));

vi.mock('../shared/WalletConnect', () => ({
  WalletConnect: () => <button>Connecter Phantom</button>,
}));

vi.mock('./IssueAttestation', () => ({
  IssueAttestation: () => <div data-testid="issue-attestation-form" />,
}));

vi.mock('./AttestationList', () => ({
  AttestationList: () => <div data-testid="attestation-list" />,
}));

import { Dashboard } from './Dashboard';

const employer = {
  id: 'emr-1',
  name: 'Manager',
  restaurant: 'Resto Test',
  email: 'm@test.fr',
  siret: '12345678901234',
  created_at: '',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard — wallet states (Bug 2)', () => {
  it('shows "Connecter Phantom" CTA when wallet is not connected', () => {
    useWalletMock.mockReturnValue({ connected: false });
    render(<Dashboard employer={employer} onSignOut={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: /Connecter Phantom/i }).length).toBeGreaterThan(0);
  });

  it('blocks "Émettre" tab when wallet is not connected', () => {
    useWalletMock.mockReturnValue({ connected: false });
    render(<Dashboard employer={employer} onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Émettre/i }));

    expect(screen.queryByTestId('issue-attestation-form')).not.toBeInTheDocument();
    expect(screen.getByText(/Connectez votre wallet Phantom/i)).toBeInTheDocument();
  });

  it('renders IssueAttestation when wallet is connected and "Émettre" is selected', () => {
    useWalletMock.mockReturnValue({ connected: true });
    render(<Dashboard employer={employer} onSignOut={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Émettre/i }));

    expect(screen.getByTestId('issue-attestation-form')).toBeInTheDocument();
    expect(screen.queryByText(/Connectez votre wallet Phantom/i)).not.toBeInTheDocument();
  });
});
