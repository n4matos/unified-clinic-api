import { Type } from '@sinclair/typebox';

/**
 * Schemas comuns utilizados em múltiplas rotas
 */

export const ErrorResponse = Type.Object({
  message: Type.String(),
}, {
  $id: 'ErrorResponse',
  title: 'Error Response',
  description: 'Standard error response format'
});

export const SuccessResponse = Type.Object({
  message: Type.String(),
  data: Type.Optional(Type.Unknown()),
}, {
  $id: 'SuccessResponse',
  title: 'Success Response',
  description: 'Standard success response format'
});

// Address schema reutilizável
export const AddressSchema = Type.Object({
  type: Type.String(),
  street: Type.String(),
  number: Type.String(),
  complement: Type.Optional(Type.String()),
  neighborhood: Type.String(),
  city: Type.String(),
  state: Type.String(),
  zipCode: Type.String(),
}, {
  $id: 'Address',
  title: 'Address',
  description: 'Address information'
});

// Phone schema reutilizável
export const PhoneSchema = Type.Object({
  type: Type.String(),
  number: Type.String(),
}, {
  $id: 'Phone',
  title: 'Phone',
  description: 'Phone number information'
});
