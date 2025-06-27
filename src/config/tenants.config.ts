interface TenantConfig {
  id: string;
  name: string;
  type: 'postgres' | 'mysql';
  conn: string;
  active: boolean;
}

export const TENANT_CONFIGS: TenantConfig[] = [
  {
    id: 'clinic-1',
    name: 'Clínica São Paulo',
    type: (process.env.DB_TYPE_CLINIC1 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC1 || 'postgres://user:password@localhost:5432/clinic1',
    active: true,
  },
  {
    id: 'clinic-2',
    name: 'Clínica Rio de Janeiro',
    type: (process.env.DB_TYPE_CLINIC2 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC2 || 'postgres://user:password@localhost:5432/clinic2',
    active: true,
  },
  {
    id: 'clinic-3',
    name: 'Clínica Belo Horizonte',
    type: (process.env.DB_TYPE_CLINIC3 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC3 || 'postgres://user:password@localhost:5432/clinic3',
    active: !!process.env.DB_CLINIC3, // Só ativa se tiver variável de ambiente
  },
  {
    id: 'clinic-4',
    name: 'Clínica Salvador',
    type: (process.env.DB_TYPE_CLINIC4 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC4 || 'postgres://user:password@localhost:5432/clinic4',
    active: !!process.env.DB_CLINIC4,
  },
  {
    id: 'clinic-5',
    name: 'Clínica Brasília',
    type: (process.env.DB_TYPE_CLINIC5 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC5 || 'postgres://user:password@localhost:5432/clinic5',
    active: !!process.env.DB_CLINIC5,
  },
  {
    id: 'clinic-6',
    name: 'Clínica Recife',
    type: (process.env.DB_TYPE_CLINIC6 as 'postgres' | 'mysql') || 'postgres',
    conn: process.env.DB_CLINIC6 || 'postgres://user:password@localhost:5432/clinic6',
    active: !!process.env.DB_CLINIC6,
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
