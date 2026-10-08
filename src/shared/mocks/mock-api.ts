import { HttpResponse } from "msw"

import { apiErrorSchema } from "../schemas/api-error.schema.js"

interface ErrorResponseOptions {
  fieldErrors?: Record<string, string[]>
  requestId?: string
  retryable?: boolean
}

function createErrorResponse(
  code: string,
  message: string,
  status: number,
  options: ErrorResponseOptions = {},
) {
  return HttpResponse.json(
    apiErrorSchema.parse({
      error: {
        code,
        message,
        fieldErrors: options.fieldErrors,
        retryable: options.retryable ?? false,
        requestId: options.requestId ?? crypto.randomUUID(),
      },
    }),
    { status },
  )
}

function createFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
  fallbackField = "request",
) {
  const fieldErrors: Record<string, string[]> = {}

  for (const issue of issues) {
    const field = String(issue.path[0] ?? fallbackField)
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message]
  }

  return fieldErrors
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export const mockApi = {
  createErrorResponse,
  createFieldErrors,
  readJson,
}
