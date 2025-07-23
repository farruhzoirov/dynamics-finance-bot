import { MyContext } from "../../bot";
import { UserModel } from "../../models/user.model";
import { UserStepModel } from "../../models/user-step.model";
import { getCurrency } from "../../helpers/get-currency";
import { TransactionModel } from "../../models/transaction.model";

export async function handleIncomeConversation(ctx: MyContext) {
  // Steps -  ask_amount, ask_currency, ask_description,
  await ctx.answerCallbackQuery();
  const userId = ctx?.from?.id;
  let [user, userActions] = await Promise.all([
    UserModel.findOne({ userId: userId }),
    UserStepModel.findOne({ userId: userId }),
  ]);
  await UserModel.updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        userName: ctx?.from?.username,
        userFirstName: ctx?.from?.first_name,
        userLastName: ctx?.from?.last_name,
      },
    },
    { upsert: true },
  );

  if (userActions!.step === "main_menu") {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_amount_income",
          data: {
            ...userActions?.data,
            type: "income",
          },
        },
      },
      { upsert: true, new: true },
    );
    return await ctx.reply(
      userActions?.data?.language === "uz"
        ? "Iltimos, kirim miqdorini kiriting:"
        : "Пожалуйста, введите сумму дохода:",
    );
  }
}

export async function handleIncomeCurrency(ctx: MyContext) {
  await ctx.answerCallbackQuery();
  const userId = ctx!.from!.id;
  const message = ctx!.callbackQuery!.message;
  const chatId = message!.chat!.id;
  const messageId = message?.message_id;
  // @ts-ignore
  const currency = ctx!.callbackQuery!.data.split("_")[1].toUpperCase();
  const userActions = await UserStepModel.findOne({ userId: userId });
  if (!userActions) return;

  if (!chatId || !messageId) return;

  await ctx.api.deleteMessage(chatId, messageId);

  if (userActions && userActions.step === "ask_currency") {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_description_income",
          data: {
            ...userActions?.data,
            currency: currency,
          },
        },
      },
      { upsert: true, new: true },
    );
    return await ctx.reply(
      userActions.data.language === "uz"
        ? "Izoh kiriting :"
        : "Введите описание :",
    );
  }
}

export async function handleIncomeConfirmation(ctx: MyContext) {
  await ctx.answerCallbackQuery();
  const userId = ctx!.from!.id;
  const answer = ctx!.callbackQuery!.data?.split("_")[2];
  const message = ctx!.callbackQuery!.message;
  const chatId = message!.chat.id;
  const messageId = message?.message_id;
  const userActions = await UserStepModel.findOne({ userId: userId });

  if (!userActions) return;

  if (!chatId || !messageId) return;

  await ctx.api.deleteMessage(chatId, messageId);

  if (answer === "no") {
    const { type, amount, currency, description, ...rest } = userActions.data;
    userActions.data = rest;
    userActions.step = "main_menu";
    userActions.markModified("data");
    await userActions.save();
    await ctx.reply(
      userActions.data.language === "uz" ? "Bekor qilindi" : "Отменено",
    );
  }

  if (answer === "yes") {
    const { type, amount, currency, description, ...rest } = userActions.data;
    const exchangeRate = await getCurrency(userActions.data.currency);
    if (exchangeRate === 0) {
      await ctx.reply("Error: Exchange rate is 0");
      return;
    }
    const user = await UserModel.findOne({ userId: userId });
    await Promise.all([
      TransactionModel.create({
        type: type,
        amount: amount,
        currency: currency,
        exchangeRate: exchangeRate,
        description: description,
        createdBy: `${user?.userFirstName || ""} ${user?.userLastName || ""}`,
      }),
    ]);
    userActions.data = rest;
    userActions.step = "main_menu";
    await userActions.save();
    await ctx.reply(
      userActions.data.language === "uz"
        ? "Ma'lumotlar muvaffaqiyatli saqlandi. ✅"
        : "Данные успешно сохранены. ✅",
    );
  }
}
