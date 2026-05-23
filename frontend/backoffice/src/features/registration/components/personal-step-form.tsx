import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/registration/components/form-field";
import {
  personalFisicaSchema,
  personalMoralSchema,
  type PersonalFisicaValues,
  type PersonalMoralValues,
} from "@/features/registration/registration-schemas";
import { TypePerson } from "@/types/partners";

interface PersonalStepFormProps {
  typePerson: TypePerson;
  onStepChange: (
    valid: boolean,
    values?: PersonalMoralValues | PersonalFisicaValues,
  ) => void;
  resetKey?: number;
}

export function PersonalStepForm({
  typePerson,
  onStepChange,
  resetKey = 0,
}: PersonalStepFormProps) {
  const isMoral = typePerson === TypePerson.Moral;

  const moralForm = useForm<PersonalMoralValues>({
    resolver: zodResolver(personalMoralSchema),
    mode: "onChange",
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_tel: "",
    },
  });

  const fisicaForm = useForm<PersonalFisicaValues>({
    resolver: zodResolver(personalFisicaSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      ap_paterno: "",
      ap_materno: "",
      contact_email: "",
      contact_tel: "",
      rfc: "",
    },
  });

  const form = isMoral ? moralForm : fisicaForm;
  const values = form.watch();

  useEffect(() => {
    if (form.formState.isValid) {
      onStepChange(true, values);
    } else {
      onStepChange(false);
    }
  }, [form.formState.isValid, values, onStepChange, form]);

  useEffect(() => {
    moralForm.reset();
    fisicaForm.reset();
    onStepChange(false);
  }, [resetKey, moralForm, fisicaForm, typePerson, onStepChange]);

  if (isMoral) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" data-testid="form-personal">
        <FormField
          label="Nombre de Contacto"
          error={moralForm.formState.errors.contact_name?.message}
        >
          <Input
            placeholder="Ingresa un nombre de contacto"
            {...moralForm.register("contact_name")}
          />
        </FormField>
        <FormField
          label="Email"
          error={moralForm.formState.errors.contact_email?.message}
        >
          <Input
            type="email"
            placeholder="Ingresa un correo electrónico"
            {...moralForm.register("contact_email")}
          />
        </FormField>
        <FormField
          label="Teléfono"
          error={moralForm.formState.errors.contact_tel?.message}
        >
          <Input
            maxLength={10}
            placeholder="Ingresa un teléfono"
            {...moralForm.register("contact_tel")}
          />
        </FormField>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="form-personal">
      <FormField label="Nombre(s)" error={fisicaForm.formState.errors.name?.message}>
        <Input placeholder="Ingresa el nombre" {...fisicaForm.register("name")} />
      </FormField>
      <FormField
        label="Apellido Paterno"
        error={fisicaForm.formState.errors.ap_paterno?.message}
      >
        <Input
          placeholder="Ingresa el apellido paterno"
          {...fisicaForm.register("ap_paterno")}
        />
      </FormField>
      <FormField
        label="Apellido Materno"
        error={fisicaForm.formState.errors.ap_materno?.message}
      >
        <Input
          placeholder="Ingresa el apellido materno"
          {...fisicaForm.register("ap_materno")}
        />
      </FormField>
      <FormField label="Email" error={fisicaForm.formState.errors.contact_email?.message}>
        <Input
          type="email"
          placeholder="Ingresa un correo electrónico"
          {...fisicaForm.register("contact_email")}
        />
      </FormField>
      <FormField
        label="Teléfono"
        error={fisicaForm.formState.errors.contact_tel?.message}
      >
        <Input
          maxLength={10}
          placeholder="Ingresa un teléfono"
          {...fisicaForm.register("contact_tel")}
        />
      </FormField>
      <FormField label="RFC" error={fisicaForm.formState.errors.rfc?.message}>
        <Input placeholder="Ingresa tu RFC" {...fisicaForm.register("rfc")} />
      </FormField>
    </div>
  );
}
