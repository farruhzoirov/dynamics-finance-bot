import { InlineKeyboard } from 'grammy';
import { MyContext } from '../../bot';
import { UserRoles } from '../../common/enums/roles.enum';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';
import { CashierActionModel } from '../../models/cashier-actions.model';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { CommonExpenseModel } from '../../models/common-expenses.model';
import { TransactionType } from '../../common/enums/transaction.enum';

export async function handleCommonExpenseApproval(ctx: MyContext) {
  try {
    if (!ctx.match) return;
    const uniqueId = ctx.match[1];
    const expenseType = ctx.match[2] as TransactionType;
    const contractId = ctx.match[3] || null;

    const [commonExpense, findDirectorActions, findUserActions, findCashiers] =
      await Promise.all([
        CommonExpenseModel.findOne({ uniqueId, expenseType }),
        DirectorActionModel.findOne({ expenseTypeId: uniqueId, expenseType }),
        UserStepModel.findOne({ userId: ctx.from?.id }),
        UserModel.find({ role: UserRoles.cashier })
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
    if (!findCashiers.length) {
      return await ctx.reply("Cashiers don't exist.");
    }
    const lang = findManagerActions.data.language;

    let statusSection = '';
    let actionDate = '';

    if (findDirectorActions) {
      actionDate = new Date().toLocaleString();
      findDirectorActions.actionDate = actionDate;
      findDirectorActions.markModified(actionDate);
      await findDirectorActions.save();

      const statusEmoji = '✅';
      const statusText =
        findManagerActions.data.language === 'uz'
          ? 'Direktor tasdiqlagan'
          : 'Директор одобрил';

      const sentToCashierText =
        findManagerActions.data.language === 'uz'
          ? '📤 Kassirga yuborildi'
          : '📤 Отправлено кассиру';

      statusSection =
        findManagerActions.data.language === 'uz'
          ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${actionDate}\n👤 *Director:* ${findDirectorActions.directorName || 'Director'}\n\n\n${sentToCashierText}`
          : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${actionDate}\n👤 *Директор:* ${findDirectorActions.directorName || 'Director'}\n\n\n${sentToCashierText}`;
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

    await Promise.all(
      findCashiers.map(async (cashier) => {
        const cashierActions = await UserStepModel.findOne({
          userId: cashier.userId
        });

        if (!cashierActions) return;

        const cashierLang = cashierActions.data?.language || 'ru';

        const cashierMessage =
          cashierLang === 'uz'
            ? `✅ *Ma'lumotlar qabul qilindi!*\n\n` +
              `📄 *Tavsif:* ${commonExpense.description}\n` +
              `💵 *Miqdor:* ${formattedAmount}\n` +
              `🏷 *Chiqim turi:* ${expenseLabel}\n` +
              `👤 *Manager:* ${commonExpense.managerInfo}\n${contractBasedText}\n\n` +
              `✅ *Tasdiqlovchi direktor:* ${findDirectorActions?.directorName || 'Director'}\n\n` +
              `📅 *Tasdiqlangan vaqt:* ${actionDate}`
            : `✅ *Данные получены!*\n\n` +
              `📄 *Описание:* ${commonExpense.description}\n` +
              `💵 *Сумма:* ${formattedAmount}\n` +
              `🏷 *Тип расхода:* ${expenseLabel}\n` +
              `👤 *Manager:* ${commonExpense.managerInfo}\n${contractBasedText}\n\n` +
              `✅ *Директор, одобривший договора:* ${findDirectorActions?.directorName || 'Director'}\n\n` +
              `📅 *Время одобрения:* ${actionDate}`;

        const cashierKeyboard = new InlineKeyboard()
          .text(
            cashierLang === 'uz' ? "👀 Ko'rib chiqilmoqda" : '👀 В процессе',
            `common_expense_cashier_in_progress:${ctx!.match![1]}:${ctx!.match![2]}:${contractId}`
          )
          .text(
            cashierLang === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
            `common_expense_cashier_approve:${ctx!.match![1]}:${ctx!.match![2]}:${contractId}`
          )
          .text(
            cashierLang === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
            `common_expense_cashier_reject:${ctx!.match![1]}:${ctx!.match![2]}:${contractId}`
          );

        const sentMsg = await ctx.api.sendMessage(
          cashier.userId.toString(),
          cashierMessage,
          {
            reply_markup: cashierKeyboard,
            parse_mode: 'Markdown'
          }
        );

        await CashierActionModel.create({
          expenseTypeId: commonExpense.uniqueId,
          expenseType: expenseType,
          messageId: sentMsg.message_id,
          cashierId: cashier.userId,
          cashierName:
            `${cashier.userFirstName || ''} ${cashier.userLastName || ''}`.trim()
        });
      })
    );

    await ctx.reply(
      findUserActions?.data.language === 'uz'
        ? "✅ O'zgarish managerga va kassirga yuborildi."
        : '✅ Изменение отправлено менеджеру и кассиру.'
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

    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('Error in handleCommonExpenseApproval: Director', err);
    await ctx.reply('Error in handleCommonExpenseApproval: Director');
  }
}
