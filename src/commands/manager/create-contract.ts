import { bot } from "../../bot";
import { handleContractCreation } from "../../handlers/manager/create-contract";
import { UserStepModel } from "../../models/user-step.model";

bot.callbackQuery("create_contract", handleContractCreation);

bot.on("message:text", async (ctx) => {
  const text = ctx?.message?.text;
  const userId = ctx?.from?.id;
  const userActions = await UserStepModel.findOne({ userId: userId });

  if (!userActions) return;

  if (userActions.step === "ask_contract_id") {
    const contractId = parseInt(text);

    if (isNaN(contractId)) {
      await ctx.reply(
        userActions?.data.language === "uz"
          ? "❌ Iltimos, qiymatni faqat sonlarda kiriting."
          : "❌ Пожалуйста, введите значение только цифрами.",
      );
      return;
    }
  }
});
