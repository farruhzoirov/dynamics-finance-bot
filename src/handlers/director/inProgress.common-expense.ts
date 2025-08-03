import { MyContext } from '../../bot';
import { CommonExpenseStatuses } from '../../common/enums/common-expense.enum';
import { TransactionType } from '../../common/enums/transaction.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { CommonExpenseModel } from '../../models/common-expenses.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';

// Director Actions are contract based actions actually.
// User Actions are actions that interact with bot .

export async function handleInProgressCommonExpenseConfirmation(
  ctx: MyContext
) {
  if (!ctx.match) return;

  const uniqueId = ctx.match[1];
  const expenseType = ctx.match[2] as TransactionType;
  const contractId = ctx.match[3] || null;

  const [commonExpense, findDirectorActions, findUserActions] =
    await Promise.all([
      CommonExpenseModel.findOne({ uniqueId, expenseType }),
      DirectorActionModel.findOne({ expenseTypeId: uniqueId, expenseType }),
      UserStepModel.findOne({ userId: ctx.from?.id })
    ]);

  await ctx.answerCallbackQuery();

  if (!commonExpense) {
    return await ctx.reply("📛 CommonExpense doesn't exist.");
  }

  const findManagerActions = await UserStepModel.findOne({
    userId: commonExpense.managerUserId
  });

  if (!findManagerActions) {
    return await ctx.reply("📛 ManagerSteps doesn't exist.");
  }

  const lang = findManagerActions.data.language;
  let statusSection = '';

  if (findDirectorActions) {
    const actionDate = new Date().toLocaleString();
    const statusEmoji = '👀';
    const statusText =
      findManagerActions.data.language === 'uz'
        ? "Ko'rib chiqilmoqda"
        : 'В процессе';

    statusSection =
      findManagerActions.data.language === 'uz'
        ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${actionDate}\n👤 *Director:* ${findDirectorActions.directorName || 'Director'}`
        : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${actionDate}\n👤 *Директор:* ${findDirectorActions.directorName || 'Director'}`;
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
    commonExpense!.managerUserId!.toString(),
    commonExpense!.managerConfirmationMessageId!,
    updatedText,
    {
      parse_mode: 'Markdown'
    }
  );

  await ctx.reply(
    findUserActions?.data.language === 'uz'
      ? "✅ O'zgarish managerga yuborildi."
      : '✅ Изменение отправлено менеджеру'
  );

  const confirmationText =
    findManagerActions.data.language === 'uz'
      ? '✅ Status yangilandi.'
      : '✅ Статус обновлён.';

  await ctx.api.sendMessage(
    commonExpense!.managerUserId!.toString(),
    confirmationText,
    {
      reply_to_message_id: commonExpense.managerConfirmationMessageId
    }
  );
  await CommonExpenseModel.findOneAndUpdate(
    {
      uniqueId: commonExpense.uniqueId,
      expenseType: commonExpense.expenseType
    },
    {
      $set: {
        status: CommonExpenseStatuses.IN_PROGRESS
      }
    }
  );
}
