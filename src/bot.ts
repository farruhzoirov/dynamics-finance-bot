import { Bot, type Context, GrammyError, HttpError } from 'grammy';
import { configEnv } from './config/config-env';
import { connectToDatabase } from './db/database';
import Blob, { File, FormData, fetch } from 'undici';
globalThis.File = File as any;
globalThis.Blob = Blob as any;
globalThis.FormData = FormData as any;
globalThis.fetch = fetch as any;

export type MyContext = Context;

export const bot = new Bot<MyContext>(configEnv.TELEGRAM_BOT_TOKEN);

import './commands/index';

import { getCurrencyRates } from './services/get-currency.service';

const startBot = async () => {
  await connectToDatabase();
  console.log('Connected to MongoDB successfully!');
  const checkCurrencyRates = await getCurrencyRates();
  if (!checkCurrencyRates) {
    throw Error("Can't get currency rates");
  }
  bot.start();
  console.log('Bot started successfully!');
};

startBot();

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});
