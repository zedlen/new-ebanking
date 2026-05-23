import { env } from "@/lib/env";

const { baseUrl, appName, env: appEnv } = env;

export const endpoints = {
  auth: {
    login: `${baseUrl}/auth/${appName}/${appEnv}/sign-in`,
    logout: `${baseUrl}/auth/sign-out`,
    authuser: `${baseUrl}/auth/users/authuser`,
    me: `${baseUrl}/auth/me`,
    recoverPass: `${baseUrl}/auth/${appName}/${appEnv}/recover-password`,
    otpLinkCard: `${baseUrl}/auth/generate-otp-code/link_card`,
    otpCancelCard: `${baseUrl}/auth/generate-otp-code/cancel_card`,
  },
  partners: `${baseUrl}/backoffice/partners`,
  banks: `${baseUrl}/backoffice/banks`,
  affiliationCode: `${baseUrl}/backoffice/affiliation-code`,
  searcher: `${baseUrl}/backoffice/searcher`,
  onboardings: `${baseUrl}/backoffice/onboardings`,
  cards: `${baseUrl}/backoffice/cards`,
  mailing: {
    templates: `${baseUrl}/backoffice/mailing/templates`,
    send: `${baseUrl}/backoffice/mailing/send`,
  },
} as const;
