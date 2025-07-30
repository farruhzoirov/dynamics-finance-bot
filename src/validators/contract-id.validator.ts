export function validateContractId(input: string) {
  const cleaned = input.replace(/[\u00A0\s]/g, '').replace(/\./g, '');

  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  const parsed = parseInt(cleaned, 10);

  return parsed;
}
