import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/auth/login-page";
import { RecoverPasswordPage } from "@/features/auth/recover-password-page";
import { AccountsPage } from "@/features/partners/pages/accounts-page";
import { CancelCardPage } from "@/features/cards/pages/cancel-card-page";
import { CardsPage } from "@/features/cards/pages/cards-page";
import { LinkCardPage } from "@/features/cards/pages/link-card-page";
import { CustomersPage } from "@/features/partners/pages/customers-page";
import { MovementsPage } from "@/features/movements/movements-page";
import { PartnersPage } from "@/features/partners/pages/partners-page";
import { WalletsPage } from "@/features/partners/pages/wallets-page";
import { PendingMovementsPage } from "@/features/pending-movements/pages/pending-movements-page";
import { PayoutsPage } from "@/features/payouts/pages/payouts-page";
import { MailingPage } from "@/features/mailing/pages/mailing-page";
import { PendingProspectsPage } from "@/features/prospects/pages/pending-prospects-page";
import { RegistrationPage } from "@/features/registration/registration-page";
import { PATHS } from "@/lib/constants";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route
          path={PATHS.recoverPassword}
          element={<RecoverPasswordPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.home} element={<AppShell />}>
            <Route index element={<Navigate to={PATHS.partners} replace />} />

            <Route path="partners" element={<PartnersPage />} />
            <Route
              path="partners/:partnerId/customers"
              element={<CustomersPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/wallets"
              element={<WalletsPage />}
            />
            <Route
              path="partners/:partnerId/accounts"
              element={<AccountsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/accounts"
              element={<AccountsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/:walletId/accounts"
              element={<AccountsPage />}
            />
            <Route
              path="partners/:partnerId/movements/:accountId"
              element={<MovementsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/movements/:accountId"
              element={<MovementsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/:walletId/movements/:accountId"
              element={<MovementsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/cards/link"
              element={<LinkCardPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/cards/:cardId/:typeCard"
              element={<CancelCardPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/cards"
              element={<CardsPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/:walletId/cards/link"
              element={<LinkCardPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/:walletId/cards/:cardId/:typeCard"
              element={<CancelCardPage />}
            />
            <Route
              path="partners/:partnerId/:customerId/:walletId/cards"
              element={<CardsPage />}
            />

            <Route path="register" element={<RegistrationPage />} />
            <Route path="register/:partnerId" element={<RegistrationPage />} />
            <Route
              path="register/:partnerId/:customerId"
              element={<RegistrationPage />}
            />
            <Route
              path="register/:partnerId/:customerId/:walletId"
              element={<RegistrationPage />}
            />
            <Route path="movements" element={<PendingMovementsPage />} />
            <Route path="prospects" element={<PendingProspectsPage />} />
            <Route path="payouts" element={<PayoutsPage />} />
            <Route path="mailing" element={<MailingPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={PATHS.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
