import { z } from 'zod';
import { AddressDTO } from './Address.dto';

export const AffiliationRequestSchema = z
  .object({
    rfc: z
      .string()
      .regex(
        /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/,
      )
      .optional(),
    name: z.string().min(3),
    ap_paterno: z.string().min(3),
    ap_materno: z.string().min(3),
    address: AddressDTO.optional(),
    contact_email: z.email(),
    contact_tel: z.string().regex(/[0-9]{10}$/),
    affiliation_code: z
      .string()
      .regex(/[A-Z0-9]{3,15}$/)
      .optional(),
    isEnterprise: z.boolean(),
  })
  .strict();

export type AffiliationRequestDTO = z.infer<typeof AffiliationRequestSchema>;
