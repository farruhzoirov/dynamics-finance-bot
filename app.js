function parseAmountSafe(input) {
  if (typeof input !== 'string') return NaN;

  // 1. Inputda faqat raqamlar, vergul, nuqta va bo‘sh joylarga ruxsat
  const allowed = /^-?[\d\s.,\u00A0]+$/;
  console.log(allowed.test(input))
  if (!allowed.test(input)) {
    console.log('ok')
    return NaN;
  }

  // 2. Bo‘sh joylarni olib tashlash (shu jumladan NBSP)
  let cleaned = input.replace(/[\s\u00A0]/g, '');

  // 3. Thousand separatorlarni olib tashlash (masalan, 9.100.200)
  cleaned = cleaned.replace(/(?<=\d)\.(?=\d{3})/g, '');

  // 4. Agar bir nechta vergul bo‘lsa — faqat oxirgisini kasr deb hisobla
  const lastComma = cleaned.lastIndexOf(',');
  if (lastComma !== -1) {
    cleaned =
      cleaned.slice(0, lastComma).replace(/,/g, '') +
      '.' +
      cleaned.slice(lastComma + 1);
  }

  cleaned = cleaned.replace(/^0+(?=\d)/, '');
  const number = parseFloat(cleaned);

  return Number.isNaN(number) ? NaN : number;
}

function formatAmount(number, locale = 'ru-RU', currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

// Foydalanish:
const testInputs = [
  '-1 000 000,00',
  '1.000.000,00',
  '01000,010000',
  '0000000123,4',
  '3 942 040 509,44',
  '9.100.200,100',
  '2000 , 100',
  '0,99',
  '0000000,10',
  '9,999',
  '1 000 000',
  '1000000,0',
  '001234567,89',
  '4,00',
  '999 999,999',
  '9 000000,000000',
  '000 000,001',
  '1 2 3 4 , 5 6 7',
  '1.2.3.4,567',
  '  1000,50  ',
  '1 000 som'        ,,   // matn bilan
'UZS 1,000.00'   ,     // oldida valyuta
'abc123'        ,      // harf ishtirok etgan
'1,000$'         ,     // oxirida belgilar
'1.000,00 uzs'   ,     // valyuta oxirida
'12a3'           ,     // raqam orasida harf
'💰1000'          ,    // emoji
'1,000.00.00'     ,    // bir nechta decimal
'-1000,50'        ,    // manfiy son (agar taqiqlangan bo‘lsa)
'10,00.50'        ,    // chalkash format
'1_000,00'        ,    // "_" ishlatilgan

];

for (const input of testInputs) {
  const result = parseAmountSafe(input);
  const formatted = formatAmount(result);
  console.log(`Input: "${input}" =>`, isNaN(result) ? '❌ NaN (Invalid)' : `✅ ${result} ||`, `${formatted}` );
}

