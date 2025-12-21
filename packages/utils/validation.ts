export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Mongolian phone format: 8 digits or +976 followed by 8 digits
  const phoneRegex = /^(\+976)?[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
