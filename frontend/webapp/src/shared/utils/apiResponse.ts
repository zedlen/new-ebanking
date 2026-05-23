/** Detects the `/auth/me` user payload (with or without an API envelope). */
export function isAuthMePayload(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'taxpayer_type_id' in value
  )
}

/**
 * Unwraps API bodies that may be `T`, `{ data: T }`, or `{ code, data: T }`.
 */
export function unwrapApiData<T>(body: unknown): T {
  if (body == null) {
    throw new Error('Empty API response')
  }

  if (isAuthMePayload(body)) {
    return body as T
  }

  if (typeof body === 'object' && 'data' in body) {
    const inner = (body as { data: unknown }).data

    if (isAuthMePayload(inner)) {
      return inner as T
    }

    if (inner != null) {
      return inner as T
    }
  }

  return body as T
}
