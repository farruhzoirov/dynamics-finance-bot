import { Context } from "grammy";
import { configEnv } from "../config/config-env";
import { authenticateUser, hasPermission } from "../middleware/auth";
import { UserSession } from "../types";

const userSessions = new Map<number, UserSession>();

export async function handleCreateContract(ctx: Context) {
  const user = await authenticateUser(ctx);
  await ctx.answerCallbackQuery();
  if (!user || !hasPermission(user as string, ["director", "manager"])) {
    await ctx.reply("❌ Sizga ushbu amalni bajarish uchun ruxsat yo'q.");
    return;
  }

  userSessions.set(+configEnv.CASHIER_ID as number, { step: "contract_name" });
  await ctx.reply(
    "📝 **Yangi shartnoma yaratish**\n\nShartnoma nomini kiriting:",
  );
}

export async function handleContractCreation(ctx: Context) {
  const user = await authenticateUser(ctx);
  if (!user) return;

  const session = userSessions.get(+configEnv.CASHIER_ID as number);
  if (!session) return;

  const text = ctx.message?.text;
  if (!text) {
    await ctx.reply("❌ Iltimos, matn kiriting.");
    return;
  }

  switch (session.step) {
    case "contract_name":
      session.data = { name: text };
      session.step = "contract_amount";
      await ctx.editMessageReplyMarkup();
      await ctx.reply("💰 Shartnoma miqdorini kiriting (so'mda):");
      break;

    case "contract_amount":
      const amount = text;
      if (!amount) {
        await ctx.reply("❌ Noto'g'ri miqdor. Iltimos, raqam kiriting.");
        return;
      }
      session.data.amount = amount;
      session.step = "responsible_person";
      await ctx.reply(
        "👤 Mas'ul shaxs username ini kiriting (@dynamics_engineering):",
      );
      break;

    case "responsible_person":
      const username = text.replace("@", "");
      if (username !== "dynamics_engineering") {
        await ctx.reply(
          "❌ Noto'g'ri username. Faqat @dynamics_engineering ruxsat etilgan.",
        );
        return;
      }

      // Find responsible person
      //   const responsibleUser = await database.users.findOne({ username });
      //   if (!responsibleUser) {
      //     await ctx.reply("❌ Mas'ul shaxs topilmadi.");
      //     return;
      //   }

      // Create contract
      //   const contract: Contract = {
      //     number: generateContractNumber(),
      //     name: session.data.name,
      //     amount: session.data.amount,
      //     responsiblePersonId: responsibleUser.telegramId,
      //     responsiblePersonUsername: username,
      //     stages: CONTRACT_STAGES.map((stageName, index) => ({
      //       stageNumber: index + 1,
      //       stageName,
      //       completed: false,
      //     })),
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //   };

      //   await database.contracts.insertOne(contract);
      userSessions.delete(+configEnv.CASHIER_ID as number);

      await ctx.reply(
        `✅ **Shartnoma muvaffaqiyatli yaratildi!**\n\n`,
        //   `📄 Raqam: ${contract.number}\n` +
        //   `📝 Nom: ${contract.name}\n` +
        //   `💰 Miqdor: ${formatCurrency(contract.amount)}\n` +
        //   `👤 Mas'ul: @${contract.responsiblePersonUsername}`,
        // {
        //   parse_mode: "Markdown",
        //   reply_markup: getMainMenuKeyboard(user as string, ""),
        // },
      );
      break;
  }
}
