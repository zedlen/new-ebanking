import { z } from 'zod';

export const AddressDTO = z.object({
  street: z.string().min(3),
  num_ext: z.string().min(1),
  num_int: z.string().optional(),
  reference: z.string().optional(),
  neighborhood: z.string().min(3),
  district: z.string().min(3),
  estate: z.string().min(3),
  cp: z.string().length(5),
});

export type AddressDTO = z.infer<typeof AddressDTO>;
