import { InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";
import { handleInitialMenu } from "./initial";

export async function handleStart(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });

  if (!findUserActions) return;

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

  findUserActions.step = "lang";
  await findUserActions.save();

  if (findUserActions && findUserActions.step === "lang") {
    await ctx.api.setMyCommands([
      {
        command: "start",
        description: `${findUserActions.data?.language === "uz" ? "Botni ishga tushirish" : "Запустить бота"}`,
      },
    ]);
  }

  if (findUserActions.data?.language) {
    await handleInitialMenu(ctx);
  }
}
