import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  // Request/Response schemas
  RegistrationDataQueryBody,
  RegistrationDataQueryResponse,
  InvoiceReplacementBody,
  InvoiceReplacementResponse,
  GuideStatusBody,
  GuideStatusResponse,
  ErrorResponse,
  // Types
  RegistrationDataQueryBodyType,
  RegistrationDataQueryResponseType,
  InvoiceReplacementBodyType,
  InvoiceReplacementResponseType,
  GuideStatusBodyType,
  GuideStatusResponseType,
  ErrorResponseType,
} from '../schemas';

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

      const registrationData = await patientService.getRegistrationData(
        tenantId,
        app,
        cpf,
        cardNumber
      );
      return reply.send(registrationData);
    }
  );

  // Endpoint: Invoice Replacement (Segunda via de boleto)
  app.post<{
    Body: InvoiceReplacementBodyType;
    Reply: InvoiceReplacementResponseType | ErrorResponseType;
  }>(
    '/patients/invoices',
    {
      preHandler: [app.authenticate],
      schema: {
        body: InvoiceReplacementBody,
        response: {
          200: InvoiceReplacementResponse,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { cpf, cardNumber } = request.body;
      const invoice = await patientService.getInvoiceReplacement(tenantId, app, cpf, cardNumber);
      return reply.send(invoice);
    }
  );

  // Endpoint: Guide Status (Status da guia)
  app.post<{
    Body: GuideStatusBodyType;
    Reply: GuideStatusResponseType | ErrorResponseType;
  }>(
    '/patients/guide/status',
    {
      preHandler: [app.authenticate],
      schema: {
        body: GuideStatusBody,
        response: {
          200: GuideStatusResponse,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const tenantId = request.tenantId!; // Extraído do JWT
      const { authorizationPassword } = request.body;
      const status = await patientService.getGuideStatus(tenantId, app, authorizationPassword);
      return reply.send(status);
    }
  );
});
