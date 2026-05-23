import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/app/guards/ProtectedRoute'
import { legalEntityOnly, physicalPersonOnly } from '@/app/guards/taxpayerTypeAccess'
import { TaxpayerTypeGuard } from '@/app/guards/TaxpayerTypeGuard'
import { AppLayout } from '@/features/shell/layouts/AppLayout'
import { AccountDetailsOverviewPage } from '@/features/accounts/pages/AccountDetailsOverviewPage'
import { AccountDetailsLayout } from '@/features/accounts/layouts/AccountDetailsLayout'
import { AccountsPage } from '@/features/accounts/pages/AccountsPage'
import { AccountMovementsPage } from '@/features/movements/pages/AccountMovementsPage'
import { TransfersPage } from '@/features/transfers/pages/TransfersPage'
import { BulkTransferHistoryPage } from '@/features/transfers/pages/BulkTransferHistoryPage'
import { RedirectAccountTransfers } from '@/features/transfers/pages/RedirectAccountTransfers'
import { ClientsPage } from '@/features/clients/pages/ClientsPage'
import { CardsPage } from '@/features/cards/pages/CardsPage'
import { AffiliationsPage } from '@/features/affiliations/pages/AffiliationsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { CustomerRegistrationPage } from '@/features/customer-registration/pages/CustomerRegistrationPage'
import { LegalEntityRegistrationPage } from '@/features/customer-registration/pages/LegalEntityRegistrationPage'
import { NaturalPersonRegistrationPage } from '@/features/customer-registration/pages/NaturalPersonRegistrationPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RecoverPasswordPage } from '@/features/auth/pages/RecoverPasswordPage'
import { paths } from '@/shared/constants/paths'

export const router = createBrowserRouter([
  {
    path: paths.login,
    element: <LoginPage />,
  },
  {
    path: paths.recoverPassword,
    element: <RecoverPasswordPage />,
  },
  {
    path: paths.menu,
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to=".." replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'transfers',
            element: <TransfersPage />,
          },
          {
            path: 'transfers/bulk-history',
            element: <BulkTransferHistoryPage />,
          },
          {
            element: <TaxpayerTypeGuard allowedTypes={[...physicalPersonOnly]} />,
            children: [
              {
                path: 'cards',
                element: <CardsPage />,
              },
            ],
          },
          {
            element: <TaxpayerTypeGuard allowedTypes={[...legalEntityOnly]} />,
            children: [
              {
                path: 'affiliations',
                element: <AffiliationsPage />,
              },
              {
                path: 'clients',
                element: <ClientsPage />,
              },
              {
                path: 'clients/details/:clientId',
                element: <AccountsPage />,
              },
              {
                path: 'customer-registration',
                element: <CustomerRegistrationPage />,
              },
              {
                path: 'customer-registration/legal-entity',
                element: <LegalEntityRegistrationPage />,
              },
              {
                path: 'customer-registration/natural-person',
                element: <NaturalPersonRegistrationPage />,
              },
            ],
          },
          {
            path: ':customerId/accounts',
            element: <AccountsPage />,
          },
          {
            path: ':customerId/accounts/:accountId/details',
            element: <AccountDetailsLayout />,
            children: [
              {
                index: true,
                element: <AccountDetailsOverviewPage />,
              },
              {
                path: 'movements',
                element: <AccountMovementsPage />,
              },
              {
                path: 'transfers',
                element: <RedirectAccountTransfers />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={paths.login} replace />,
  },
])
