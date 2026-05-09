import { supabase } from './supabase';
import type { Employee } from '../types/employee';

type EmployeeSummary = Pick<Employee, 'id' | 'name' | 'email' | 'wallet_address' | 'employment_start_date'>;

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data } = await supabase.from('employees').select('*').eq('id', id).single();
  return data;
}

export async function getEmployeeByWallet(wallet: string): Promise<Employee | null> {
  const { data } = await supabase.from('employees').select('*').eq('wallet_address', wallet).single();
  return data;
}

export async function listEmployees(): Promise<EmployeeSummary[]> {
  const { data } = await supabase
    .from('employees')
    .select('id, name, email, wallet_address, employment_start_date')
    .order('name');
  return data ?? [];
}

export async function createEmployee(
  name: string,
  email: string,
  employmentStartDate: string,
): Promise<string | null> {
  const { error } = await supabase
    .from('employees')
    .insert({ name, email, employment_start_date: employmentStartDate });
  return error?.message ?? null;
}

export async function setEmployeeWallet(id: string, walletAddress: string): Promise<string | null> {
  const { error } = await supabase.from('employees').update({ wallet_address: walletAddress }).eq('id', id);
  return error?.message ?? null;
}
