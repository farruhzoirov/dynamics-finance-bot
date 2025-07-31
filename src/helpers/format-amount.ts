import { Currency } from '../common/enums/currency.enum';

export function formatAmountByCurrency(
  amount: number,
  currencyType: string,
  language: string
) {
  const map: Record<string, { locale: string; currency: string }> = {
    [`${Currency.USD}_uz`]: { locale: 'ru-RU', currency: 'USD' },
    [`${Currency.USD}_ru`]: { locale: 'ru-RU', currency: 'USD' },
    [`${Currency.UZS}_uz`]: { locale: 'uz-UZ', currency: 'UZS' },
    [`${Currency.UZS}_ru`]: { locale: 'ru-RU', currency: 'UZS' }
  };

  const key = `${currencyType}_${language || 'ru'}`;
  console.log(key);
  const config = map[key];

  if (!config) {
    throw new Error(`Unsupported currency or language combination: ${key}`);
  }

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  if (currencyType === Currency.UZS && language === 'ru') {
    const numberOnly = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return `${numberOnly} сум`;
  }

  return formatted;
}
