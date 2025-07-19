import { GuideAgent } from './guide/GuideAgent';
import { CatalaoClinicGuideAgent } from './guide/implementations/CatalaoClinicGuideAgent';

export class GuideAgentFactory {
  static create(clinicId: string): GuideAgent {
    // Para Clínica Catalão, usamos sempre o mesmo agent
    // No futuro, pode ser expandido para outras clínicas
    switch (clinicId) {
      case 'catalao':
      default:
        return new CatalaoClinicGuideAgent();
    }
  }
}
