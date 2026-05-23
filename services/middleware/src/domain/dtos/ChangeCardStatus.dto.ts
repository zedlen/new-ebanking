// @ts-nocheck
import { z } from 'zod';

export const ChangeCardStatusRequestSchema = z
  .object({
    status: z.enum(['NORMAL', 'BLOCKED', 'CANCELED']),
    statusReason: z
      .enum([
        'INVALID_PASSWORD',
        'OTHER',
        'OWNER_REQUEST',
        'SUSPICION_OF_FRAUD',
        'TEMPORARILY',
        'INACTIVITY',
        'LOST',
        'THEFT',
        'TERMINATED_CONTRACT',
        'MISPLACED_CARD',
        null,
      ])
      .optional(),
  })
  .strict();

export type ChangeCardStatusRequestDTO = z.infer<typeof ChangeCardStatusRequestSchema>;
