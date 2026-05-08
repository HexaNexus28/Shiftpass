import { useParams, Link, useNavigate } from 'react-router-dom';
import { Passport } from '../components/employee/Passport';
import { usePassportAttestations, useEmployee, useEmployeeByWallet } from '../hooks/useAttestations';

export function EmployeePassport() {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const { employee, loading, notFound } = useEmployeeByWallet(walletAddress);
  const { attestations, loading: attestationsLoading } = usePassportAttestations(employee?.id ?? null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Chargement du passeport...</div>
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Passeport introuvable pour ce wallet.</p>
        <Link to="/" className="text-sm text-purple-600 hover:text-purple-800">← Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <Passport
      employee={employee}
      attestations={attestations}
      loading={attestationsLoading}
      onWalletLinked={() => {}}
    />
  );
}

export function EmployeeProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employee, loading, notFound, updateWalletAddress } = useEmployee(employeeId ?? null);
  const { attestations, loading: attestationsLoading } = usePassportAttestations(employee?.id ?? null);

  async function handleWalletLinked(walletAddress: string) {
    const err = await updateWalletAddress(walletAddress);
    if (!err) navigate(`/passport/${walletAddress}`);
  }

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
      onWalletLinked={handleWalletLinked}
    />
  );
}
