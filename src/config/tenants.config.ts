interface TenantConfig {
  id: string;
  name: string;
  type: 'postgres' | 'mysql';
  connEnv: string;
  active: boolean;
}

export const TENANT_CONFIGS: TenantConfig[] = [
  {
    id: '1',
    name: 'Clínica São Paulo',
    type: 'postgres',
    connEnv: 'TENANT_1_PG_CONN',
    active: true,
  },
  {
    id: '2',
    name: 'Clínica Rio de Janeiro',
    type: 'mysql',
    connEnv: 'TENANT_2_MYSQL_CONN',
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
