export const paths = {
  login: '/',
  recoverPassword: '/recover-password',
  menu: '/menu',
  clients: '/menu/clients',
  cards: '/menu/cards',
  affiliations: '/menu/affiliations',
  customerRegistration: '/menu/customer-registration',
  legalEntityRegistration: '/menu/customer-registration/legal-entity',
  naturalPersonRegistration: '/menu/customer-registration/natural-person',
  profile: '/menu/profile',
  transfers: '/menu/transfers',
  transfersBulkHistory: '/menu/transfers/bulk-history',
  accounts: (customerId: string) => `/menu/${customerId}/accounts`,
  accountDetails: (customerId: string, accountId: string) =>
    `/menu/${customerId}/accounts/${accountId}/details`,
  accountMovements: (customerId: string, accountId: string) =>
    `/menu/${customerId}/accounts/${accountId}/details/movements`,
  accountTransfers: (customerId: string, accountId: string) =>
    `/menu/${customerId}/accounts/${accountId}/details/transfers`,
  clientAccounts: (clientId: string) => `/menu/clients/details/${clientId}`,
} as const
