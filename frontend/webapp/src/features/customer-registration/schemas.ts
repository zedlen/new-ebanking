import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().min(1, 'Ingresa la calle'),
  extNum: z.string().min(1, 'Ingresa el número exterior'),
  intNum: z.string().optional(),
  zipcode: z.string().min(1, 'Ingresa el código postal'),
  colony: z.string().min(1, 'Ingresa la colonia'),
})

const documentsSchema = z
  .array(z.string())
  .min(1, 'Selecciona al menos un documento del expediente')

export const legalEntitySchema = addressSchema.extend({
  company: z.string().min(1, 'Ingresa la razón social'),
  rfc: z.string().min(1, 'Ingresa el RFC'),
  companyPhone: z.string().min(1, 'Ingresa el teléfono de la empresa'),
  personalPhone: z.string().min(1, 'Ingresa el teléfono de contacto'),
  contactName: z.string().min(1, 'Ingresa el nombre de contacto'),
  email: z.string().email('Ingresa un correo válido'),
  documents: documentsSchema,
})

export const naturalPersonSchema = addressSchema.extend({
  name: z.string().min(1, 'Ingresa el nombre'),
  rfc: z.string().min(1, 'Ingresa el RFC'),
  companyPhone: z.string().min(1, 'Ingresa el teléfono de la empresa'),
  personalPhone: z.string().min(1, 'Ingresa el teléfono de contacto'),
  contactName: z.string().min(1, 'Ingresa el nombre de contacto'),
  email: z.string().email('Ingresa un correo válido'),
  otherFile: z.string().optional(),
  documents: documentsSchema,
})

export type LegalEntityFormValues = z.infer<typeof legalEntitySchema>
export type NaturalPersonFormValues = z.infer<typeof naturalPersonSchema>
