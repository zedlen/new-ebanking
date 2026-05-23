import { z } from 'zod';
import { AddressDTO } from './Address.dto';

export const CreateCustomerSchema = z
  .object({
    rfc: z
      .string()
      .regex(/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/),
    company_name: z.string().optional(),
    name: z.string().optional(),
    ap_paterno: z.string().optional(),
    ap_materno: z.string().optional(),
    taxpayer_type_id: z.number().min(1).max(2),
    address: AddressDTO.optional(),
    contact_name: z.string().min(3),
    contact_email: z.email(),
    contact_tel: z.string().regex(/[0-9]{10}$/),
    affiliation_code: z
      .string()
      .regex(/[A-Z0-9]{3,15}$/)
      .optional(),
  })
  .strict();

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
