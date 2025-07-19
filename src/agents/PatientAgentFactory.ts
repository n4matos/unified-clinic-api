import { PatientAgent } from './patient/PatientAgent';
import { CatalaoClinicPatientAgent } from './patient/implementations/CatalaoClinicPatientAgent';

export class PatientAgentFactory {
  static create(clinicId: string): PatientAgent {
    // Para Clínica Catalão, usamos sempre o mesmo agent
    // No futuro, pode ser expandido para outras clínicas
    switch (clinicId) {
      case 'catalao':
      default:
        return new CatalaoClinicPatientAgent();
    }
  }
}
