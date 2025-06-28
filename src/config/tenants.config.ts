interface TenantConfig {
  id: string;
  name: string;
  type: 'postgres' | 'mysql';
  conn: string;
  active: boolean;
}

export const TENANT_CONFIGS: TenantConfig[] = [
  {
    id: '1',
    name: 'Clínica São Paulo',
    type: 'postgres',
    conn: 'postgres://user:password@db_postgres:5432/unified_clinic',
    active: true,
  },
  {
    id: '2',
    name: 'Clínica Rio de Janeiro',
    type: 'mysql',
    conn: 'mysql://user:password@db_mysql:3306/unified_clinic_mysql',
    active: true,
  },
];

// Função para obter apenas clínicas ativas
export function getActiveTenants(): TenantConfig[] {
  return TENANT_CONFIGS.filter((tenant) => tenant.active);
}

// Função para obter configuração de uma clínica específica
export function getTenantConfig(clinicId: string): TenantConfig | undefined {
  return TENANT_CONFIGS.find((tenant) => tenant.id === clinicId && tenant.active);
}

// Função para validar se uma clínica existe e está ativa
export function isValidTenant(clinicId: string): boolean {
  return TENANT_CONFIGS.some((tenant) => tenant.id === clinicId && tenant.active);
}
