import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { getEmployerById, createEmployer } from '../services/employers';
import type { Employer } from '../types/employer';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [orphanAuth, setOrphanAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEmployer(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEmployer(session.user.id);
      } else {
        setEmployer(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadEmployer(userId: string) {
    const emp = await getEmployerById(userId);
    if (!emp) {
      setOrphanAuth(true);
      await supabase.auth.signOut();
      return;
    }
    setEmployer(emp);
    setLoading(false);
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    setOrphanAuth(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    restaurant: string,
    siret: string | null,
  ): Promise<string | null> {
    setOrphanAuth(false);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Erreur lors de la création du compte';
    const employerError = await createEmployer(data.user.id, name, restaurant, email, siret);
    if (employerError) {
      await supabase.auth.signOut();
      return employerError;
    }
    return null;
  }

  async function signOut(): Promise<void> {
    setOrphanAuth(false);
    await supabase.auth.signOut();
  }

  return { user, employer, loading, orphanAuth, signIn, signUp, signOut };
}
