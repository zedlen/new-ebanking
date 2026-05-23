import { create } from 'zustand'
import type { AccountInfo } from '@/shared/types/accounts'

interface AccountsState {
  currentAccount: AccountInfo | null
  setCurrentAccount: (account: AccountInfo | null) => void
}

export const useAccountsStore = create<AccountsState>((set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount) => set({ currentAccount }),
}))
