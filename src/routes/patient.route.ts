import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';

// Schemas for Registration Data Query (Consulta de dados cadastrais)
const RegistrationDataQueryBody = Type.Object({
  cpf: Type.Optional(Type.String()),
  cardNumber: Type.Optional(Type.String()),
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

const ErrorResponse = Type.Object({
  message: Type.String(),
});
type ErrorResponseType = Static<typeof ErrorResponse>;

// Schemas for Invoice Replacement (Segunda via de boleto)
const InvoiceReplacementBody = Type.Object({
  cpf: Type.String(),
  cardNumber: Type.String(),
});
type InvoiceReplacementBodyType = Static<typeof InvoiceReplacementBody>;

const InvoiceReplacementResponse = Type.Object({
  barcode: Type.String(),
  amount: Type.Number(),
  expirationDate: Type.String({ format: 'date-time' }), // ISO date string
  contractCode: Type.String(),
});
type InvoiceReplacementResponseType = Static<typeof InvoiceReplacementResponse>;

// Schemas for Guide Status (Status da guia)
const GuideStatusBody = Type.Object({
  authorizationPassword: Type.String(),
});
type GuideStatusBodyType = Static<typeof GuideStatusBody>;

const GuideStatusResponse = Type.Object({
  status: Type.Union([
    Type.Literal('Authorized'),
    Type.Literal('Under Audit'),
    Type.Literal('Denied'),
  ]),
});
type GuideStatusResponseType = Static<typeof GuideStatusResponse>;

export default fp(async (app: FastifyInstance) => {
  const patientService = app.patientService;

  // Endpoint: Registration Data Query (Consulta de dados cadastrais)
  app.post<{
    Body: RegistrationDataQueryBodyType;
    Reply: RegistrationDataQueryResponseType | ErrorResponseType;
  }>(
    '/patients/registration-data',
    {
      preHandler: [app.authenticate],
      schema: {
        body: RegistrationDataQueryBody,
        response: {
          200: RegistrationDataQueryResponse,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { cpf, cardNumber } = request.body;

      // Validação: pelo menos um dos campos deve ser informado
      if (!cpf && !cardNumber) {
        return reply.status(400).send({
          message: 'Pelo menos um dos campos deve ser informado: cpf ou cardNumber',
        });
      }

      const registrationData = await patientService.getRegistrationData(tenantId, cpf, cardNumber);
      return reply.send(registrationData);
    }
  );

  // Endpoint: Invoice Replacement (Segunda via de boleto)
  app.post<{
    Body: InvoiceReplacementBodyType;
    Reply: InvoiceReplacementResponseType;
  }>(
    '/patients/invoices',
    {
      preHandler: [app.authenticate],
      schema: {
        body: InvoiceReplacementBody,
        response: {
          200: InvoiceReplacementResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { cpf, cardNumber } = request.body;
      const invoice = await patientService.getInvoiceReplacement(tenantId, cpf, cardNumber);
      return reply.send(invoice);
    }
  );

  // Endpoint: Guide Status (Status da guia)
  app.post<{
    Body: GuideStatusBodyType;
    Reply: GuideStatusResponseType;
  }>(
    '/patients/guide/status',
    {
      preHandler: [app.authenticate],
      schema: {
        body: GuideStatusBody,
        response: {
          200: GuideStatusResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { authorizationPassword } = request.body;
      const status = await patientService.getGuideStatus(tenantId, authorizationPassword);
      return reply.send(status);
    }
  );
});
