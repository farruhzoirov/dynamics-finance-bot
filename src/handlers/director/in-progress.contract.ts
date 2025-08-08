import { MyContext } from '../../bot';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { formatAmountByCurrency } from '../../helpers/format-amount';
import { ContractModel } from '../../models/contract.model';
import { DirectorActionModel } from '../../models/director-actions.model';
import { UserStepModel } from '../../models/user-step.model';

// Director Actions are contract based actions actually.
// User Actions are actions that interact with bot .

export async function handleInProgressContractConfirmation(ctx: MyContext) {
  if (!ctx.match) return;
  const contractId = ctx.match[1];
  const [findContract, findDirectorActions, findUserActions] =
    await Promise.all([
      ContractModel.findOne({
        contractId: contractId
      }),
      DirectorActionModel.findOne({ contractId: contractId }),
      UserStepModel.findOne({ userId: ctx?.from?.id })
    ]);

  if (!findContract) return await ctx.reply("Contract doesn't exist");

  const findManagerActions = await UserStepModel.findOne({
    userId: findContract?.managerUserId
  });

  if (!findManagerActions) return await ctx.reply("Manager doesn't exist");
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
📝 *Shartnoma predmeti:* ${findContract.description}

${statusSection}

`
      : `📋 *Пожалуйста, подтвердите следующие данные:*\n
🆔 *Уникальный ID:* ${findContract.uniqueId}
📄 *Номер договора:* ${findContract.contractId}
💰 *Сумма договора:* ${formatAmountByCurrency(findContract.contractAmount, findContract.currency, findManagerActions.data.language)}
💱 *Валюта:* ${findContract.currency}
🔁 *Курс обмена:* ${findContract.exchangeRate}
📅 *Дата договора:* ${findContract.contractDate}
👤 *Информация о менеджере:* ${findContract.info}
📝 *Предмет договора:* ${findContract.description}

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
      ? "✅ O'zgarish managerga yuborildi."
      : '✅ Изменение отправлено менеджеру'
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
        status: ContractStatuses.IN_PROGRESS
      }
    }
  );
}
