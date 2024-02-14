import { z } from 'zod';

// Sign in
export const SigninSchema = z.object({
  body: z.object({
    password: z.string(),
    username: z.string(),
  }),
});
export type SigninSchema = z.infer<typeof SigninSchema>['body'];
