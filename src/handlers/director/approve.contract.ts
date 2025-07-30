import { InlineKeyboard } from 'grammy';
import { MyContext } from '../../bot';
import { UserRoles } from '../../common/enums/roles.enum';
import { ContractModel } from '../../models/contract.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';
import { CashierActionModel } from '../../models/cashier-actions.model';
import { formatAmountByCurrency } from '../../helpers/format-amount';

export async function handleContractApproval(ctx: MyContext) {
  try {
    if (!ctx.match) return;
    const contractId = ctx.match[1];
    const [findContract, findDirectorActions, findUserActions, findCashiers] =
      await Promise.all([
        ContractModel.findOne({
          contractId: contractId
        }),
        DirectorActionModel.findOne({ contractId: contractId }),
        UserStepModel.findOne({ userId: ctx?.from?.id }),
        UserModel.find({ role: UserRoles.cashier })
      ]);
    await ctx.answerCallbackQuery();

    if (!findContract) return await ctx.reply("Contract doesn't exist");
    if (!findCashiers.length) return await ctx.reply("Cashier doesn't exist");

    const findManagerActions = await UserStepModel.findOne({
      userId: findContract?.managerUserId
    });

    if (!findManagerActions) return await ctx.reply("Manager doesn't exist");
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

    const updatedText =
      findManagerActions.data.language === 'uz'
        ? `📋 *Quyidagi ma'lumotlarni tasdiqlang:*\n` +
          `🆔 *Unikal ID:* ${findContract.uniqueId}\n` +
          `📄 *Shartnoma raqami:* ${findContract.contractId}\n` +
          `💰 *Shartnoma summasi:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}\n` +
          `💱 *Valyuta:* ${findContract.currency}\n` +
          `🔁 *Ayirboshlash kursi:* ${findContract.exchangeRate}\n` +
          `📅 *Shartnoma sanasi:* ${findContract.contractDate}\n` +
          `👤 *Manager haqida ma'lumot:* ${findContract.info}\n` +
          `📝 *Tavsif:* ${findContract.description}\n\n` +
          `${statusSection}`
        : `📋 *Пожалуйста, подтвердите следующие данные:*\n` +
          `🆔 *Уникальный ID:* ${findContract.uniqueId}\n` +
          `📄 *Номер договора:* ${findContract.contractId}\n` +
          `💰 *Сумма договора:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}\n` +
          `💱 *Валюта:* ${findContract.currency}\n` +
          `🔁 *Курс обмена:* ${findContract.exchangeRate}\n` +
          `📅 *Дата договора:* ${findContract.contractDate}\n` +
          `👤 *Информация о менеджере:* ${findContract.info}\n` +
          `📝 *Описание:* ${findContract.description}\n\n` +
          `${statusSection}`;

    await ctx.api.editMessageText(
      findContract!.managerUserId!.toString(),
      findContract!.managerConfirmationMessageId!,
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
            ? `📋 *Yangi tasdiqlangan shartnoma:*\n` +
              `🆔 *Unikal ID:* ${findContract.uniqueId}\n` +
              `📄 *Shartnoma raqami:* ${findContract.contractId}\n` +
              `💰 *Shartnoma summasi:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}\n` +
              `💱 *Valyuta:* ${findContract.currency}\n` +
              `🔁 *Ayirboshlash kursi:* ${findContract.exchangeRate}\n` +
              `📅 *Shartnoma sanasi:* ${findContract.contractDate}\n` +
              `👤 *Manager haqida ma'lumot:* ${findContract.info}\n` +
              `📝 *Tavsif:* ${findContract.description}\n\n` +
              `✅ *Tasdiqlovchi direktor:* ${findDirectorActions?.directorName || 'Director'}\n` +
              `📅 *Tasdiqlangan vaqt:* ${actionDate}`
            : `📋 *Новый одобренный контракт:*\n` +
              `🆔 *Уникальный ID:* ${findContract.uniqueId}\n` +
              `📄 *Номер договора:* ${findContract.contractId}\n` +
              `💰 *Сумма договора:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}\n` +
              `💱 *Валюта:* ${findContract.currency}\n` +
              `🔁 *Курс обмена:* ${findContract.exchangeRate}\n` +
              `📅 *Дата договора:* ${findContract.contractDate}\n` +
              `👤 *Информация о менеджере:* ${findContract.info}\n` +
              `📝 *Описание:* ${findContract.description}\n\n` +
              `✅ *Директор, одобривший договора:* ${findDirectorActions?.directorName || 'Director'}\n` +
              `📅 *Время одобрения:* ${actionDate}`;

        const cashierKeyboard = new InlineKeyboard()
          .text(
            cashierLang === 'uz' ? "👀 Ko'rib chiqilmoqda" : '👀 В процессе',
            `cashier_in_progress:${findContract.contractId}`
          )
          .text(
            cashierLang === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
            `cashier_approve:${findContract.contractId}`
          )
          .text(
            cashierLang === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
            `cashier_reject:${findContract.contractId}`
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
          contractId: findContract.contractId,
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
      findContract!.managerUserId!.toString(),
      confirmationText,
      {
        reply_to_message_id: findContract.managerConfirmationMessageId
      }
    );

    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('Error in ApproveContract: Director', err);
    await ctx.reply('Error in ApproveContract: Director');
  }
}
