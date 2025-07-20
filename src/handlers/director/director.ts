import { MyContext } from "../../bot";
import { UserModel } from "../../models/user.model";
import { UserStepModel } from "../../models/user-step.model";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";

export async function handleIncomeConversation(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
) {
  // Steps -  ask_amount, ask_currency, ask_description,
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
          step: "ask_amount",
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
