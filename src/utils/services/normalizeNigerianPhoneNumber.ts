export const normalizeNigerianPhoneNumber = (value: string) => {
  const digitsOnly = value.trim().replace(/\D/g, "");

  if (digitsOnly.length < 10) {
    return null;
  }

  if (digitsOnly.length === 10) {
    return `+234${digitsOnly}`;
  }

  return `+234${digitsOnly.slice(-10)}`;
};
