import { bot, MyContext } from '../../bot';
import { getBalanceHandler } from '../../handlers/balance';
import { handleInProgressContractConfirmation } from '../../handlers/director/in-progress.contract';
import { handleContractRejection } from '../../handlers/director/reject.contract';
import { handleContractApproval } from '../../handlers/director/approve.contract';
import { handleCommonExpenseRejection } from '../../handlers/director/reject.common-expense';
import { handleInProgressCommonExpenseConfirmation } from '../../handlers/director/inProgress.common-expense';
import { handleCommonExpenseApproval } from '../../handlers/director/approve.common-expense';
import { handleGettingContracts } from '../../handlers/director/get-contracts';
import { handlePagination } from '../../handlers/director/handle-pagination';
import { handleSearchingContracts } from '../../handlers/director/search-contracts';
import { NextFunction } from 'grammy';
import { UserStepModel } from '../../models/user-step.model';
import { ContractModel } from '../../models/contract.model';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { DirectorActionModel } from '../../models/director-actions.model';
import { CashierActionModel } from '../../models/cashier-actions.model';

bot.callbackQuery(
  /^director_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^director_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^director_reject:(.+)$/, handleContractRejection);

bot.callbackQuery(
  /^director_in_progress_common_expense:([^:]+):([^:]+)$/,
  handleInProgressCommonExpenseConfirmation
);
bot.callbackQuery(
  /^director_approve_common_expense:([^:]+):([^:]+)$/,
  handleCommonExpenseApproval
);
bot.callbackQuery(
  /^director_reject_common_expense:([^:]+):([^:]+)$/,
  handleCommonExpenseRejection
);

bot.callbackQuery('balance', getBalanceHandler);

bot.callbackQuery('contracts_director', handleGettingContracts);

bot.callbackQuery(/^(prev|next)_\d+$/, handlePagination);

bot.callbackQuery('search_contract', handleSearchingContracts);

bot.on('message:text', async (ctx: MyContext, next: NextFunction) => {
  const userId = ctx!.from!.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

  if (userActions.step === 'search_contract') {
    const searchText = ctx!.message!.text as string;
    const lang = userActions.data?.language === 'uz' ? 'uz' : 'ru';
    const isNumeric = /^\d+$/.test(searchText);

    if (!isNumeric) {
      return await ctx.reply(
        lang === 'uz'
          ? 'Iltimos, to‘g‘ri formatda shartnoma raqami yoki unikal Idsini kiriting. (Masalan: 1000 yoki 12)'
          : 'Пожалуйста, введите номер контракта или уникальный ID в правильном формате. (например: 1000 или 12).'
      );
    }

    const id = parseInt(searchText, 10);
    const findContract = await ContractModel.findOne({
      $or: [
        {
          contractId: id
        },
        {
          uniqueId: id
        }
      ]
    });

    if (!findContract) {
      userActions.step = 'main_menu';
      userActions.markModified('step');
      await userActions.save();
      return await ctx.reply(
        lang === 'uz' ? 'Shartnoma mavjud emas!' : 'Контракт не найдено!'
      );
    }

    const [findDirectorActions, findCashierActions] = await Promise.all([
      DirectorActionModel.findOne({ contractId: findContract.contractId }),
      CashierActionModel.findOne({ contractId: findContract.contractId })
    ]);

    const statusEmoji = '✅';
    const statusText =
      lang === 'uz' ? 'Direktor tasdiqlagan' : 'Директор одобрил';

    const cashierStatusEmoji = '✅';
    const cashierStatusText =
      lang === 'uz' ? 'Kassir tasdiqlagan' : 'Кассир одобрил';

    const statusSection =
      lang === 'uz'
        ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${findDirectorActions?.actionDate || "Noma'lum"}\n👤 *Director:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Kassir harakati:*\n${cashierStatusEmoji} *Status:* ${cashierStatusText}\n📅 *Vaqt:* ${findCashierActions?.actionDate || "Noma'lum"}\n 👤 *Kassir:* ${findCashierActions?.cashierName || 'Cashier'} `
        : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${findDirectorActions?.actionDate || 'Неизвестно'}\n👤 *Директор:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Действие кассира:*\n${cashierStatusEmoji} *Статус:* ${cashierStatusText}\n📅 *Время:* ${findCashierActions?.actionDate || 'Неизвестно'}\n 👤 *Кассир:* ${findCashierActions?.cashierName || 'Cashier'}`;

    const text =
      lang === 'uz'
        ? `🆔 *Unikal ID:* ${findContract.uniqueId}\n` +
          `📄 *Shartnoma raqami:* ${findContract.contractId}\n` +
          `💰 *Shartnoma summasi:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, lang)}\n` +
          `💱 *Valyuta:* ${findContract.currency}\n` +
          `🔁 *Ayirboshlash kursi:* ${findContract.exchangeRate}\n` +
          `📅 *Shartnoma sanasi:* ${findContract.contractDate}\n` +
          `👤 *Manager haqida ma'lumot:* ${findContract.info}\n` +
          `📝 *Tavsif:* ${findContract.description}\n\n` +
          `${statusSection}`
        : `🆔 *Уникальный ID:* ${findContract.uniqueId}\n` +
          `📄 *Номер договора:* ${findContract.contractId}\n` +
          `💰 *Сумма договора:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, lang)}\n` +
          `💱 *Валюта:* ${findContract.currency}\n` +
          `🔁 *Курс обмена:* ${findContract.exchangeRate}\n` +
          `📅 *Дата договора:* ${findContract.contractDate}\n` +
          `👤 *Информация о менеджере:* ${findContract.info}\n` +
          `📝 *Описание:* ${findContract.description}\n\n` +
          `${statusSection}`;

    await ctx.reply(text, {
      parse_mode: 'Markdown'
    });
  }

  await next();
});
