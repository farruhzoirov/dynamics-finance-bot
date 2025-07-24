export function isValidDateFormat(dateStr: string): boolean {
  const regex = /^([0-2][0-9]|3[0-1])\.(0[1-9]|1[0-2])\.(\d{4})$/;

  if (!regex.test(dateStr)) return false;

  return true;
}
