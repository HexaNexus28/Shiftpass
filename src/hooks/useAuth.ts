import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { getEmployerById, createEmployer } from '../services/employers';
import type { Employer } from '../types/employer';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

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
    setEmployer(await getEmployerById(userId));
    setLoading(false);
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    restaurant: string,
  ): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.user) return 'Erreur lors de la création du compte';
    return createEmployer(data.user.id, name, restaurant, email);
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  return { user, employer, loading, signIn, signUp, signOut };
}
