import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import { ProfessionalService } from '../services/professional.service';
import { RegistrationDataService } from '../services/registration_data.service';
import { Professional, RegistrationData } from '../types/app.d';

// Schemas for Medical Invoice
const MedicalInvoiceQuery = Type.Object({
  networkOption: Type.String(),
});
type MedicalInvoiceQueryType = Static<typeof MedicalInvoiceQuery>;

const MedicalInvoiceResponse = Type.Object({
  name: Type.String(),
  specialty: Type.String(),
  address: Type.String(),
  phone: Type.String(),
});
type MedicalInvoiceResponseType = Static<typeof MedicalInvoiceResponse>;

// Schemas for Registration Data Query
const RegistrationDataQueryBody = Type.Object({
  cpf: Type.String(),
  cardNumber: Type.String(),
});
type RegistrationDataQueryBodyType = Static<typeof RegistrationDataQueryBody>;

const AddressSchema = Type.Object({
  type: Type.String(),
  street: Type.String(),
  number: Type.String(),
  complement: Type.Optional(Type.String()),
  neighborhood: Type.String(),
  city: Type.String(),
  state: Type.String(),
  zipCode: Type.String(),
});

const PhoneSchema = Type.Object({
  type: Type.String(),
  number: Type.String(),
});

const RegistrationDataQueryResponse = Type.Object({
  activeAddress: Type.Optional(AddressSchema),
  activePhones: Type.Array(PhoneSchema),
  email: Type.Optional(Type.String()),
});
type RegistrationDataQueryResponseType = Static<typeof RegistrationDataQueryResponse>;

declare module 'fastify' {
  interface FastifyInstance {
    professionalService: ProfessionalService;
    registrationDataService: RegistrationDataService;
  }
}

export default fp(async (app: FastifyInstance) => {
  const professionalService = app.professionalService;
  const registrationDataService = app.registrationDataService;

  // Endpoint: Medical Invoice
  app.get<{ Querystring: MedicalInvoiceQueryType; Reply: MedicalInvoiceResponseType[] }>(
    '/medical-invoice',
    {
      preHandler: [app.authenticate],
      schema: {
        querystring: MedicalInvoiceQuery,
        response: {
          200: Type.Array(MedicalInvoiceResponse),
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { networkOption } = request.query;
      const professionals = await professionalService.getMedicalInvoice(tenantId, networkOption);
      return reply.send(professionals);
    }
  );

  // Endpoint: Registration data query
  app.post<{ Body: RegistrationDataQueryBodyType; Reply: RegistrationDataQueryResponseType }>(
    '/registration-data',
    {
      preHandler: [app.authenticate],
      schema: {
        body: RegistrationDataQueryBody,
        response: {
          200: RegistrationDataQueryResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { cpf, cardNumber } = request.body;
      const registrationData = await registrationDataService.getRegistrationData(
        tenantId,
        cpf,
        cardNumber
      );
      return reply.send(registrationData);
    }
  );
});
