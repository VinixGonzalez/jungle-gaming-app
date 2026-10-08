interface HttpClientError {
  isAxiosError: true
  response?: {
    data?: unknown
    status?: number
  }
}

export function isHttpClientError(error: unknown): error is HttpClientError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true
  )
}
