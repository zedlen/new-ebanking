import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressStepForm } from "@/features/registration/components/address-step-form";
import { CompanyStepForm } from "@/features/registration/components/company-step-form";
import { PersonTypeDialog } from "@/features/registration/components/person-type-dialog";
import { PersonalStepForm } from "@/features/registration/components/personal-step-form";
import { RegistrationStage } from "@/features/registration/components/registration-stage";
import {
  createCustomer,
  createPartner,
  createWallet,
} from "@/features/registration/registration-api";
import {
  buildRegistrationPayload,
  type AddressFormValues,
  type CompanyCustomerValues,
  type CompanyPartnerValues,
  type PersonalFisicaValues,
  type PersonalMoralValues,
} from "@/features/registration/registration-schemas";
import { TypePerson } from "@/types/partners";
import type { RegistrationLayout } from "@/types/registration";

type RegistrationStep = "company" | "address" | "personal";

const LAYOUT_TITLES: Record<RegistrationLayout, string> = {
  partners: "Partner",
  customers: "Cliente",
  wallets: "Wallet",
  accounts: "Wallet",
};

function resolveLayout(params: {
  partnerId?: string;
  customerId?: string;
  walletId?: string;
}): RegistrationLayout {
  if (params.partnerId && params.customerId) {
    return params.walletId ? "accounts" : "wallets";
  }
  if (params.partnerId) return "customers";
  return "partners";
}

export function RegistrationPage() {
  const navigate = useNavigate();
  const { partnerId, customerId } = useParams();
  const layout = resolveLayout(useParams());

  const [typePerson, setTypePerson] = useState<TypePerson | null>(() => {
    if (layout === "wallets" || layout === "accounts") return TypePerson.Fisica;
    if (layout === "partners") return TypePerson.Moral;
    return null;
  });

  const [personModalOpen, setPersonModalOpen] = useState(layout === "customers");
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<RegistrationStep>(
    layout === "partners" || typePerson === TypePerson.Moral
      ? "company"
      : "address",
  );
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [companyValid, setCompanyValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [personalValid, setPersonalValid] = useState(false);

  const [companyData, setCompanyData] = useState<
    CompanyCustomerValues | CompanyPartnerValues | undefined
  >();
  const [addressData, setAddressData] = useState<AddressFormValues | undefined>();
  const [personalData, setPersonalData] = useState<
    PersonalMoralValues | PersonalFisicaValues | undefined
  >();

  const showCompany = typePerson === TypePerson.Moral;

  const stepValidity = useMemo(
    () => ({
      company: showCompany ? companyValid : true,
      address: addressValid,
      personal: personalValid,
    }),
    [showCompany, companyValid, addressValid, personalValid],
  );

  const canSave = Object.values(stepValidity).every(Boolean);

  const handlePersonSelect = (person: TypePerson) => {
    setTypePerson(person);
    setPersonModalOpen(false);
    setActiveStep(person === TypePerson.Moral ? "company" : "address");
    setCompanyValid(false);
    setAddressValid(false);
    setPersonalValid(false);
    setCompanyData(undefined);
    setAddressData(undefined);
    setPersonalData(undefined);
  };

  const handlePersonModalClose = () => {
    setConfirmExitOpen(true);
  };

  const resetForms = useCallback(() => {
    setResetKey((k) => k + 1);
    setCompanyValid(false);
    setAddressValid(false);
    setPersonalValid(false);
    setCompanyData(undefined);
    setAddressData(undefined);
    setPersonalData(undefined);
    setActiveStep(showCompany ? "company" : "address");
  }, [showCompany]);

  const handleSave = async () => {
    if (!typePerson || !addressData || !personalData) return;
    if (showCompany && !companyData) return;

    setLoading(true);
    const payload = buildRegistrationPayload(
      typePerson,
      addressData,
      personalData,
      companyData,
    );

    let result: { success: boolean; error?: string | null };

    if (layout === "partners") {
      result = await createPartner(payload);
    } else if (layout === "customers" && partnerId) {
      result = await createCustomer(partnerId, payload);
    } else if (
      (layout === "wallets" || layout === "accounts") &&
      partnerId &&
      customerId
    ) {
      result = await createWallet(partnerId, customerId, payload);
    } else {
      result = { success: false, error: "Ruta de registro inválida" };
    }

    setLoading(false);

    if (result.success) {
      toast.success("Cambios guardados exitosamente");
      resetForms();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    toast.error("Error al guardar información, intenta más tarde.", {
      description: result.error ?? undefined,
    });
  };

  if (layout === "customers" && !typePerson) {
    return (
      <>
        <PersonTypeDialog
          open={personModalOpen}
          onSelect={handlePersonSelect}
          onRequestClose={handlePersonModalClose}
        />
        <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salir de Alta Cliente</DialogTitle>
              <DialogDescription>
                ¿Seguro que deseas salir de la pantalla de creación?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmExitOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => navigate(-1)}>
                Salir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const ready = typePerson !== null;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">
          Alta de {LAYOUT_TITLES[layout]}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border bg-muted/30 p-6">
          {!ready ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              {showCompany ? (
                <RegistrationStage
                  title="Datos de empresa"
                  completed={stepValidity.company}
                  active={activeStep === "company"}
                  onSelect={() => setActiveStep("company")}
                >
                  <CompanyStepForm
                    variant={layout === "partners" ? "partner" : "customer"}
                    resetKey={resetKey}
                    onStepChange={(valid, values) => {
                      setCompanyValid(valid);
                      if (values) setCompanyData(values);
                    }}
                  />
                </RegistrationStage>
              ) : null}

              <RegistrationStage
                title="Dirección"
                completed={stepValidity.address}
                active={activeStep === "address"}
                onSelect={() => setActiveStep("address")}
              >
                <AddressStepForm
                  resetKey={resetKey}
                  onStepChange={(valid, values) => {
                    setAddressValid(valid);
                    if (values) setAddressData(values);
                  }}
                />
              </RegistrationStage>

              <RegistrationStage
                title="Datos personales"
                completed={stepValidity.personal}
                active={activeStep === "personal"}
                onSelect={() => setActiveStep("personal")}
              >
                <PersonalStepForm
                  typePerson={typePerson!}
                  resetKey={resetKey}
                  onStepChange={(valid, values) => {
                    setPersonalValid(valid);
                    if (values) setPersonalData(values);
                  }}
                />
              </RegistrationStage>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  disabled={!canSave || loading}
                  onClick={() => void handleSave()}
                  className="min-w-[196px] rounded-full"
                >
                  {loading ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <PersonTypeDialog
        open={personModalOpen && layout === "customers"}
        onSelect={handlePersonSelect}
        onRequestClose={handlePersonModalClose}
      />

      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salir de Alta {LAYOUT_TITLES[layout]}</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas salir de la pantalla de creación?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmExitOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => navigate(-1)}>
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
