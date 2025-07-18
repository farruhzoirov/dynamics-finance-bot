import { MyContext } from "../bot";
import { getMainMenuKeyboard } from "../keyboards";
import { UserStepModel } from "../models/user-step.model";

export async function handleUzbLang(ctx: MyContext) {
  const findUserAction = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (findUserAction && !findUserAction?.data?.language) {
    findUserAction.data.language = "uz";
    findUserAction.step = "lang";
    await findUserAction.save();
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup();
    await ctx.editMessageText("Oʻzbek tili tanlandi.");
    await ctx.reply(
      "Assalomu alaykum! Botimizga xush kelibsiz! Sizga qanday yordam bera olishim mumkin?",
      {
        reply_markup: getMainMenuKeyboard("cashier", findUserAction),
      },
    );
  }
}
