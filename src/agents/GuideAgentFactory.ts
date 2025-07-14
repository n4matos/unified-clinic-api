import { GuideAgent } from './guide/GuideAgent';
import { DefaultGuideAgent } from './guide/implementations/DefaultGuideAgent';

export class GuideAgentFactory {
  static create(tenantId: string): GuideAgent {
    // TODO: Implementar a lógica de seleção de agente com base no tenantId
    // Por enquanto, apenas a implementação padrão será utilizada.
    switch (tenantId) {
      // case 'tenant-a':
      //   return new TenantACustomGuideAgent();
      default:
        return new DefaultGuideAgent();
    }
  }
}
