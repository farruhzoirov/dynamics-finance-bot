export function validateAndParseAmount(input: string) {
  if (typeof input !== 'string') return NaN;
  const allowed = /^[\d\s.,\u00A0]+$/;

  if (!allowed.test(input)) {
    return false;
  }

  let cleaned = input.replace(/[\s\u00A0]/g, '');

  cleaned = cleaned.replace(/(?<=\d)\.(?=\d{3})/g, '');

  const lastComma = cleaned.lastIndexOf(',');
  if (lastComma !== -1) {
    cleaned =
      cleaned.slice(0, lastComma).replace(/,/g, '') +
      '.' +
      cleaned.slice(lastComma + 1);
  }

  cleaned = cleaned.replace(/^0+(?=\d)/, '');

  const number = parseFloat(cleaned);

  return Number.isNaN(number) ? false : number;
}
