import { z } from 'zod';

export const SendSPEIRequestSchema = z
  .object({
    concept: z.string(),
    beneficiary_account: z.string(),
    beneficiary_bank: z.string(),
    beneficiary_name: z.string(),
    beneficiary_uid: z.string(),
    beneficiary_account_type: z.number(),
    beneficiary_email: z.string(),
    payer_account: z.string(),
    amount: z.number(),
    numerical_reference: z.number(),
    save_beneficiary_account: z.boolean(),
    alias_beneficiary_account: z.string(),
  })
  .strict();

export type SendSPEIRequestDTO = z.infer<typeof SendSPEIRequestSchema>;
