export const formatDate = (data: string): string => {
  if (!data) return "-";

  const utcDate = new Date(data.replace(/[zZ]/, ""));

  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getDate()).padStart(2, "0");
  const hours = String(utcDate.getHours()).padStart(2, "0");
  const minutes = String(utcDate.getMinutes()).padStart(2, "0");

  const localFormattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
  return localFormattedDate;
};

export const formatExpirationDate = (date: string = ""): string => {
  const [year = "**", month = "**"] = date.split("-");
  return `${month || "**"}/${year || "**"}`;
};
