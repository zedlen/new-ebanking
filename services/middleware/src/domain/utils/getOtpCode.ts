export const getKubitOtpCode = (headers: Record<string, string>) => {
  return headers['kubit-otp'] || headers['Kubit-Otp'] || headers['KUBIT-OTP'];
};
