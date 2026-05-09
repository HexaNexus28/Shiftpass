export interface SiretResult {
  exists: boolean;
  companyName?: string;
  active?: boolean;
  error?: string;
}

export async function verifySiret(siret: string): Promise<SiretResult> {
  const cleaned = siret.replace(/[\s-]/g, '');
  if (cleaned.length !== 14 || !/^\d{14}$/.test(cleaned)) {
    return { exists: false, error: 'Le SIRET doit contenir 14 chiffres.' };
  }

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleaned}&page=1&per_page=1`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error('API indisponible');
    const data = await res.json();
    if (!data.results?.length) return { exists: false, error: 'SIRET introuvable dans le registre SIRENE.' };

    const company = data.results[0];
    const active = company.etat_administratif === 'A';
    return {
      exists: true,
      companyName: company.nom_complet ?? company.siege?.denomination,
      active,
      error: active ? undefined : 'Cette entreprise est fermée ou radiée.',
    };
  } catch {
    return { exists: false, error: 'Impossible de vérifier le SIRET (service indisponible).' };
  }
}
