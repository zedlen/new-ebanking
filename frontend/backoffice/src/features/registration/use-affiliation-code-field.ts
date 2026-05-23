import { useEffect, useRef, useState } from "react";
import type { UseFormSetError, UseFormClearErrors } from "react-hook-form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { validateAffiliationCode } from "@/features/registration/registration-api";
import {
  AFFILIATION_CODE_MESSAGES,
  AffiliationCodeError,
} from "@/types/registration";

type AffiliationStatus = "idle" | "validating" | "valid" | "invalid";

export function useAffiliationCodeField(
  value: string | undefined,
  setError: UseFormSetError<{ affiliation_code?: string }>,
  clearErrors: UseFormClearErrors<{ affiliation_code?: string }>,
) {
  const debounced = useDebouncedValue(value ?? "", 500);
  const [status, setStatus] = useState<AffiliationStatus>("idle");
  const lastValidated = useRef("");

  useEffect(() => {
    const code = debounced.trim();
    if (!code || code.length < 3) {
      setStatus("idle");
      clearErrors("affiliation_code");
      lastValidated.current = "";
      return;
    }

    if (code === lastValidated.current) return;

    let cancelled = false;
    setStatus("validating");

    void validateAffiliationCode(code).then((res) => {
      if (cancelled) return;
      lastValidated.current = code;

      if (res.isValid) {
        setStatus("valid");
        clearErrors("affiliation_code");
        return;
      }

      setStatus("invalid");
      const message =
        AFFILIATION_CODE_MESSAGES[res.code] ??
        AFFILIATION_CODE_MESSAGES[AffiliationCodeError.Invalid];
      setError("affiliation_code", { type: "manual", message });
    });

    return () => {
      cancelled = true;
    };
  }, [debounced, clearErrors, setError]);

  return status;
}
