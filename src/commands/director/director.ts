import { bot, MyContext } from "../../bot";
import { UserStepModel } from "../../models/user-step.model";

bot.callbackQuery("add_income", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter("handleIncomeConversation");
});

bot.callbackQuery("expense");
bot.callbackQuery("balance");
bot.callbackQuery("contracts");

bot.on("message:text", async (ctx: MyContext) => {
  const userId = ctx.from.id;
  const userActions = await UserStepModel.findOne({ userId: userId });

  if (userActions?.step === "ask_amount") {
    const amount = parseFloat(ctx!.message!.text);
    if (isNaN(amount)) {
      ctx.reply(
        userActions?.data.language === "uz"
          ? "❌ Iltimos, qiymatni faqat sonlarda kiriting."
          : "❌ Пожалуйста, введите значение только цифрами.",
      );
      return;
    }

    await UserStepModel.updateOne(
      { userId },
      {
        $set: {
          step: "ask_currency",
          data: {
            ...userActions?.data,
            amount: amount,
          },
        },
      },
      { upsert: true },
    );
    return await ctx.reply(
      userActions.data.language === "uz"
        ? "Valyutani tanlang:"
        : "Выберите валюту:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  userActions.data.language === "uz"
                    ? "So'm (UZS)"
                    : "Сум (UZS)",
                callback_data: "uzs",
              },
              {
                text:
                  userActions.data.language === "uz"
                    ? "Dollar (USD)"
                    : "Доллар (USD)",
                callback_data: "usd",
              },
            ],
          ],
        },
      },
    );
  }

  if (userActions?.step === "ask_description") {
    const description = ctx.message?.text;
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "confirm_income",
          data: {
            ...userActions?.data,
            description: description,
          },
        },
      },
      { upsert: true, new: true },
    );

  }
});

bot.callbackQuery(["uzs", "usd"], async (ctx: MyContext) => {
  const userId = ctx.from.id;
  const currency = ctx.callbackQuery.data.toUpperCase();
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

  if (userActions && userActions.step === "ask_currency") {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_description",
          data: {
            ...userActions?.data,
            currency: currency,
          },
        },
      },
      { upsert: true, new: true },
    );
    ctx.answerCallbackQuery();
    return await ctx.reply(
      userActions.data.language === "uz"
        ? "Izoh kiriting (ixtiyoriy):"
        : "Введите описание (необязательно):",
    );
  }
});
