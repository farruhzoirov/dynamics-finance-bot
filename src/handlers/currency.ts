import { MyContext } from '../bot';
import { Currency } from '../common/enums/currency.enum';
import { formatAmountByCurrency } from '../helpers/format-amount';
import { UserStepModel } from '../models/user-step.model';
import { getCurrencyRates } from '../services/get-currency.service';

export async function getCurrencyRatesForInitialMenu(ctx: MyContext) {
  const userId = ctx.from!.id;
  const userActions = await UserStepModel.findOne({ userId: userId });
  const getCurrency = await getCurrencyRates();
  if (!getCurrency) return await ctx.reply('Error in getCurrencyRates');

  if (!userActions) return;
  await ctx.reply(
    userActions?.data?.language === 'uz'
      ? `💱 *Valyuta kurslari(Kapitalbank)*\n\n*Bugungi dollar kursi:*\n\n*🔹 Sotib olish:* ${formatAmountByCurrency(getCurrency.buyValue, Currency.UZS, userActions.data.language)}\n*🔸 Sotish:* ${formatAmountByCurrency(getCurrency.saleValue, Currency.UZS, userActions.data.language)}\n`
      : `💱 *Курсы валют(КапиталБанк)*\n\n*Актуальный курс доллара на сегодня:*\n\n*🔹 Покупка:* ${formatAmountByCurrency(getCurrency.buyValue, Currency.UZS, userActions.data.language)}\n*🔸 Продажа:* ${formatAmountByCurrency(getCurrency.saleValue, Currency.UZS, userActions.data.language)}\n`,
    { parse_mode: 'Markdown' }
  );
}
