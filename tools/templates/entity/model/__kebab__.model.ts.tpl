import { z } from 'zod';

export const __Pascal__Schema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export type __Pascal__Model = z.infer<typeof __Pascal__Schema>;
