import { MyContext } from '../../bot';
import { UserRoles } from '../../common/enums/roles.enum';
import { CommonExpenseModel } from '../../models/common-expenses.model';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';
import { getCurrency } from '../../helpers/get-currency';
import { CommonExpenseStatuses } from '../../common/enums/common-expense.enum';
import { DirectorActionModel } from '../../models/director-actions.model';
import { InlineKeyboard } from 'grammy';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { Languages } from '../../common/types/languages';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { TransactionType } from '../../common/enums/transaction.enum';

export async function handleCommonExpenseRequestConfirmation(ctx: MyContext) {
  try {
    const userId = ctx!.from!.id;
    console.log(ctx.match);
    if (!ctx.match) return;
    const uniqueId = parseInt(ctx.match[1]);
    const commonExpenseType = ctx.match[2] as TransactionType;
    const contractId = ctx.match[3] ? parseInt(ctx.match[3]) : null;
    const [userActions, findDirectors, exchangeRate] = await Promise.all([
      UserStepModel.findOne({ userId: userId }),
      UserModel.find({ role: UserRoles.director }),
      getCurrency()
    ]);

    if (!userActions) return;
    if (!findDirectors.length) return await ctx.reply("Directors don't exist");

    await ctx.answerCallbackQuery();

    const {
      type,
      expenseType,
      commonExpenseAmount,
      commonExpenseCurrency,
      managerInfo,
      commonExpenseDescription,
      commonExpenseConfirmationMessageId,
      // expenseBasedContractId,
      ...rest
    } = userActions.data;

    await CommonExpenseModel.create({
      uniqueId,
      contractId: contractId,
      expenseType: commonExpenseType,
      amount: commonExpenseAmount,
      currency: commonExpenseCurrency,
      exchangeRate,
      managerInfo,
      description: commonExpenseDescription,
      status: CommonExpenseStatuses.SENT,
      managerConfirmationMessageId: commonExpenseConfirmationMessageId,
      managerUserId: userId
    });

    await ctx.reply(
      userActions.data.language === 'uz'
        ? '📨 Direktorga yuborildi'
        : '📨 Отправлено директору'
    );

    await Promise.all(
      findDirectors.map(async (director) => {
        const directorStep = await UserStepModel.findOne({
          userId: director.userId
        });

        if (!directorStep?.data) return;
        if (!ctx.match) return;

        const dLang = directorStep.data.language as Languages;
        const expenseTypeLabel = getExpenseTypeLabel(commonExpenseType, dLang);
        let contractBasedText = '';
        if (contractId) {
          contractBasedText =
            userActions.data.language === 'uz'
              ? `📄*Shartnoma raqami:* ${contractId.toString()}`
              : `📄*Номер договора:* ${contractId.toString()}`;
        }

        const text =
          dLang === 'uz'
            ? `✅ *Ma'lumotlar qabul qilindi!*\n\n*📄 Tavsif:* ${commonExpenseDescription}\n*💵 Miqdor:* ${formatAmountByCurrency(commonExpenseAmount, commonExpenseCurrency, dLang)} \n*🏷 Chiqim turi:* ${expenseTypeLabel}\n*👤 Manager:* ${managerInfo}\n${contractBasedText}\n\nTasdiqlaysizmi?`
            : `✅ *Данные получены!*\n\n*📄 Описание:* ${commonExpenseDescription}\n*💵 Сумма:* ${formatAmountByCurrency(commonExpenseAmount, commonExpenseCurrency, dLang)} \n*🏷 Тип расхода:* ${expenseTypeLabel}\n*👤 Менеджер:* ${managerInfo}\n${contractBasedText}\n\nХотите подтвердить?`;

        const keyboard = new InlineKeyboard()
          .text(
            dLang === 'uz' ? "👀 Ko'rib chiqilmoqda" : '👀 В процессе',
            `director_in_progress_common_expense:${ctx.match[1]}:${ctx.match[2]}:${ctx.match[3] || null}`
          )
          .text(
            dLang === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
            `director_approve_common_expense:${ctx.match[1]}:${ctx.match[2]}:${ctx.match[3] || null}`
          )
          .text(
            dLang === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
            `director_reject_common_expense:${ctx.match[1]}:${ctx.match[2]}:${ctx.match[3] || null}`
          );

        const sentMsg = await ctx.api.sendMessage(director.userId, text, {
          reply_markup: keyboard,
          parse_mode: 'Markdown'
        });

        await DirectorActionModel.create({
          expenseTypeId: uniqueId,
          expenseType: commonExpenseType,
          messageId: sentMsg.message_id,
          directorId: director.userId,
          directorName:
            `${director.userFirstName || ''} ${director.userLastName || ''}`.trim()
        });
        userActions.data = rest;
        userActions.markModified('data');
        await userActions.save();
      })
    );
    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('Error in handleCommonExpenseConfirmation', err);
  }
}
