import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/registration/components/form-field";
import { MEXICO_STATES } from "@/features/registration/mexico-states";
import {
  addressSchema,
  type AddressFormValues,
} from "@/features/registration/registration-schemas";

interface AddressStepFormProps {
  onStepChange: (valid: boolean, values?: AddressFormValues) => void;
  resetKey?: number;
}

export function AddressStepForm({
  onStepChange,
  resetKey = 0,
}: AddressStepFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: {
      street: "",
      reference: "",
      neighborhood: "",
      district: "",
      num_ext: "",
      num_int: "",
      estate: "Ciudad de México",
      cp: "",
    },
  });

  const values = form.watch();

  useEffect(() => {
    if (form.formState.isValid) {
      onStepChange(true, values);
    } else {
      onStepChange(false);
    }
  }, [form.formState.isValid, values, onStepChange]);

  useEffect(() => {
    form.reset({
      street: "",
      reference: "",
      neighborhood: "",
      district: "",
      num_ext: "",
      num_int: "",
      estate: "Ciudad de México",
      cp: "",
    });
    onStepChange(false);
  }, [resetKey, form, onStepChange]);

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="form-address">
      <FormField label="Calle" error={form.formState.errors.street?.message}>
        <Input placeholder="Ingresa tu dirección" {...form.register("street")} />
      </FormField>
      <FormField label="Referencia" error={form.formState.errors.reference?.message}>
        <Input placeholder="Ingresa una referencia" {...form.register("reference")} />
      </FormField>
      <FormField label="Colonia" error={form.formState.errors.neighborhood?.message}>
        <Input placeholder="Ingresa tu colonia" {...form.register("neighborhood")} />
      </FormField>
      <FormField label="Distrito" error={form.formState.errors.district?.message}>
        <Input placeholder="Ingresa tu distrito" {...form.register("district")} />
      </FormField>
      <FormField
        label="Número Exterior"
        error={form.formState.errors.num_ext?.message}
      >
        <Input placeholder="Núm. exterior" {...form.register("num_ext")} />
      </FormField>
      <FormField label="Número Interior" error={form.formState.errors.num_int?.message}>
        <Input placeholder="Núm. interior" {...form.register("num_int")} />
      </FormField>
      <FormField label="Estado" error={form.formState.errors.estate?.message}>
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          {...form.register("estate")}
        >
          {MEXICO_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Código Postal" error={form.formState.errors.cp?.message}>
        <Input maxLength={5} placeholder="Código Postal" {...form.register("cp")} />
      </FormField>
    </div>
  );
}
