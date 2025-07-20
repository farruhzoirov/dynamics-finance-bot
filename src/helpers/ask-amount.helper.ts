import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../bot";

export async function askAmount(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
  userLang: string,
): Promise<number> {
  const amountMessage = await conversation.waitFor(":text");
  const amount = parseFloat(amountMessage?.message?.text || "");

  if (isNaN(amount)) {
    await ctx.reply(
      userLang === "uz"
        ? "❌ Iltimos, qiymatni faqat sonlarda kiriting."
        : "❌ Пожалуйста, введите значение только цифрами.",
    );
    return askAmount(conversation, ctx, userLang);
  }

  return amount;
}
