import { MyContext } from "../../bot";
import { UserStepModel } from "../../models/user-step.model";

export async function handleContractCurreny(ctx: MyContext) {
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

  if (userActions?.step === "ask_contract_currency") {
    await UserStepModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          step: "ask_contract_date",
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
        ? "Shartnoma tuzilgan sanani (DD.MM.YYYY) shu formatda kiriting:"
        : "Пожалуйста, введите дату заключения договора в формате (ДД.ММ.ГГГГ):",
    );
  }
}
