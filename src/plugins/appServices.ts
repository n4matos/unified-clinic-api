import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { ProfessionalRepository } from '../repositories/professional.repository';
import { PatientRepository } from '../repositories/patient.repository';

import { ProfessionalService } from '../services/professional.service';
import { PatientService } from '../services/patient.service';

declare module 'fastify' {
  interface FastifyInstance {
    professionalService: ProfessionalService;
    patientService: PatientService;
  }
}

export default fp(async (app: FastifyInstance) => {
  // Instantiate Repositories
  const professionalRepository = new ProfessionalRepository();
  const patientRepository = new PatientRepository();

  // Instantiate Services with their respective Repositories
  const professionalService = new ProfessionalService(professionalRepository);
  const patientService = new PatientService();

  // Decorate Fastify instance with services
  app.decorate('professionalService', professionalService);
  app.decorate('patientService', patientService);
});
