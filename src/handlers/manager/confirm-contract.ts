import { InlineKeyboard } from "grammy";
import { MyContext } from "../../bot";
import { UserStepModel } from "../../models/user-step.model";
import { UserModel } from "../../models/user.model";
import { getCurrency } from "../../helpers/get-currency";

export async function handleContractConfirmation(ctx: MyContext) {
  const userId = ctx?.from?.id;
  const [userActions, directors, exchangeRate] = await Promise.all([
    UserStepModel.findOne({ userId: userId }),
    UserModel.find({ role: "director" }),
    getCurrency(),
  ]);
  await ctx.answerCallbackQuery();

  if (!directors.length) {
    return await ctx.reply("Direktor topilmadi.");
  }

  if (!userActions?.data) return;

  const lang = userActions.data.language;

  await ctx.reply(
    lang === "uz" ? "📨 Direktorga yuborildi" : "📨 Отправлено директору",
  );

  for (const director of directors) {
    const findDirectorActions = await UserStepModel.findOne({
      userId: director.userId,
    });
    if (!findDirectorActions) continue;
    const directorLang = findDirectorActions.data.language;
    const text =
      directorLang === "uz"
        ? `📝 Yangi shartnoma tasdiqlash uchun yuborildi:\n\n📄 Shartnoma ID: ${userActions.data.contractId}\n💰 Shartnoma summasi: ${userActions.data.contractAmount}\n💱 Valyuta: ${userActions.data.currency}\n🔁 Ayirboshlash kursi: ${exchangeRate}\n📅 Shartnoma sanasi: ${userActions.data.contractDate}\n👤 Manager: ${userActions.data.managerInfo}\n📝 Tavsif: ${userActions.data.description}`
        : `📝 Новый контракт отправлен на утверждение:\n\n📄 ID контракта: ${userActions.data.contractId}\n💰 Сумма контракта: ${userActions.data.contractAmount}\n💱 Валюта: ${userActions.data.currency}\n🔁 Курс обмена: ${exchangeRate}\n📅 Дата контракта: ${userActions.data.contractDate}\n👤 Менеджер: ${userActions.data.managerInfo}\n📝 Описание: ${userActions.data.description}`;

    const actionKeyboard = new InlineKeyboard()
      .text(
        directorLang === "uz" ? "👀 Ko'rib chiqilmoqda" : "👀 В процессе",
        "in_progress",
      )
      .text(
        directorLang === "uz" ? "✅ Tasdiqlash" : "✅ Подтвердить",
        "director_approve",
      )
      .text(
        directorLang === "uz" ? "❌ Bekor qilish" : "❌ Отменить",
        "director_reject",
      );
    await ctx.api.sendMessage(director.userId, text, {
      reply_markup: actionKeyboard,
    });
  }
}
