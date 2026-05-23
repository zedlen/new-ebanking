import { useEffect } from 'react'
import { speiService } from '@/api/services/speiService'
import { useTransferStore } from '@/shared/store/transferStore'

export function useBanks() {
  const banks = useTransferStore((s) => s.banks)
  const setBanks = useTransferStore((s) => s.setBanks)

  useEffect(() => {
    if (banks.length > 0) return
    void speiService.getBanks().then(setBanks)
  }, [banks.length, setBanks])

  return banks
}
