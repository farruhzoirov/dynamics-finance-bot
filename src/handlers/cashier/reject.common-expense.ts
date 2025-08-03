import { MyContext } from '../../bot';
import { CommonExpenseStatuses } from '../../common/enums/common-expense.enum';
import { TransactionType } from '../../common/enums/transaction.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { CashierActionModel } from '../../models/cashier-actions.model';
import { CommonExpenseModel } from '../../models/common-expenses.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';

export async function handleCommonExpenseRejection(ctx: MyContext) {
  try {
    if (!ctx.match) return;
    const uniqueId = parseInt(ctx.match[1]);
    const expenseType = ctx.match[2] as TransactionType;
    const contractId = ctx.match[3] || null;

    const [
      commonExpense,
      findDirectorActions,
      findCashierActions,
      findUserActions
    ] = await Promise.all([
      CommonExpenseModel.findOne({
        uniqueId: uniqueId,
        expenseType: expenseType
      }),
      DirectorActionModel.findOne({ expenseTypeId: uniqueId, expenseType }),
      CashierActionModel.findOne({ expenseTypeId: uniqueId, expenseType }),
      UserStepModel.findOne({ userId: ctx.from?.id })
    ]);

    await ctx.answerCallbackQuery();

    if (!commonExpense) {
      return await ctx.reply("CommonExpense doesn't exist.");
    }

    const findManagerActions = await UserStepModel.findOne({
      userId: commonExpense.managerUserId
    });

    if (!findManagerActions) {
      return await ctx.reply("ManagerSteps doesn't exist.");
    }

    const lang = findManagerActions.data.language;
    let statusSection = '';

    if (findDirectorActions) {
      const actionDate = new Date().toLocaleString();
      const statusEmoji = '✅';
      const statusText =
        findManagerActions.data.language === 'uz'
          ? 'Direktor tasdiqlagan'
          : 'Директор одобрил';

      const cashierStatusEmoji = '❌';
      const cashierStatusText =
        findManagerActions.data.language === 'uz'
          ? 'Bekor qilindi.'
          : 'Отменено.';

      statusSection =
        lang === 'uz'
          ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${findDirectorActions.actionDate}\n👤 *Director:* ${findDirectorActions.directorName || 'Director'} \n\n🔔 *Kassir harakati:*\n${cashierStatusEmoji} *Status:* ${cashierStatusText}\n📅 *Vaqt:* ${actionDate}\n 👤 *Kassir:* ${findCashierActions?.cashierName || 'Cashier'}`
          : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${findDirectorActions.actionDate}\n👤 *Директор:* ${findDirectorActions.directorName || 'Director'}\n\n🔔 *Действие кассира:*\n${cashierStatusEmoji} *Статус:* ${cashierStatusText}\n📅 *Время:* ${actionDate}\n 👤 *Кассир:* ${findCashierActions?.cashierName || 'Cashier'}`;
    }

    const expenseLabel = getExpenseTypeLabel(expenseType, lang);
    const formattedAmount = formatAmountByCurrency(
      commonExpense.amount,
      commonExpense.currency,
      lang
    );

    let contractBasedText = '';
    if (contractId) {
      contractBasedText =
        findManagerActions.data.language === 'uz'
          ? `📄*Shartnoma raqami:* ${contractId}`
          : `📄*Номер договора:* ${contractId}`;
    }

    const updatedText =
      lang === 'uz'
        ? `✅ *Ma'lumotlar qabul qilindi!*\n\n` +
          `📄 *Tavsif:* ${commonExpense.description}\n` +
          `💵 *Miqdor:* ${formattedAmount}\n` +
          `🏷 *Chiqim turi:* ${expenseLabel}\n` +
          `👤 *Manager:* ${commonExpense.managerInfo}\n${contractBasedText}\n\n` +
          `${statusSection}`
        : `✅ *Данные получены!*\n\n` +
          `📄 *Описание:* ${commonExpense.description}\n` +
          `💵 *Сумма:* ${formattedAmount}\n` +
          `🏷 *Тип расхода:* ${expenseLabel}\n` +
          `👤 *Менеджер:* ${commonExpense.managerInfo}\n${contractBasedText}\n\n` +
          `${statusSection}`;

    await ctx.api.editMessageText(
      commonExpense.managerUserId.toString(),
      commonExpense.managerConfirmationMessageId!,
      updatedText,
      { parse_mode: 'Markdown' }
    );

    await ctx.reply(
      findUserActions?.data.language === 'uz'
        ? '❌ Bekor qilindi ✅ O‘zgarish managerga yuborildi.'
        : '❌ Отменено  ✅ Изменение отправлено менеджеру.'
    );

    const statusConfirm =
      lang === 'uz' ? '✅ Status yangilandi.' : '✅ Статус обновлён.';

    await ctx.api.sendMessage(
      commonExpense.managerUserId.toString(),
      statusConfirm,
      {
        reply_to_message_id: commonExpense.managerConfirmationMessageId
      }
    );

    await CommonExpenseModel.findOneAndUpdate(
      { uniqueId: commonExpense.uniqueId, expenseType },
      { $set: { status: CommonExpenseStatuses.CANCELLED } }
    );

    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('❌ Error in handleCommonExpenseRejection: Cashier', err);
    await ctx.reply('❌ Error in handleCommonExpenseRejection: Cashier');
  }
}
