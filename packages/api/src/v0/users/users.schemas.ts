import { z } from 'zod';

// Registration
export const RegisterSchema = z.object({
  body: z.object({
    password: z.string(),
    nickname: z.string(),
    username: z.string(),
  }),
});
export type RegisterSchema = z.infer<typeof RegisterSchema>['body'];

// Update key pair
export const UpdateKeyPairSchema = z.object({
  body: z.object({
    encryptedPrivateKey: z.string(),
    publicKey: z.string(),
  }),
});
export type UpdateKeyPairSchema = z.infer<typeof UpdateKeyPairSchema>['body'];

// Get user
export const GetUserSchema = z.object({
  params: z.object({
    username: z.string(),
  }),
});
export type GetUserSchema = z.infer<typeof GetUserSchema>['params'];

export const GetUserByIdSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});
export type GetUserByIdSchema = z.infer<typeof GetUserByIdSchema>['params'];

// Channel create
export const ChannelCreateSchema = z.object({
  body: z.object({
    recipients: z.array(z.string()),
    name: z.string().optional(),
  }),
});
export type ChannelCreateSchema = z.infer<typeof ChannelCreateSchema>['body'];
