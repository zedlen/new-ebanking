import { useQuery } from '@tanstack/react-query'
import { accountsService } from '@/api/services/accountsService'

const PAGE_SIZE = 100

export function useUserAccounts() {
  return useQuery({
    queryKey: ['transfer-user-accounts'],
    queryFn: async () => {
      const first = await accountsService.list(0, PAGE_SIZE)
      if (first.totalAccounts <= PAGE_SIZE) return first.accounts

      const all = [...first.accounts]
      let offset = PAGE_SIZE
      while (offset < first.totalAccounts) {
        const page = await accountsService.list(offset, PAGE_SIZE)
        all.push(...page.accounts)
        offset += PAGE_SIZE
      }
      return all
    },
  })
}
