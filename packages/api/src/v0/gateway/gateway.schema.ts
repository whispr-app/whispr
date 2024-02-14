import z from 'zod';

// Gateway Initialise
export const GatewaySchema = z.object({
  params: z.object({
    token: z.string(),
  }),
});
export type GatewaySchema = z.infer<typeof GatewaySchema>['params'];

// Gateway Message
export const GatewayMessageSchema = z.object({
  op: z.number(),
  t: z.number().optional(),
  d: z.any().optional(),
  ts: z.number(),
});
export type GatewayMessageSchema = z.infer<typeof GatewayMessageSchema>;
