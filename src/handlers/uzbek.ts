import { MyContext } from "../bot";
import { UserStepModel } from "../models/user-step.model";
import { UserModel } from "../models/user.model";
import { handleInitialMenu } from "./initial";

export async function handleUzbLang(ctx: MyContext) {
  const findUserAction = await UserStepModel.findOne({ userId: ctx.from?.id });
  const user = await UserModel.findOne({ userId: ctx.from?.id });

  if (findUserAction && !findUserAction?.data?.language) {
    findUserAction.data.language = "uz";
    findUserAction.step = "lang";
    findUserAction.markModified("data");
    await findUserAction.save();
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup();
    await ctx.editMessageText("Til tanlandi.");
    await handleInitialMenu(ctx);
  }
}
