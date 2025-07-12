import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { InvoiceRepository } from '../repositories/invoice.repository';
import { ProfessionalRepository } from '../repositories/professional.repository';
import { RegistrationDataRepository } from '../repositories/registration_data.repository';

import { InvoiceService } from '../services/invoice.service';
import { ProfessionalService } from '../services/professional.service';
import { RegistrationDataService } from '../services/registration_data.service';

declare module 'fastify' {
  interface FastifyInstance {
    invoiceService: InvoiceService;
    professionalService: ProfessionalService;
    registrationDataService: RegistrationDataService;
  }
}

export default fp(async (app: FastifyInstance) => {
  // Instantiate Repositories
  const invoiceRepository = new InvoiceRepository();
  const professionalRepository = new ProfessionalRepository();
  const registrationDataRepository = new RegistrationDataRepository();

  // Instantiate Services with their respective Repositories
  const invoiceService = new InvoiceService(invoiceRepository);
  const professionalService = new ProfessionalService(professionalRepository);
  const registrationDataService = new RegistrationDataService(registrationDataRepository);

  // Decorate Fastify instance with services
  app.decorate('invoiceService', invoiceService);
  app.decorate('professionalService', professionalService);
  app.decorate('registrationDataService', registrationDataService);
});
