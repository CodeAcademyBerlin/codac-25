import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000, 'Message is too long'),
  roomName: z.string().min(1, 'Room name is required'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
