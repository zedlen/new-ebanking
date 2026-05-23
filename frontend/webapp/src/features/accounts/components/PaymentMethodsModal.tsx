import { CopyButton } from '@/shared/components/CopyButton'
import type { AccountInfo } from '@/shared/types/accounts'

interface PaymentMethodsModalProps {
  account: AccountInfo
}

export function PaymentMethodsModal({ account }: PaymentMethodsModalProps) {
  const clabe = account.clabes?.[0]
  const internalAccount = clabe?.account_id ?? '—'
  const clabeNumber = clabe?.clabe ?? '—'

  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-neutral">
            <th className="pb-2 pr-4 font-medium">Tipo</th>
            <th className="pb-2 font-medium">No. de cuenta</th>
            <th className="pb-2 w-16" />
          </tr>
        </thead>
        <tbody>
          <PaymentRow
            type="Traspaso cuentas ZeusPay"
            accountNumber={internalAccount}
          />
          <PaymentRow type="SPEI" accountNumber={clabeNumber} />
        </tbody>
      </table>
    </div>
  )
}

function PaymentRow({
  type,
  accountNumber,
}: {
  type: string
  accountNumber: string
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4 text-foreground">{type}</td>
      <td className="py-3 font-mono text-foreground">{accountNumber}</td>
      <td className="py-3 text-right">
        {accountNumber !== '—' && <CopyButton value={accountNumber} />}
      </td>
    </tr>
  )
}
