import { InlineKeyboard } from 'grammy';
import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';
import { getCurrency } from '../../helpers/get-currency';
import { ContractModel } from '../../models/contract.model';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { DirectorActionModel } from '../../models/director-actions.model';
import { RemainingContractFields } from '../../common/types/contract';
import { getCurrencyRates } from '../../services/get-currency.service';
import { UserRoles } from '../../common/enums/roles.enum';
import { IApprovalContractPayload } from '../../common/interfaces/contract';
import { sendApprovalContractInfoToSheet } from '../../services/contracts-sheet.service';
import { sendTransactionsToSheet } from '../../services/transactions-sheet.service';
import { TransactionType } from '../../common/enums/transaction.enum';
import { ITransaction } from '../../common/interfaces/transactions';
import { TransactionModel } from '../../models/transaction.model';

export async function handleContractRequestConfirmation(ctx: MyContext) {
  try {
    const userId = ctx!.from!.id;
    if (!userId || !ctx.match) return;

    const [user, userActions, directors, currencyRates] = await Promise.all([
      UserModel.findOne({ userId: userId }),
      UserStepModel.findOne({ userId }),
      UserModel.find({ role: 'director' }),
      getCurrencyRates()
    ]);

    await ctx.answerCallbackQuery();

    if (!userActions?.data) return;
    if (!currencyRates) return await ctx.reply('Error in getCurrencyRates');
    if (!directors.length) {
      return await ctx.reply('Directors not found.');
    }
    await ctx.editMessageReplyMarkup(undefined);
    const lang = userActions.data.language;
    if (user!.role === UserRoles.cashier) {
      const createdContract = await ContractModel.create({
        uniqueId: userActions.data.uniqueId,
        contractId: userActions.data.contractId,
        contractAmount: userActions.data.contractAmount,
        currency: userActions.data.currency,
        exchangeRate: currencyRates.buyValue,
        contractDate: userActions.data.contractDate,
        info: userActions.data.info,
        description: userActions.data.description,
        status: ContractStatuses.APPROVED
      });
      const sheetBody: IApprovalContractPayload = {
        uniqueId: createdContract.uniqueId,
        contractId: createdContract.contractId,
        contractAmount: createdContract.contractAmount,
        currency: createdContract.currency,
        exchangeRate: createdContract.exchangeRate,
        contractDate: createdContract.contractDate,
        info: createdContract.info,
        description: createdContract.description,
        directorAction: '',
        cashierAction: '✅'
      };

      const transaction = await TransactionModel.create({
        type: TransactionType.INCOME,
        amount: createdContract.contractAmount,
        contractId: createdContract.contractId,
        currency: createdContract.currency,
        exchangeRate: createdContract.exchangeRate,
        description: createdContract.description,
        createdBy:
          `${user?.userFirstName || ''} ${user?.userLastName || ''}`.trim()
      });

      await Promise.all([
        sendApprovalContractInfoToSheet(ctx, sheetBody),
        sendTransactionsToSheet(ctx, transaction.toObject() as ITransaction)
      ]);

      const {
        uniqueId,
        contractId,
        contractAmount,
        contractDate,
        currency,
        info,
        description,
        managerConfirmationMessageId,
        ...remainingData
      } = userActions.data;

      userActions.data = remainingData as RemainingContractFields;
      userActions.markModified('data');
      await userActions.save();

      return await ctx.reply(
        userActions.data.language === 'uz'
          ? '✅ Shartnoma muvaffaqiyatli yaratildi.'
          : '✅ Договор успешно создан.'
      );
    }

    // 1. Save contract
    await ContractModel.create({
      uniqueId: userActions.data.uniqueId,
      contractId: userActions.data.contractId,
      contractAmount: userActions.data.contractAmount,
      currency: userActions.data.currency,
      exchangeRate: currencyRates.buyValue,
      contractDate: userActions.data.contractDate,
      info: userActions.data.info,
      description: userActions.data.description,
      status: ContractStatuses.SENT,
      managerConfirmationMessageId:
        userActions.data.managerConfirmationMessageId,
      managerUserId: userActions.userId
    });

    await ctx.reply(
      lang === 'uz' ? '📨 Direktorga yuborildi' : '📨 Отправлено директору'
    );

    // 2. Notify directors
    await Promise.all(
      directors.map(async (director) => {
        const directorStep = await UserStepModel.findOne({
          userId: director.userId
        });

        if (!directorStep?.data) return;
        if (!ctx.match) return;

        const dLang = directorStep?.data.language as string;

        const text =
          dLang === 'uz'
            ? `📝 *Yangi shartnoma tasdiqlash uchun yuborildi:*\n\n*📄 Shartnoma raqami:* ${userActions.data.contractId}\n*💰 Shartnoma summasi:* ${userActions.data.contractAmount}\n*💱 Valyuta:* ${userActions.data.currency}\n*🔁 Ayirboshlash kursi:* ${currencyRates.buyValue}\n*📅 Shartnoma sanasi:* ${userActions.data.contractDate}\n*👤 Manager:* ${userActions.data.info}\n*📝 Tavsif:* ${userActions.data.description}`
            : `📝 *Новый контракт отправлен на утверждение:*\n\n*📄 Номер договора:* ${userActions.data.contractId}\n*💰 Сумма договора:* ${userActions.data.contractAmount}\n*💱 Валюта:* ${userActions.data.currency}\n*🔁 Курс обмена:* ${currencyRates.buyValue}\n*📅 Дата договора:* ${userActions.data.contractDate}\n*👤 Менеджер:* ${userActions.data.info}\n*📝 Описание:* ${userActions.data.description}`;

        const keyboard = new InlineKeyboard()
          .text(
            dLang === 'uz' ? "👀 Ko'rib chiqilmoqda" : '👀 В процессе',
            `director_in_progress:${ctx.match[1]}`
          )
          .text(
            dLang === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
            `director_approve:${ctx.match[1]}`
          )
          .text(
            dLang === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
            `director_reject:${ctx.match[1]}`
          );

        const sentMsg = await ctx.api.sendMessage(director.userId, text, {
          reply_markup: keyboard,
          parse_mode: 'Markdown'
        });

        await DirectorActionModel.create({
          contractId: userActions.data.contractId,
          messageId: sentMsg.message_id,
          directorId: director.userId,
          directorName:
            `${director.userFirstName || ''} ${director.userLastName || ''}`.trim()
        });
      })
    );

    const {
      uniqueId,
      contractId,
      contractAmount,
      contractDate,
      currency,
      info,
      description,
      managerConfirmationMessageId,
      ...remainingData
    } = userActions.data;

    userActions.data = remainingData as RemainingContractFields;
    userActions.markModified('data');
    await userActions.save();
  } catch (err) {
    console.error('❌ Error in handleContractRequestConfirmation:', err);
    await ctx.reply('❌ Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.');
  }
}
