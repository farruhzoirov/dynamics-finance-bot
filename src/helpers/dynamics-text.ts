import { Currency } from '../common/enums/currency.enum';
import { Languages } from '../common/types/languages';
import { formatAmountByCurrency } from './format-amount';

export function getContractDynamicText(
  body: any,
  lang: Languages,
  actionsStatusText: string,
  contractStatusText: string,
  confirmationLebel: boolean = false
) {
  const baseTextUz =
    `🆔 *Unikal ID:* ${body.uniqueId}\n` +
    `📄 *Shartnoma raqami:* ${body.contractId}\n` +
    `💰 *Shartnoma summasi:* ${formatAmountByCurrency(body.contractAmount, body.currency, lang)}\n` +
    `💱 *Valyuta:* ${body.currency}\n` +
    `🔁 *Ayirboshlash kursi (yaratilgan vaqt):*  ${formatAmountByCurrency(body.exchangeRate, Currency.UZS, lang)}\n` +
    `📅 *Shartnoma sanasi:* ${body.contractDate}\n` +
    `👤 *Manager haqida ma'lumot:* ${body.info}\n` +
    `📝 *Shartnoma predmeti:* ${body.description}\n`;
  const baseTextRu =
    `🆔 *Уникальный ID:* ${body.uniqueId}\n` +
    `📄 *Номер договора:* ${body.contractId}\n` +
    `💰 *Сумма договора:* ${formatAmountByCurrency(body.contractAmount, body.currency, lang)}\n` +
    `💱 *Валюта:* ${body.currency}\n` +
    `🔁 *Курс обмена (на дату создания):* ${formatAmountByCurrency(body.exchangeRate, Currency.UZS, lang)}\n` +
    `📅 *Дата договора:* ${body.contractDate}\n` +
    `👤 *Информация о менеджере:* ${body.info}\n` +
    `📝 *Предмет договора:* ${body.description}\n`;

  const extra = [contractStatusText, actionsStatusText]
    .filter(Boolean)
    .join('\n\n');

  if (confirmationLebel) {
    const confirmationLabelTextUz = `📋 *Quyidagi ma'lumotlarni tasdiqlang:*`;
    const confirmationLabelTextRu = `📋 *Пожалуйста, подтвердите следующие данные:*`;
    return lang === 'uz'
      ? `${baseTextUz}${extra ? '\n' + extra : ''}\n${confirmationLabelTextUz}`
      : `${confirmationLabelTextRu}\n${baseTextRu}${extra ? '\n' + extra : ''}\n${confirmationLabelTextUz}`;
  }

  return lang === 'uz'
    ? `${baseTextUz}${extra ? '\n' + extra : ''}`
    : `${baseTextRu}${extra ? '\n' + extra : ''}`;
}
