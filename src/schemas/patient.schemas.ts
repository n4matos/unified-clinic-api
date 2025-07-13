import { Type, Static } from '@sinclair/typebox';
import { AddressSchema, PhoneSchema, ErrorResponse } from './common.schemas';

/**
 * Schemas específicos para funcionalidades de paciente
 */

// ===== Registration Data Query Schemas =====
export const RegistrationDataQueryBody = Type.Object({
  cpf: Type.Optional(Type.String()),
  cardNumber: Type.Optional(Type.String()),
}, {
  $id: 'RegistrationDataQueryBody',
  title: 'Registration Data Query Body',
  description: 'Request body for querying patient registration data'
});

export const RegistrationDataQueryResponse = Type.Object({
  activeAddress: Type.Optional(AddressSchema),
  activePhones: Type.Array(PhoneSchema),
  email: Type.Optional(Type.String()),
}, {
  $id: 'RegistrationDataQueryResponse',
  title: 'Registration Data Query Response',
  description: 'Response containing patient registration data'
});

// ===== Invoice Replacement Schemas =====
export const InvoiceReplacementBody = Type.Object({
  cpf: Type.String(),
  cardNumber: Type.String(),
}, {
  $id: 'InvoiceReplacementBody',
  title: 'Invoice Replacement Body',
  description: 'Request body for generating invoice replacement'
});

export const InvoiceReplacementResponse = Type.Object({
  barcode: Type.String(),
  amount: Type.Number(),
  expirationDate: Type.String({ format: 'date-time' }),
  contractCode: Type.String(),
}, {
  $id: 'InvoiceReplacementResponse',
  title: 'Invoice Replacement Response',
  description: 'Response containing invoice replacement data'
});

// ===== Guide Status Schemas =====
export const GuideStatusBody = Type.Object({
  authorizationPassword: Type.String(),
}, {
  $id: 'GuideStatusBody',
  title: 'Guide Status Body',
  description: 'Request body for checking guide status'
});

export const GuideStatusResponse = Type.Object({
  status: Type.Union([
    Type.Literal('Authorized'),
    Type.Literal('Under Audit'),
    Type.Literal('Denied'),
  ]),
}, {
  $id: 'GuideStatusResponse',
  title: 'Guide Status Response',
  description: 'Response containing guide authorization status'
});

// ===== Type Exports =====
export type RegistrationDataQueryBodyType = Static<typeof RegistrationDataQueryBody>;
export type RegistrationDataQueryResponseType = Static<typeof RegistrationDataQueryResponse>;
export type InvoiceReplacementBodyType = Static<typeof InvoiceReplacementBody>;
export type InvoiceReplacementResponseType = Static<typeof InvoiceReplacementResponse>;
export type GuideStatusBodyType = Static<typeof GuideStatusBody>;
export type GuideStatusResponseType = Static<typeof GuideStatusResponse>;
export type ErrorResponseType = Static<typeof ErrorResponse>;
