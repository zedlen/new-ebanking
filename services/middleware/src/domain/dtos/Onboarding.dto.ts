import { z } from 'zod';

// Tipos de documentos requeridos
export const DocumentTypeSchema = z.enum([
  'INE',
  'ACTA_CONSTITUTIVA',
  'COMPROBANTE_DOMICILIO',
  'CONSTANCIA_FISCAL',
  'PODERES',
  'IDENTIFICACION_REPRESENTANTE',
  'OTROS',
]);

// Schema para dirección
export const AddressSchema = z.object({
  street: z
    .string()
    .min(3, 'La calle debe tener al menos 3 caracteres')
    .max(200, 'La calle no puede tener más de 200 caracteres'),
  num_ext: z
    .string()
    .max(20, 'El número exterior no puede tener más de 20 caracteres')
    .optional(),
  num_int: z
    .string()
    .max(20, 'El número interior no puede tener más de 20 caracteres')
    .optional(),
  reference: z
    .string()
    .max(200, 'La referencia no puede tener más de 200 caracteres')
    .optional(),
  neighborhood: z
    .string()
    .min(3, 'La colonia debe tener al menos 3 caracteres')
    .max(100, 'La colonia no puede tener más de 100 caracteres'),
  city: z
    .string()
    .min(3, 'La ciudad debe tener al menos 3 caracteres')
    .max(100, 'La ciudad no puede tener más de 100 caracteres'),
  estate: z
    .string()
    .min(3, 'El estado debe tener al menos 3 caracteres')
    .max(100, 'El estado no puede tener más de 100 caracteres'),
  cp: z
    .string()
    .regex(/^[0-9]{5}$/, 'El código postal debe tener exactamente 5 dígitos'),
});

// Schema principal para el formulario de onboarding
export const OnboardingFormSchema = z.object({
  company_name: z
    .string()
    .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
    .max(200, 'El nombre de la empresa no puede tener más de 200 caracteres'),
  rfc: z
    .string()
    .regex(
      /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/,
      'RFC inválido',
    ),
  economic_activity_id: z
    .string()
    .min(1, 'La actividad económica es requerida'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'El teléfono debe tener exactamente 10 dígitos'),
  email: z.string().email('Email inválido'),
  address: AddressSchema,
  document_types: z.array(z.string()).optional(),
  document_descriptions: z.array(z.string()).optional(),
  terms_accepted: z.boolean(),
  digital_signature: z.string().min(3, 'La firma digital es requerida'),
  app: z.string(),
});

// Schema para actividad económica
export const EconomicActivitySchema = z.object({
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede tener más de 50 caracteres'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede tener más de 200 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  category: z
    .string()
    .max(100, 'La categoría no puede tener más de 100 caracteres')
    .optional(),
  subcategory: z
    .string()
    .max(100, 'La subcategoría no puede tener más de 100 caracteres')
    .optional(),
});

// Schema para actualizar estado de onboarding
export const UpdateOnboardingStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    message: 'Estado inválido',
  }),
  rejection_reason: z
    .string()
    .max(500, 'La razón de rechazo no puede tener más de 500 caracteres')
    .optional(),
});

// Schema para envío de email de actualización de documentos
export const SendUpdateDocumentsEmailSchema = z.object({
  rejection_reason: z
    .string()
    .max(500, 'La razón de rechazo no puede tener más de 500 caracteres')
    .optional(),
});

// Schema para metadatos de documentos
export const DocumentMetadataSchema = z.object({
  type: DocumentTypeSchema,
  description: z
    .string()
    .max(200, 'La descripción no puede tener más de 200 caracteres')
    .optional(),
  originalName: z.string().min(1, 'El nombre original es requerido'),
  fileSize: z.string().min(1, 'El tamaño del archivo es requerido'),
  mimeType: z.string().min(1, 'El tipo MIME es requerido'),
  uploadedAt: z.string().min(1, 'La fecha de subida es requerida'),
});

// Tipos derivados de los schemas
export type OnboardingFormDTO = z.infer<typeof OnboardingFormSchema>;
export type EconomicActivityDTO = z.infer<typeof EconomicActivitySchema>;
export type UpdateOnboardingStatusDTO = z.infer<
  typeof UpdateOnboardingStatusSchema
>;
export type SendUpdateDocumentsEmailDTO = z.infer<
  typeof SendUpdateDocumentsEmailSchema
>;
export type DocumentMetadataDTO = z.infer<typeof DocumentMetadataSchema>;
export type AddressDTO = z.infer<typeof AddressSchema>;

// Tipos para compatibilidad
export type OnboardingFormDTOType = OnboardingFormDTO;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type DocumentMetadata = DocumentMetadataDTO;
