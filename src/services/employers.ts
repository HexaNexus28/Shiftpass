import { supabase } from './supabase';
import type { Employer } from '../types/employer';

export async function getEmployerById(id: string): Promise<Employer | null> {
  const { data } = await supabase.from('employers').select('*').eq('id', id).single();
  return data;
}

export async function createEmployer(
  id: string,
  name: string,
  restaurant: string,
  email: string,
): Promise<string | null> {
  const { error } = await supabase.from('employers').insert({ id, name, restaurant, email });
  return error?.message ?? null;
}
