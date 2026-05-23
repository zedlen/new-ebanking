import { HeadersInfo } from '../repositories/headers.interface';

const getStringHeader = (
  headers: Record<string, unknown>,
  key: string,
): string => {
  const value = headers[key];
  return typeof value === 'string' ? value : '';
};

const getNumberHeader = (
  headers: Record<string, unknown>,
  key: string,
): number => {
  const value = headers[key];
  return typeof value === 'number' ? value : 0;
};

export const extractHeaders = (
  headers: Record<string, unknown> = {},
): HeadersInfo => {
  const appUrl = getStringHeader(headers, 'API_URL'),
    apiKey = getStringHeader(headers, 'API_KEY'),
    userToken = getStringHeader(headers, 'USER_TOKEN'),
    userId = getStringHeader(headers, 'USER_ID'),
    appName = getStringHeader(headers, 'APP_NAME'),
    env = getStringHeader(headers, 'APP_ENV'),
    tki = getStringHeader(headers, 'TID'),
    userType = getNumberHeader(headers, 'USER_TYPE');

  return { appUrl, apiKey, userToken, userId, appName, env, tki, userType };
};
