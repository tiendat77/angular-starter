import { z } from 'zod';
import { BaseEntitySchema } from '../entity.base';

export const ExampleSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email is invalid'),
});

export type ExampleModel = z.infer<typeof ExampleSchema>;
