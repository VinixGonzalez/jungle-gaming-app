import { z } from "zod"

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    fieldErrors: z.record(z.string(), z.array(z.string().min(1))).optional(),
    retryable: z.boolean().optional(),
    requestId: z.string().min(1),
  }),
})

export type ApiError = z.infer<typeof apiErrorSchema>
