import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/registration/components/form-field";
import {
  companyCustomerSchema,
  companyPartnerSchema,
  type CompanyCustomerValues,
  type CompanyPartnerValues,
} from "@/features/registration/registration-schemas";
import { useAffiliationCodeField } from "@/features/registration/use-affiliation-code-field";
import { cn } from "@/lib/utils";

interface CompanyStepFormProps {
  variant: "partner" | "customer";
  onStepChange: (
    valid: boolean,
    values?: CompanyCustomerValues | CompanyPartnerValues,
  ) => void;
  resetKey?: number;
}

function PartnerCompanyStepForm({
  onStepChange,
  resetKey = 0,
}: Omit<CompanyStepFormProps, "variant">) {
  const form = useForm<CompanyPartnerValues>({
    resolver: zodResolver(companyPartnerSchema),
    mode: "onChange",
    defaultValues: {
      company_name: "",
      rfc: "",
      affiliation_code: "",
      economic_activity: "",
      business_activity: "",
      company_tel: "",
    },
  });

  const affiliationValue = form.watch("affiliation_code");
  const affiliationStatus = useAffiliationCodeField(
    affiliationValue,
    form.setError,
    form.clearErrors,
  );

  const values = form.watch();
  const affiliationBlocks =
    Boolean(affiliationValue && affiliationValue.length >= 3) &&
    (affiliationStatus === "validating" || affiliationStatus === "invalid");
  const stepValid = form.formState.isValid && !affiliationBlocks;

  useEffect(() => {
    onStepChange(stepValid, stepValid ? values : undefined);
  }, [stepValid, values, onStepChange]);

  useEffect(() => {
    form.reset();
    onStepChange(false);
  }, [resetKey, form, onStepChange]);

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="form-company">
      <FormField
        label="Razón social"
        error={form.formState.errors.company_name?.message}
      >
        <Input placeholder="Mi empresa S.A. de C.V." {...form.register("company_name")} />
      </FormField>
      <FormField label="RFC" error={form.formState.errors.rfc?.message}>
        <Input placeholder="Ingresa el RFC de la empresa" {...form.register("rfc")} />
      </FormField>
      <FormField
        label="Actividad Económica"
        error={form.formState.errors.economic_activity?.message}
      >
        <Input
          placeholder="Sector financiero"
          {...form.register("economic_activity")}
        />
      </FormField>
      <FormField
        label="Actividad Comercial"
        error={form.formState.errors.business_activity?.message}
      >
        <Input
          placeholder="Prestación de servicios financieros"
          {...form.register("business_activity")}
        />
      </FormField>
      <FormField
        label="Teléfono"
        error={form.formState.errors.company_tel?.message}
      >
        <Input
          maxLength={10}
          placeholder="Ingresa el teléfono de la empresa"
          {...form.register("company_tel")}
        />
      </FormField>
      <FormField
        label="Código de Afiliación"
        error={form.formState.errors.affiliation_code?.message}
        hint={
          affiliationStatus === "validating"
            ? "Validando código…"
            : affiliationStatus === "valid"
              ? "Código válido"
              : undefined
        }
      >
        <Input
          maxLength={15}
          placeholder="Ingresa el código de afiliación"
          className={cn(
            affiliationStatus === "valid" && "border-green-600",
            affiliationStatus === "invalid" && "border-destructive",
          )}
          {...form.register("affiliation_code")}
        />
      </FormField>
    </div>
  );
}

function CustomerCompanyStepForm({
  onStepChange,
  resetKey = 0,
}: Omit<CompanyStepFormProps, "variant">) {
  const form = useForm<CompanyCustomerValues>({
    resolver: zodResolver(companyCustomerSchema),
    mode: "onChange",
    defaultValues: {
      company_name: "",
      rfc: "",
      affiliation_code: "",
    },
  });

  const affiliationValue = form.watch("affiliation_code");
  const affiliationStatus = useAffiliationCodeField(
    affiliationValue,
    form.setError,
    form.clearErrors,
  );

  const values = form.watch();
  const affiliationBlocks =
    Boolean(affiliationValue && affiliationValue.length >= 3) &&
    (affiliationStatus === "validating" || affiliationStatus === "invalid");
  const stepValid = form.formState.isValid && !affiliationBlocks;

  useEffect(() => {
    onStepChange(stepValid, stepValid ? values : undefined);
  }, [stepValid, values, onStepChange]);

  useEffect(() => {
    form.reset();
    onStepChange(false);
  }, [resetKey, form, onStepChange]);

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="form-company">
      <FormField
        label="Razón social"
        error={form.formState.errors.company_name?.message}
      >
        <Input placeholder="Mi empresa S.A. de C.V." {...form.register("company_name")} />
      </FormField>
      <FormField label="RFC" error={form.formState.errors.rfc?.message}>
        <Input placeholder="Ingresa el RFC de la empresa" {...form.register("rfc")} />
      </FormField>
      <FormField
        label="Código de Afiliación"
        error={form.formState.errors.affiliation_code?.message}
        hint={
          affiliationStatus === "validating"
            ? "Validando código…"
            : affiliationStatus === "valid"
              ? "Código válido"
              : undefined
        }
      >
        <Input
          maxLength={15}
          placeholder="Ingresa el código de afiliación"
          className={cn(
            affiliationStatus === "valid" && "border-green-600",
            affiliationStatus === "invalid" && "border-destructive",
          )}
          {...form.register("affiliation_code")}
        />
      </FormField>
    </div>
  );
}

export function CompanyStepForm({ variant, ...props }: CompanyStepFormProps) {
  if (variant === "partner") {
    return <PartnerCompanyStepForm {...props} />;
  }
  return <CustomerCompanyStepForm {...props} />;
}
