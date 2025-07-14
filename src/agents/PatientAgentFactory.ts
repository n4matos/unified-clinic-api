import { PatientAgent } from './patient/PatientAgent';
import { DefaultPatientAgent } from './patient/implementations/DefaultPatientAgent';

export class PatientAgentFactory {
  static create(tenantId: string): PatientAgent {
    // TODO: Implementar a lógica de seleção de agente com base no tenantId
    // Por enquanto, apenas a implementação padrão será utilizada.
    switch (tenantId) {
      // case 'tenant-a':
      //   return new TenantACustomPatientAgent();
      default:
        return new DefaultPatientAgent();
    }
  }
}
