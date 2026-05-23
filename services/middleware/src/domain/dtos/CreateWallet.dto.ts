import { z } from 'zod';
import { AddressDTO } from './Address.dto';

export const CreateWalletSchema = z
  .object({
    rfc: z
      .string()
      .regex(/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/),
    name: z.string().min(3).optional(),
    ap_paterno: z.string().min(3).optional(),
    ap_materno: z.string().min(3).optional(),
    taxpayer_type_id: z.number().min(1).max(1),
    address: AddressDTO.optional(),
    contact_name: z.string().min(3),
    contact_email: z.email(),
    contact_tel: z.string().regex(/[0-9]{10}$/),
  })
  .strict();

export type CreateWalletDTO = z.infer<typeof CreateWalletSchema>;
