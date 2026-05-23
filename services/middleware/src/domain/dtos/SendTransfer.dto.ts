import { z } from 'zod';

export const SendTransferRequestSchema = z
  .object({
    concept: z.string(),
    beneficiary_account: z.string(),
    payer_account: z.string(),
    amount: z.number(),
    save_beneficiary_account: z.boolean(),
    alias_beneficiary_account: z.string(),
  })
  .strict();

export type SendTransferRequestDTO = z.infer<typeof SendTransferRequestSchema>;
