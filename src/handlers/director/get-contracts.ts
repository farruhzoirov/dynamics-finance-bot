import { MyContext } from '../../bot';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { ContractModel } from '../../models/contract.model';
import { UserStepModel } from '../../models/user-step.model';
import { InlineKeyboard } from 'grammy';

export async function handleGettingContracts(ctx: MyContext) {
  const userId = ctx.from?.id;
  // const limit = 5;
  // const skip =
  if (!userId) return;
  const userActions = await UserStepModel.findOne({ userId });
  const lang = userActions?.data?.language === 'uz' ? 'uz' : 'ru';
  await ctx.answerCallbackQuery();
  const contracts = await ContractModel.find({
    status: { $in: [ContractStatuses.APPROVED, ContractStatuses.CLOSED] }
  }).sort({ createdAt: -1 });

  if (!contracts.length) {
    return await ctx.reply(
      lang === 'uz' ? 'Shartnomalar mavjud emas!' : 'Контрактов не найдено!'
    );
  }

  return sendContractPage(ctx, contracts, 0, lang);
}

export async function sendContractPage(
  ctx: MyContext,
  contracts: any[],
  page: number,
  lang: 'uz' | 'ru',
  isEdit = false
) {
  const PAGE_SIZE = 5;
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedContracts = contracts.slice(start, end);

  const totalPages = Math.ceil(contracts.length / PAGE_SIZE);

  const text = paginatedContracts
    .map((c, i) => {
      const statusText = getStatusText(c.status, lang);

      if (lang === 'uz') {
        return `📄${c.uniqueId} <b>Shartnoma:</b> ${c.contractId} | ${statusText} | 💰 ${formatAmountByCurrency(c.contractAmount, c.currency, lang)} | 💱 ${c.exchangeRate} | 📅 ${c.contractDate} | ℹ️ ${c.info} | 📝 ${c.description}`;
      } else {
        return `📄${c.uniqueId} <b>Договор:</b> ${c.contractId} | ${statusText} | 💰 ${formatAmountByCurrency(c.contractAmount, c.currency, lang)} | 💱 ${c.exchangeRate} | 📅 ${c.contractDate} | ℹ️ ${c.info} | 📝 ${c.description}`;
      }
    })
    .join('\n\n');

  const keyboard = new InlineKeyboard();

  if (page > 0) {
    keyboard.text(lang === 'uz' ? '⬅️ Oldingi' : '⬅️ Назад', `prev_${page}`);
  }

  if (page < totalPages - 1) {
    keyboard.text(lang === 'uz' ? 'Keyingi ➡️' : 'Вперёд ➡️', `next_${page}`);
  }

  keyboard.row();
  keyboard.text(lang === 'uz' ? '🔍 Qidirish' : '🔍 Поиск', 'search_contract');

  if (isEdit) {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }
}

export const getStatusText = (status: string, lang: string) => {
  const statusMap: Record<string, { uz: string; ru: string; emoji: string }> = {
    [ContractStatuses.APPROVED]: {
      uz: 'Tasdiqlangan',
      ru: 'Утверждён',
      emoji: '✅'
    },
    [ContractStatuses.CLOSED]: {
      uz: 'Yopilgan',
      ru: 'Закрыт',
      emoji: '🔒'
    }
  };
  const item = statusMap[status] || { uz: status, ru: status, emoji: '' };
  return `${item.emoji} ${lang === 'uz' ? item.uz : item.ru}`;
};
