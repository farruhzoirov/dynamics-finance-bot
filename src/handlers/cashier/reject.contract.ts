import { MyContext } from '../../bot';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { CashierActionModel } from '../../models/cashier-actions.model';
import { ContractModel } from '../../models/contract.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';

export async function handleContractRejection(ctx: MyContext) {
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
    if (!findDirectorActions)
      return await ctx.reply("Director Actions doesn't exist");
    if (!findCashierActions)
      return await ctx.reply("Cashier Actions doesn't exist");
    const findManagerActions = await UserStepModel.findOne({
      userId: findContract?.managerUserId
    });

    if (!findManagerActions) return await ctx.reply("Manager doesn't exist");
    let statusSection = '';

    if (findDirectorActions && findCashierActions) {
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
        findManagerActions.data.language === 'uz'
          ? `🔔 *Director harakati:*\n${statusEmoji} *Status:* ${statusText}\n📅 *Vaqt:* ${findDirectorActions?.actionDate || "Noma'lum"}\n👤 *Director:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Kassir harakati:*\n${cashierStatusEmoji} *Status:* ${cashierStatusText}\n📅 *Vaqt:* ${actionDate}\n 👤 *Kassir:* ${findCashierActions?.cashierName || 'Cashier'} `
          : `🔔 *Действие директора:*\n${statusEmoji} *Статус:* ${statusText}\n📅 *Время:* ${findDirectorActions?.actionDate || 'Неизвестно'}\n👤 *Директор:* ${findDirectorActions?.directorName || 'Director'}\n\n🔔 *Действие кассира:*\n${cashierStatusEmoji} *Статус:* ${cashierStatusText}\n📅 *Время:* ${actionDate}\n 👤 *Кассир:* ${findCashierActions?.cashierName || 'Cashier'}`;
    }

    const updatedText =
      findManagerActions.data.language === 'uz'
        ? `📋 *Quyidagi ma'lumotlarni tasdiqlang:*\n
  🆔 *Unikal ID:* ${findContract.uniqueId}
  📄 *Shartnoma raqami:* ${findContract.contractId}
  💰 *Shartnoma summasi:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}
  💱 *Valyuta:* ${findContract.currency}
  🔁 *Ayirboshlash kursi:* ${findContract.exchangeRate}
  📅 *Shartnoma sanasi:* ${findContract.contractDate}
  👤 *Manager haqida ma'lumot:* ${findContract.info}
  📝 *Tavsif:* ${findContract.description}
  
  ${statusSection}
  
  `
        : `📋 *Пожалуйста, подтвердите следующие данные:*\n
  🆔 *Уникальный ID:* ${findContract.uniqueId}
  📄 *Номер договора:* ${findContract.contractId}
  💰 *Сумма договора:*${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}
  💱 *Валюта:* ${findContract.currency}
  🔁 *Курс обмена:* ${findContract.exchangeRate}
  📅 *Дата договора:* ${findContract.contractDate}
  👤 *Информация о менеджере:* ${findContract.info}
  📝 *Описание:* ${findContract.description}
  
  ${statusSection}
  `;

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
        ? "Bekor qilindi. ✅ O'zgarish managerga yuborildi."
        : 'Отменено. ✅ Изменение отправлено менеджеру'
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
          status: ContractStatuses.CANCELLED
        }
      }
    );
    await ctx.editMessageReplyMarkup(undefined);
  } catch (err) {
    console.error('Error in RejectContract: Cashier', err);
    await ctx.reply('Error in RejectContract: Cashier');
  }
}
