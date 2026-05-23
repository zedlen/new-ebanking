import { create } from 'zustand'
import type { DispersionPrefill } from '@/shared/types/affiliations'
import type { Bank, TransferFavorite } from '@/shared/types/transfers'

interface TransferState {
  banks: Bank[]
  selectedFavorite: TransferFavorite | null
  dispersionPrefill: DispersionPrefill | null
  setBanks: (banks: Bank[]) => void
  setSelectedFavorite: (favorite: TransferFavorite | null) => void
  clearSelectedFavorite: () => void
  setDispersionPrefill: (prefill: DispersionPrefill | null) => void
}

export const useTransferStore = create<TransferState>((set) => ({
  banks: [],
  selectedFavorite: null,
  dispersionPrefill: null,
  setBanks: (banks) => set({ banks }),
  setSelectedFavorite: (selectedFavorite) => set({ selectedFavorite }),
  clearSelectedFavorite: () => set({ selectedFavorite: null }),
  setDispersionPrefill: (dispersionPrefill) => set({ dispersionPrefill }),
}))
