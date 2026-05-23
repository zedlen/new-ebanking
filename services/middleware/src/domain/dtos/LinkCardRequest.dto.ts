import { z } from 'zod';

export const LinkCardRequestSchema = z
  .object({
    pan: z.string().regex(/[0-9]{16}/),
    accountId: z.string(),
  })
  .strict();

export type LinkCardRequestDTO = z.infer<typeof LinkCardRequestSchema>;
