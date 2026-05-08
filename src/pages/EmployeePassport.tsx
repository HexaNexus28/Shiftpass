import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Passport } from '../components/employee/Passport';
import { usePassportAttestations } from '../hooks/useAttestations';
import type { Employee } from '../types/employee';

export function EmployeePassport() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(true);
  const { attestations, loading: attestationsLoading } = usePassportAttestations(employee?.id ?? null);

  useEffect(() => {
    if (!walletAddress) return;
    lookupEmployee(walletAddress);
  }, [walletAddress]);

  async function lookupEmployee(wallet: string) {
    setLookupLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('wallet_address', wallet)
      .single();
    if (!data) setNotFound(true);
    else setEmployee(data);
    setLookupLoading(false);
  }

  if (lookupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Chargement du passeport...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Passeport introuvable pour ce wallet.</p>
        <Link to="/" className="text-sm text-purple-600 hover:text-purple-800">
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <Passport
      employee={employee}
      attestations={attestations}
      loading={attestationsLoading}
    />
  );
}

export function EmployeeProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const { attestations, loading: attestationsLoading } = usePassportAttestations(employee?.id ?? null);

  useEffect(() => {
    if (!employeeId) return;
    supabase.from('employees').select('*').eq('id', employeeId).single().then(({ data }) => {
      if (!data) setNotFound(true);
      else setEmployee(data);
      setLoading(false);
    });
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Profil introuvable.</p>
        <Link to="/" className="text-sm text-purple-600 hover:text-purple-800">← Accueil</Link>
      </div>
    );
  }

  return (
    <Passport
      employee={employee}
      attestations={attestations}
      loading={attestationsLoading}
    />
  );
}
