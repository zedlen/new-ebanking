import { useState } from 'react'

interface CopyButtonProps {
  value: string
  label?: string
}

export function CopyButton({ value, label = 'Copiar' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="text-xs font-medium text-primary hover:underline"
    >
      {copied ? 'Copiado' : label}
    </button>
  )
}
