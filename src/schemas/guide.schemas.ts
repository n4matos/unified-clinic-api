import { Type, Static } from '@sinclair/typebox';
import { AddressSchema, PhoneSchema } from './common.schemas';

// Schema para resposta do guia médico
export const MedicalGuideResponseSchema = Type.Object(
  {
    name: Type.String(),
    specialty: Type.String(),
    address: AddressSchema,
    phone: PhoneSchema,
  },
  {
    $id: 'MedicalGuideResponseSchema',
    title: 'Medical Guide Response Schema',
    description: 'Response schema for medical guide data',
  }
);

// Schema para metadata de paginação
export const PaginationMetadataSchema = Type.Object(
  {
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  },
  {
    $id: 'PaginationMetadataSchema',
    title: 'Pagination Metadata Schema',
    description: 'Pagination information',
  }
);

// Schema para resposta paginada do guia médico
export const MedicalGuidePaginatedResponseSchema = Type.Object(
  {
    data: Type.Array(MedicalGuideResponseSchema),
    pagination: PaginationMetadataSchema,
  },
  {
    $id: 'MedicalGuidePaginatedResponseSchema',
    title: 'Medical Guide Paginated Response Schema',
    description: 'Paginated response schema for medical guide data',
  }
);

// Schema para query parameters com paginação
export const MedicalGuideQuerySchema = Type.Object(
  {
    networkOption: Type.String(),
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  },
  {
    $id: 'MedicalGuideQuerySchema',
    title: 'Medical Guide Query Schema',
    description: 'Query parameters for medical guide search',
  }
);

// Types
export type MedicalGuideResponseType = Static<typeof MedicalGuideResponseSchema>;
export type PaginationMetadataType = Static<typeof PaginationMetadataSchema>;
export type MedicalGuidePaginatedResponseType = Static<typeof MedicalGuidePaginatedResponseSchema>;
export type MedicalGuideQueryType = Static<typeof MedicalGuideQuerySchema>;
