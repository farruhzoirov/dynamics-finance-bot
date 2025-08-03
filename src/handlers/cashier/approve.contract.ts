import { MyContext } from '../../bot';
import { ContractModel } from '../../models/contract.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';
import { CashierActionModel } from '../../models/cashier-actions.model';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { TransactionModel } from '../../models/transaction.model';
import { TransactionType } from '../../common/enums/transaction.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';

export async function handleContractApproval(ctx: MyContext) {
  try {
    if (!ctx.match) return;
    const contractId = ctx.match[1];
    const [
      findContract,
      findDirectorActions,
      findCashierActions,
      findUserActions
    ] = await Promise.all([
      ContractModel.findOne({
        contractId: contractId
      }),
      DirectorActionModel.findOne({ contractId: contractId }),
      CashierActionModel.findOne({ contractId: contractId }),
      UserStepModel.findOne({ userId: ctx?.from?.id })
    ]);
    await ctx.answerCallbackQuery();

    if (!findContract) return await ctx.reply("Contract doesn't exist");

    const findManagerActions = await UserStepModel.findOne({
      userId: findContract?.managerUserId
    });

    if (!findManagerActions) return await ctx.reply("Manager doesn't exist");
    let statusSection = '';
    let actionDate = '';

    if (findDirectorActions && findCashierActions) {
      actionDate = new Date().toLocaleString();
      findCashierActions.actionDate = actionDate;
      findCashierActions.markModified(actionDate);
      await findCashierActions.save();

      const statusEmoji = '✅';
      const statusText =
        findManagerActions.data.language === 'uz'
          ? 'Direktor tasdiqlagan'
          : 'Директор одобрил';

      const cashierStatusEmoji = '✅';
      const cashierStatusText =
        findManagerActions.data.language === 'uz'
          ? 'Kassir tasdiqlagan'
          : 'Кассир одобрил';

      statusSection =
        findManagerActions.data.language === 'uz'
          ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${findDirectorActions?.actionDate || "Noma'lum"}\n👤 *Director:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Kassir harakati:*\n${cashierStatusEmoji} *Status:* ${cashierStatusText}\n📅 *Vaqt:* ${actionDate}\n 👤 *Kassir:* ${findCashierActions?.cashierName || 'Cashier'} `
          : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${findDirectorActions?.actionDate || 'Неизвестно'}\n👤 *Директор:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Действие кассира:*\n${cashierStatusEmoji} *Статус:* ${cashierStatusText}\n📅 *Время:* ${actionDate}\n 👤 *Кассир:* ${findCashierActions?.cashierName || 'Cashier'}`;
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

    await ctx.reply(
      findUserActions?.data.language === 'uz'
        ? "✅ O'zgarish managerga yuborildi."
        : '✅ Изменение отправлено менеджеру.'
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
    await ContractModel.findOneAndUpdate(
      { contractId: findContract.contractId },
      {
        $set: {
          status: ContractStatuses.APPROVED
        }
      }
    );
    await UserStepModel.findOneAndUpdate(
      { userId: findManagerActions.userId },
      {
        $set: {
          step: 'main_menu'
        }
      }
    );

    await TransactionModel.create({
      type: TransactionType.INCOME,
      amount: findContract.contractAmount,
      contractId: findContract.contractId,
      currency: findContract.currency,
      exchangeRate: findContract.exchangeRate,
      description: findContract.description,
      createdBy: findContract.info
    });
    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('Error in ApproveContract: Cashir', err);
    await ctx.reply('Error in ApproveContract: Cashier');
  }
}
