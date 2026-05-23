import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailListInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

export function EmailListInput({
  value,
  onChange,
  placeholder = "Escribe un correo y presiona Enter",
}: EmailListInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addEmails = (raw: string) => {
    const candidates = raw
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    let updated = [...value];

    for (const email of candidates) {
      if (!EMAIL_REGEX.test(email)) {
        toast.error(`Correo inválido: ${email}`);
        continue;
      }
      if (updated.includes(email)) {
        toast.warning(`Correo duplicado: ${email}`);
        continue;
      }
      updated.push(email);
    }

    onChange(updated);
  };

  const removeEmail = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  const commitInput = () => {
    if (inputValue.trim()) {
      addEmails(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((email) => (
          <Badge key={email} variant="secondary" className="gap-1 pr-1">
            {email}
            <button
              type="button"
              className="hover:bg-muted rounded p-0.5"
              onClick={() => removeEmail(email)}
              aria-label={`Quitar ${email}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitInput();
          }
        }}
        onBlur={commitInput}
      />
      <p className="text-muted-foreground text-xs">
        Puedes ingresar varios correos separados por coma, espacio o punto y coma.
      </p>
    </div>
  );
}
