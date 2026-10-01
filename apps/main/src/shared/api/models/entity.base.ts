import dayjs from 'dayjs';
import { z } from 'zod';

export const BaseEntitySchema = z.object({
  id: z.string().nullish(),
  refID: z.string().nullish(),
  isActive: z.boolean().nullish(),
  isDelete: z.boolean().nullish(),
  createdAt: z
    .string()
    .transform((d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : null))
    .nullish(),
  editedAt: z
    .string()
    .transform((d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : null))
    .nullish(),
  userEdit: z
    .object({
      id: z.string().nullish(),
      name: z.string().nullish(),
    })
    .nullish(),
});

export type BaseEntityModel = z.infer<typeof BaseEntitySchema>;
