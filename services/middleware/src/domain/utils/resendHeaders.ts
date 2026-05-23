export const resendHeaders = (
  headers: Record<string, string> | undefined,
): Record<string, string> => {
  const result: Record<string, string> = {};

  if (!headers) {
    return result;
  }

  if (headers['user-agent']) {
    result['user-agent'] = headers['user-agent'];
  }

  if (headers.origin) {
    result.origin = headers.origin;
  }

  if (headers.referer) {
    result.referer = headers.referer;
  }

  if (headers['x-forwarded-for']) {
    result['true-client-ip'] = headers['x-forwarded-for'];
    result['x-forwarded-for'] = headers['x-forwarded-for'];
    result['x-real-ip'] = headers['x-forwarded-for'];
  } else {
    result['x-forwarded-for'] = '187.189.145.239';
  }

  return result;
};
