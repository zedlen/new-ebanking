export const getNameFromAccount = (account: any) => {
  if (account.taxpayer_type_id === 2)
    return (
      account?.company_name ||
      account?.contact_name ||
      ""
    )?.toUpperCase?.();
  const fullName =
    `${account?.name || ""} ${account?.ap_paterno || ""} ${account?.ap_materno || ""}`.trim();
  return (
    fullName ||
    account?.company_name ||
    account?.contact_name ||
    ""
  )?.toUpperCase?.();
};
