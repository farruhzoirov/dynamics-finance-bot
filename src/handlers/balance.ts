import { MyContext } from "../bot";
import { Currency } from "../common/enums/currency.enum";
import { getBalance } from "../helpers/get-balance";
import { getCurrency } from "../helpers/get-currency";
import { UserStepModel } from "../models/user-step.model";

export async function getBalanceHandler(ctx: MyContext) {
  const userId = ctx?.from?.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  await ctx.answerCallbackQuery();

  if (!userActions) {
    return;
  }

  const [balanceInUSD, balanceUZS, currency] = await Promise.all([
    getBalance(Currency.USD),
    getBalance(Currency.UZS),
    getCurrency(),
  ]);

  const lang = userActions.data.language;

  await UserStepModel.updateOne(
    { userId },
    {
      $set: {
        step: "main_menu",
      },
    },
    { upsert: true },
  );

  if (lang === "uz") {
    return ctx.reply(
      `💳 *Balans holati:*\n\n` +
        `🇺🇸 AQSh dollari: *$${balanceInUSD.balance}*\n` +
        `🇺🇿 So'm: *${balanceUZS.balance} so'm*\n` +
        `Dollar kursi: *${currency} so'm*\n\n` +
        `📌 Bu balans hisobingizdagi mavjud mablag'ni ifodalaydi. Yangi tranzaksiyalar yoki operatsiyalarni amalga oshirishdan oldin balansni tekshirib turing.`,
      { parse_mode: "Markdown" },
    );
  }

  return ctx.reply(
    `💳 *Ваш текущий баланс:*\n\n` +
      `🇺🇸 Доллары США: *$${balanceInUSD.balance}*\n` +
      `🇺🇿 Сум: *${balanceUZS.balance} сум*\n` +
      `Курс доллара: *${currency} сум*\n\n` +
      `📌 Это ваш текущий остаток на счету. Перед выполнением операций или транзакций рекомендуем проверить баланс.`,
    { parse_mode: "Markdown" },
  );
}
