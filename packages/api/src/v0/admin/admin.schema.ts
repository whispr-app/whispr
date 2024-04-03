import { z } from 'zod';

export const GenerateKeysSchema = z.object({
  body: z.object({
    keys: z.number(),
    numberOfUses: z.number(),
  }),
});
export type GenerateKeysSchema = z.infer<typeof GenerateKeysSchema>['body'];
