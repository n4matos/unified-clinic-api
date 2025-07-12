import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import { RegistrationDataService } from '../services/registration_data.service';
import { InvoiceService } from '../services/invoice.service';
import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';

// Schemas for Registration Data Query (Consulta de dados cadastrais)
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
  const registrationDataService = app.registrationDataService;
  const invoiceService = app.invoiceService;

  // Endpoint: Registration Data Query (Consulta de dados cadastrais)
  app.post<{ Body: RegistrationDataQueryBodyType; Reply: RegistrationDataQueryResponseType }>(
    '/patients/registration-data',
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
      const invoice = await invoiceService.getReplacementInvoice(tenantId, cpf, cardNumber);
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
      const status = await invoiceService.getInvoiceStatus(tenantId, authorizationPassword);
      return reply.send(status);
    }
  );
});
