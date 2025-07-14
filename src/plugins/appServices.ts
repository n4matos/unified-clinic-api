import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { ProfessionalService } from '../services/professional.service';
import { PatientService } from '../services/patient.service';
import { LoggerService } from '../services/logger.service';

export default fp(async (app: FastifyInstance) => {
  // Create logger service
  const loggerService = new LoggerService(app.log);

  // Instantiate Services
  const professionalService = new ProfessionalService();
  const patientService = new PatientService(loggerService);

  // Decorate Fastify instance with services
  app.decorate('loggerService', loggerService);
  app.decorate('professionalService', professionalService);
  app.decorate('patientService', patientService);
});
