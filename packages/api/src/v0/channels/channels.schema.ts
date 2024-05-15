import { z } from 'zod';

// Message send
export const MessagePostSchema = z.object({
  body: z.object({
    content: z.array(
      z.object({
        cipher: z.string(),
        target: z.string(),
        encryptedSymmetricKey: z.string(),
      })
    ),
    quote: z.string().optional(),
    type: z.enum(['TEXT', 'REACTION', 'READ_RECEIPT']).default('TEXT'),
  }),
  params: z.object({
    channelId: z.string(),
  }),
});
export type MessagePostSchemaBody = z.infer<typeof MessagePostSchema>['body'];
export type MessagePostSchemaParams = z.infer<
  typeof MessagePostSchema
>['params'];

// Update Message
export const UpdateMessageSchema = z.object({
  body: z.object({
    content: z.array(
      z.object({
        cipher: z.string(),
        target: z.string(),
        encryptedSymmetricKey: z.string(),
      })
    ),
  }),
  params: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
});
export type UpdateMessageSchemaBody = z.infer<
  typeof UpdateMessageSchema
>['body'];
export type UpdateMessageSchemaParams = z.infer<
  typeof UpdateMessageSchema
>['params'];

// Delete Message
export const DeleteMessageSchema = z.object({
  params: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
});
export type DeleteMessageSchema = z.infer<typeof DeleteMessageSchema>['params'];

// Get Channel
export const GetChannelSchema = z.object({
  params: z.object({
    channelId: z.string(),
  }),
});
export type GetChannelSchema = z.infer<typeof GetChannelSchema>['params'];

// Get Messages
export const GetMessagesSchema = z.object({
  params: z.object({
    channelId: z.string(),
  }),
  query: z.object({
    page: z.string().optional(),
  }),
});
export type GetMessagesSchemaParams = z.infer<
  typeof GetMessagesSchema
>['params'];
export type GetMessagesSchemaQuery = z.infer<typeof GetMessagesSchema>['query'];

// Get Message
export const GetMessageSchema = z.object({
  params: z.object({
    channelId: z.string(),
    messageId: z.string(),
  }),
});
export type GetMessageSchema = z.infer<typeof GetMessageSchema>['params'];
