export const SESSION_TOKEN_KEY = "zeuspay-token";
export const SESSION_CUSTOMER_KEY = "zeuspay-customer";
export const SESSION_PROFILE_KEY = "zeuspay-profile";

export const PATHS = {
  login: "/",
  recoverPassword: "/recover-password",
  home: "/home",
  partners: "/home/partners",
  partnersMovements: "/home/partners/:partnerId/movements/:accountId",
  partnersAccounts: "/home/partners/:partnerId/accounts",
  customers: "/home/partners/:partnerId/customers",
  customersMovements:
    "/home/partners/:partnerId/:customerId/movements/:accountId",
  customersAccounts: "/home/partners/:partnerId/:customerId/accounts",
  customersCards: "/home/partners/:partnerId/:customerId/cards",
  customersCardsById:
    "/home/partners/:partnerId/:customerId/cards/:cardId/:typeCard",
  wallets: "/home/partners/:partnerId/:customerId/wallets",
  walletsMovements:
    "/home/partners/:partnerId/:customerId/:walletId/movements/:accountId",
  walletsAccounts:
    "/home/partners/:partnerId/:customerId/:walletId/accounts",
  walletsCards: "/home/partners/:partnerId/:customerId/:walletId/cards",
  walletsCardsById:
    "/home/partners/:partnerId/:customerId/:walletId/cards/:cardId/:typeCard",
  registerPartner: "/home/register",
  registerCustomer: "/home/register/:partnerId",
  registerWallet: "/home/register/:partnerId/:customerId",
  registerAccount: "/home/register/:partnerId/:customerId/:walletId",
  pendingMovements: "/home/movements",
  pendingProspects: "/home/prospects",
  pendingPayouts: "/home/payouts",
  mailing: "/home/mailing",
} as const;

export const NAV_ITEMS = [
  { title: "Partners", path: PATHS.partners, icon: "users" },
  { title: "Alta", path: PATHS.registerPartner, icon: "userPlus" },
  {
    title: "Aprobar movimientos",
    path: PATHS.pendingMovements,
    icon: "check",
  },
  {
    title: "Aprobar prospectos",
    path: PATHS.pendingProspects,
    icon: "file",
  },
  {
    title: "Carga de liquidaciones",
    path: PATHS.pendingPayouts,
    icon: "card",
  },
  { title: "Mailing", path: PATHS.mailing, icon: "mail" },
] as const;
