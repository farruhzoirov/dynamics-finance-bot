import {
  Bot,
  type Context,
  GrammyError,
  HttpError,
  session,
  type SessionFlavor,
} from "grammy";
import { configEnv } from "./config/config-env";
import { handleStart } from "./handlers/start";
import {
  handleContractCreation,
  handleCreateContract,
} from "./handlers/contracts";
import { authenticateUser } from "./middleware/auth";
import { handleUzbLang } from "./handlers/uzbek";
import { SessionData } from "./types";
import { connectToDatabase } from "./db/database";

export type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(configEnv.TELEGRAM_BOT_TOKEN);

const initialSession: SessionData = {
  language: undefined,
};

bot.use(
  session({
    initial: () => initialSession,
  }),
);

bot.command("start", handleStart);
bot.command("create_contract", handleCreateContract);
bot.callbackQuery("create_contract", handleCreateContract);
bot.callbackQuery("uzbek", handleUzbLang);

bot.callbackQuery("russian", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup();
  await ctx.editMessageText("Rus til tanlandi.");
});

bot.on("message:text", async (ctx: Context) => {
  const user = await authenticateUser(ctx);
  if (!user) return;

  const text = ctx.message?.text;

  // Handle different conversation flows
  if (text && !text.startsWith("/")) {
    // Check if user is in a conversation flow
    await handleContractCreation(ctx);
    // await handleStageClosing(ctx)
    // await handleCashTransaction(ctx)
    // await handleContractStatusCheck(ctx)
  }
});

connectToDatabase().then();
console.log("Connected to MongoDB successfully!");

bot
  .start()
  .then(() => {
    connectToDatabase().then();
    console.log("Connected to MongoDB successfully!");
    console.log("Bot started successfully!");
  })
  .catch((error) => {
    console.error("Failed to start the bot:", error);
  });

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
