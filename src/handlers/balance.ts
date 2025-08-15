import { MyContext } from '../bot';
import { Currency } from '../common/enums/currency.enum';
import { UserRoles } from '../common/enums/roles.enum';
import { formatAmountByCurrency } from '../helpers/format-amount';
import { getBalance } from '../helpers/get-balance';
import { UserStepModel } from '../models/user-step.model';
import { UserModel } from '../models/user.model';
import { getCurrencyRates } from '../services/get-currency.service';

export async function getBalanceHandler(ctx: MyContext) {
  const userId = ctx?.from?.id;
  const [userActions, findUser] = await Promise.all([
    UserStepModel.findOne({
      userId: userId
    }),
    UserModel.findOne({
      userId: userId
    })
  ]);

  if (ctx.callbackQuery?.data) {
    await ctx.answerCallbackQuery();
  }

  if (
    findUser!.role !== UserRoles.director &&
    findUser!.role !== UserRoles.cashier
  ) {
    return await ctx.reply(
      userActions!.data!.language === 'uz'
        ? 'Siz bu xususiyatdan foydalana olmaysiz.'
        : 'Вы не можете воспользоваться этой функцией.'
    );
  }
  if (!userActions) return;
  const [balanceInUSD, balanceUZS, currencyRates] = await Promise.all([
    getBalance(Currency.USD),
    getBalance(Currency.UZS),
    getCurrencyRates()
  ]);

  if (!currencyRates) return await ctx.reply('Error in getCurrencyRates');

  const lang = userActions.data.language;
  await UserStepModel.updateOne(
    { userId },
    {
      $set: {
        step: 'main_menu'
      }
    },
    { upsert: true }
  );

  if (lang === 'uz') {
    return ctx.reply(
      `💳 *Balans holati:*\n\n` +
        `🇺🇸 AQSh dollari: *${formatAmountByCurrency(balanceInUSD.balance, Currency.USD, lang)}*\n` +
        `🇺🇿 So'm: *${formatAmountByCurrency(balanceUZS.balance, Currency.UZS, lang)}*\n` +
        `AQSH dollari sotib olish kursi(Kapitalbank): *${formatAmountByCurrency(currencyRates.buyValue, Currency.UZS, lang)}*\n` +
        `AQSH dollari sotish kursi(Kapitalbank): *${formatAmountByCurrency(currencyRates.saleValue, Currency.UZS, lang)}*\n\n` +
        `📌 Bu balans hisobingizdagi mavjud mablag'ni ifodalaydi. Yangi tranzaksiyalar yoki operatsiyalarni amalga oshirishdan oldin balansni tekshirib turing.`,
      { parse_mode: 'Markdown' }
    );
  }

  return ctx.reply(
    `💳 *Ваш текущий баланс:*\n\n` +
      `🇺🇸 Доллары США: *${formatAmountByCurrency(balanceInUSD.balance, Currency.USD, 'ru')}*\n` +
      `🇺🇿 Сум: *${formatAmountByCurrency(balanceUZS.balance, Currency.UZS, 'ru')}*\n` +
      `Курс покупки доллара США (Капиталбанк): *${formatAmountByCurrency(currencyRates.buyValue, Currency.UZS, lang)}*\n` +
      `Курс продажи доллара США (Капиталбанк): *${formatAmountByCurrency(currencyRates.saleValue, Currency.UZS, lang)}*\n\n` +
      `📌 Это ваш текущий остаток на счету. Перед выполнением операций или транзакций рекомендуем проверить баланс.`,
    { parse_mode: 'Markdown' }
  );
}
