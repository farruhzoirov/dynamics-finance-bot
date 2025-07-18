import { InlineKeyboard } from "grammy";
import { authenticateUser } from "../middleware/auth";
import { getMainMenuKeyboard } from "../keyboards";
import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";

export async function handleStart(ctx: MyContext) {
  const userRole = await authenticateUser(ctx);
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (
    findUserActions &&
    !findUserActions?.data?.language &&
    findUserActions.step === "start"
  ) {
    const languageKeyboard = new InlineKeyboard()
      .text("🇺🇿 Oʻzbekcha", "uzbek")
      .text("🇷🇺 Русский", "russian");
    await ctx.reply("Tilni tanlang | Выберите язык:", {
      reply_markup: languageKeyboard,
    });
  }

  if (findUserActions && findUserActions.step === "lang") {
    await ctx.reply(
      findUserActions.data?.language === "uz"
        ? "Assalomu alaykum! Botga xush kelibsiz!"
        : "Здравствуйте! Добро пожаловать в бот!",
      {
        reply_markup: getMainMenuKeyboard(userRole as string, findUserActions),
      },
    );
  }
}
