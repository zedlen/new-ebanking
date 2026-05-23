enum currencyValues {
  USD = "USD",
  MXN = "MXN",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CAD = "CAD",
  AUD = "AUD",
  CNY = "CNY",
  INR = "INR",
  BRL = "BRL",
  CLP = "CLP",
  ARS = "ARS",
}

const currencyToLocale = {
  [currencyValues.USD]: "en-US",
  [currencyValues.MXN]: "es-MX",
  [currencyValues.EUR]: "es-ES",
  [currencyValues.GBP]: "en-GB",
  [currencyValues.JPY]: "ja-JP",
  [currencyValues.CAD]: "en-CA",
  [currencyValues.AUD]: "en-AU",
  [currencyValues.CNY]: "zh-CN",
  [currencyValues.INR]: "hi-IN",
  [currencyValues.BRL]: "pt-BR",
  [currencyValues.CLP]: "es-CL",
  [currencyValues.ARS]: "es-AR",
};

export const formatCurrency = (n?: number, type = "MXN") => {
  const currency = currencyValues[type as currencyValues] || "MXN";
  const locale = currencyToLocale[currency];
  const formattedValue = (n || 0).toLocaleString(locale, {
    style: "currency",
    currency: currency,
  });

  return `${formattedValue} ${type}`;
};
