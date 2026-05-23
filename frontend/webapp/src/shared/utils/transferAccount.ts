import type { AccountInfo } from '@/shared/types/accounts'
import { formatCurrency } from './format';

export function getAccountClabe(account: AccountInfo): string {
  return account.clabes?.[0]?.clabe ?? ''
}

export function getPayerAccountId(account: AccountInfo): string {
  return account.clabes?.[0]?.account_id ?? account.external_id ?? account.id ?? ''
}

export function getSpeiAccountId(account: AccountInfo): string {
  return account.external_id ?? account.id ?? ''
}

export function getAmount(account: AccountInfo): number {
  return account.amount;
}

export function getAccountLabel(account: AccountInfo): string {
  const clabe = getAccountClabe(account)
  const internal = getPayerAccountId(account)
  const amount = getAmount(account)
  if (internal) return `${internal} · ${formatCurrency(amount, account.currency)}`
  return clabe || internal || account.id
}
