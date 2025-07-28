import { InlineKeyboard } from 'grammy';
import { MyContext } from '../../bot';
import { UserStepModel } from '../../models/user-step.model';
import { UserModel } from '../../models/user.model';
import { getCurrency } from '../../helpers/get-currency';
import { ContractModel } from '../../models/contract.model';
import { ContractStatuses } from '../../common/enums/contract-status.enum';

export async function handleContractRequestConfirmation(ctx: MyContext) {
  try {
    const userId = ctx?.from?.id;
    const [userActions, directors, exchangeRate] = await Promise.all([
      UserStepModel.findOne({ userId: userId }),
      UserModel.find({ role: 'director' }),
      getCurrency()
    ]);

    await ctx.answerCallbackQuery();

    if (!ctx.match) return;

    if (!directors.length) {
      return await ctx.reply('Directors not found.');
    }

    if (!userActions?.data) return;

    const lang = userActions.data.language;

    await ContractModel.create({
      uniqueId: userActions.data.uniqueId,
      contractId: userActions.data.contractId,
      contractAmount: userActions.data.contractAmount,
      currency: userActions.data.currency,
      exchangeRate: exchangeRate,
      contractDate: userActions.data.contractDate,
      info: userActions.data.info,
      description: userActions.data.description,
      status: ContractStatuses.SENT
    });

    await ctx.reply(
      lang === 'uz' ? '📨 Direktorga yuborildi' : '📨 Отправлено директору'
    );

    await Promise.all([
      directors.map(async (director) => {
        const findDirectorActions = await UserStepModel.findOne({
          userId: director.userId
        });

        if (!findDirectorActions) return;

        const directorLang = findDirectorActions?.data?.language;

        const text =
          directorLang === 'uz'
            ? `📝 Yangi shartnoma tasdiqlash uchun yuborildi:\n\n📄 Shartnoma ID: ${userActions.data.contractId}\n💰 Shartnoma summasi: ${userActions.data.contractAmount}\n💱 Valyuta: ${userActions.data.currency}\n🔁 Ayirboshlash kursi: ${exchangeRate}\n📅 Shartnoma sanasi: ${userActions.data.contractDate}\n👤 Manager: ${userActions.data.info}\n📝 Tavsif: ${userActions.data.description}`
            : `📝 Новый контракт отправлен на утверждение:\n\n📄 ID контракта: ${userActions.data.contractId}\n💰 Сумма контракта: ${userActions.data.contractAmount}\n💱 Валюта: ${userActions.data.currency}\n🔁 Курс обмена: ${exchangeRate}\n📅 Дата контракта: ${userActions.data.contractDate}\n👤 Менеджер: ${userActions.data.info}\n📝 Описание: ${userActions.data.description}`;

        const actionKeyboard = new InlineKeyboard()
          .text(
            directorLang === 'uz' ? "👀 Ko'rib chiqilmoqda" : '👀 В процессе',
            `in_progress:${ctx!.match![1]}`
          )
          .text(
            directorLang === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить',
            `director_approve:${ctx!.match![1]}`
          )
          .text(
            directorLang === 'uz' ? '❌ Bekor qilish' : '❌ Отменить',
            `director_reject:${ctx!.match![1]}`
          );

        await ctx.api.sendMessage(director.userId, text, {
          reply_markup: actionKeyboard
        });
      })
    ]);
  } catch (err) {
    console.error('Error in handleContractRequestConfirmation', err);
    await ctx.reply('Error in handleContractRequestConfirmation');
  }
}
