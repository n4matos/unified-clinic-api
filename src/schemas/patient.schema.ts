import { z } from 'zod';

export const patientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(), // Assuming YYYY-MM-DD format for now
});

export const patientUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(), // Assuming YYYY-MM-DD format for now
}).partial(); // All fields are optional for update
