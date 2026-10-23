import dayjs from 'dayjs';
import * as z from 'zod/mini';

const formatDate = z.pipe(
  z.string(),
  z.transform((d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : null))
);

export const BaseEntitySchema = z.object({
  id: z.nullish(z.string()),
  refID: z.nullish(z.string()),
  isActive: z.nullish(z.boolean()),
  isDelete: z.nullish(z.boolean()),
  createdAt: z.nullish(formatDate),
  editedAt: z.nullish(formatDate),
  userEdit: z.nullish(
    z.object({
      id: z.nullish(z.string()),
      name: z.nullish(z.string()),
    })
  ),
});

export type BaseEntityModel = z.infer<typeof BaseEntitySchema>;
