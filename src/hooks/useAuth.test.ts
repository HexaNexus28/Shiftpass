import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn();

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      signUp: (...args: unknown[]) => signUp(...args),
      signOut: () => signOut(),
      getSession: () => getSession(),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => onAuthStateChange(cb),
    },
  },
}));

const getEmployerById = vi.fn();
const createEmployer = vi.fn();

vi.mock('../services/employers', () => ({
  getEmployerById: (...args: unknown[]) => getEmployerById(...args),
  createEmployer: (...args: unknown[]) => createEmployer(...args),
}));

import { useAuth } from './useAuth';

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({ data: { session: null } });
  onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  signOut.mockResolvedValue(undefined);
});

describe('useAuth.signUp', () => {
  it('creates employer and returns null on success', async () => {
    signUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    createEmployer.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let err: string | null = '';
    await act(async () => {
      err = await result.current.signUp('a@b.c', 'pass1234', 'Name', 'Resto', '12345678901234');
    });

    expect(err).toBeNull();
    expect(createEmployer).toHaveBeenCalledWith('u1', 'Name', 'Resto', 'a@b.c', '12345678901234');
    expect(signOut).not.toHaveBeenCalled();
  });

  it('rolls back via signOut when createEmployer fails', async () => {
    signUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    createEmployer.mockResolvedValue('SIRET déjà utilisé');

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let err: string | null = '';
    await act(async () => {
      err = await result.current.signUp('a@b.c', 'pass1234', 'Name', 'Resto', '12345678901234');
    });

    expect(err).toBe('SIRET déjà utilisé');
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('returns auth error and skips createEmployer if signUp fails', async () => {
    signUp.mockResolvedValue({ data: { user: null }, error: { message: 'Email déjà pris' } });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let err: string | null = '';
    await act(async () => {
      err = await result.current.signUp('a@b.c', 'pass1234', 'Name', 'Resto', null);
    });

    expect(err).toBe('Email déjà pris');
    expect(createEmployer).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});

describe('useAuth.loadEmployer (orphan recovery)', () => {
  it('signs out and sets orphanAuth=true when employer not found', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'u-orphan' } } },
    });
    getEmployerById.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.orphanAuth).toBe(true));
    expect(result.current.employer).toBeNull();
  });

  it('loads employer and keeps orphanAuth=false when found', async () => {
    const employer = { id: 'u1', name: 'X', restaurant: 'Y', email: 'a@b.c', siret: null, created_at: '' };
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    });
    getEmployerById.mockResolvedValue(employer);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.employer).toEqual(employer));
    expect(result.current.orphanAuth).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });
});
