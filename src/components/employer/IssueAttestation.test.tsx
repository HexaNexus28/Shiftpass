import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const sendMemo = vi.fn();
const createAttestation = vi.fn();

vi.mock('../../hooks/useSolana', () => ({
  useSolana: () => ({ sendMemo, sending: false, error: null }),
}));

vi.mock('../../hooks/useWallet', () => ({
  useWallet: () => ({ address: 'EmpLoyERwallet1111111111111111111111111111' }),
}));

vi.mock('../../hooks/useAttestations', () => ({
  useEmployees: () => ({
    employees: [{
      id: 'emp-1',
      name: 'Alice',
      email: 'alice@test.fr',
      wallet_address: 'AliceWallet22222222222222222222222222222222',
      employment_start_date: daysAgo(30),
    }],
  }),
  useAttestations: () => ({ createAttestation }),
}));

vi.mock('../../services/antifraud', () => ({
  detectCrossAttestation: vi.fn().mockResolvedValue({ isSuspect: false }),
  checkMinimumTenure: () => ({ allowed: true, daysRemaining: 0 }),
}));

import { IssueAttestation } from './IssueAttestation';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

async function fillAndSubmit() {
  const onSuccess = vi.fn();
  render(
    <IssueAttestation
      employerId="emr-1"
      restaurantName="Resto Test"
      onSuccess={onSuccess}
    />
  );

  fireEvent.change(screen.getByLabelText(/Employé/i), { target: { value: 'emp-1' } });
  fireEvent.change(screen.getByLabelText(/Compétence/i), { target: { value: 'Caisse' } });
  await waitFor(() => expect(screen.getByRole('button', { name: /Émettre/i })).not.toBeDisabled());
  fireEvent.click(screen.getByRole('button', { name: /Émettre/i }));

  return { onSuccess };
}

describe('IssueAttestation — sendMemo null guard (Bug 1)', () => {
  it('does NOT insert in DB when sendMemo returns null', async () => {
    sendMemo.mockResolvedValue(null);

    await fillAndSubmit();

    await waitFor(() => expect(sendMemo).toHaveBeenCalledTimes(1));
    expect(createAttestation).not.toHaveBeenCalled();
  });

  it('inserts in DB with tx_signature when sendMemo succeeds', async () => {
    sendMemo.mockResolvedValue('5Tx5IGsoLanaSiGNature');
    createAttestation.mockResolvedValue({ data: { id: 'att-1' }, error: null });

    await fillAndSubmit();

    await waitFor(() => expect(createAttestation).toHaveBeenCalledTimes(1));
    expect(createAttestation).toHaveBeenCalledWith(expect.objectContaining({
      employee_id: 'emp-1',
      employer_id: 'emr-1',
      skill: 'Caisse',
      tx_signature: '5Tx5IGsoLanaSiGNature',
    }));
  });
});
