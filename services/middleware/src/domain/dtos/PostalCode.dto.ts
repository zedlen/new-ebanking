import { z } from 'zod';

// Esquema para un código postal
export const PostalCodeSchema = z.object({
  postal_code: z
    .string()
    .length(5)
    .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
  colony: z.string().min(1, 'La colonia es requerida'),
  municipality: z.string().min(1, 'El municipio es requerido'),
  state: z.string().min(1, 'El estado es requerido'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state_code: z.string().min(1, 'El código de estado es requerido'),
  municipality_code: z.string().min(1, 'El código de municipio es requerido'),
  settlement_type: z.string().min(1, 'El tipo de asentamiento es requerido'),
  zone_type: z.string().min(1, 'El tipo de zona es requerido'),
  active: z.boolean().default(true),
  usage_count: z.number().default(0),
  last_used: z.date().optional(),
});

// Esquema para búsqueda de códigos postales
export const PostalCodeSearchSchema = z.object({
  query: z.string().min(1, 'La consulta es requerida'),
  limit: z.number().min(1).max(50).default(10),
});

// Esquema para validación de código postal
export const PostalCodeValidationSchema = z.object({
  postal_code: z
    .string()
    .length(5)
    .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
});

// Tipos TypeScript
export type PostalCode = z.infer<typeof PostalCodeSchema>;
export type PostalCodeSearch = z.infer<typeof PostalCodeSearchSchema>;
export type PostalCodeValidation = z.infer<typeof PostalCodeValidationSchema>;

// Respuesta de búsqueda
export interface PostalCodeSearchResponse {
  results: PostalCode[];
  total: number;
  hasMore: boolean;
}

// Respuesta de validación
export interface PostalCodeValidationResponse {
  isValid: boolean;
  postalCode?: PostalCode;
  suggestions?: PostalCode[];
}
