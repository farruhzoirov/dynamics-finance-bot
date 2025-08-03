import { MyContext } from '../../bot';
import { Languages } from '../../common/types/languages';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { TransactionModel } from '../../models/transaction.model';
import { UserStepModel } from '../../models/user-step.model';

export async function handleTransactionsHistory(ctx: MyContext, page: number) {
  try {
    const userId = ctx.from!.id;
    const limit = 5;
    const skip = limit * (page - 1);

    const [userActions, transactions, transactionsCount] = await Promise.all([
      UserStepModel.findOne({ userId }),
      TransactionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      TransactionModel.countDocuments()
    ]);

    await ctx.answerCallbackQuery();

    const language = userActions?.data.language || 'ru';
    const isUzbek = language === 'uz';

    if (!transactions.length) {
      return ctx.reply(
        isUzbek ? 'Tranzaksiyalar mavjud emas.' : 'Транзакции не найдены.'
      );
    }

    const totalPages = Math.ceil(transactionsCount / limit);

    const lines = transactions.map((tx, idx) => {
      const label = getExpenseTypeLabel(tx.type, language);
      const date = tx.createdAt.toLocaleDateString(isUzbek ? 'uz-UZ' : 'ru-RU');
      const amount = `${tx.amount} ${tx.currency}`;

      const amountLabel = isUzbek ? 'Miqdor' : 'Сумма';
      const dateLabel = isUzbek ? 'Sana' : 'Дата';
      const descriptionLabel = isUzbek ? 'Izoh' : 'Описание';
      const createdByLabel = isUzbek
        ? 'Tranzaksiyani amalga oshirgan shaxs'
        : 'Человек, совершивший транзакцию';

      const contractLine = tx.contractId
        ? isUzbek
          ? `📄 *Shartnoma raqami:* ${tx.contractId}`
          : `📄 *Номер договора:* ${tx.contractId}`
        : '';

      return [
        `*${idx + 1}) ${label}*`,
        `💰 *${amountLabel}:* ${amount}`,
        `📅 *${dateLabel}:* ${date}`,
        `ℹ️ *${descriptionLabel}:* ${tx.description || '-'}`,
        `🙍‍♂️ *${createdByLabel}:* ${tx.createdBy || '-'}`,
        contractLine
      ]
        .filter(Boolean)
        .join('\n');
    });

    const messageHeader = isUzbek
      ? `💳 *Tranzaksiyalar tarixi* (${page}-chi sahifa):\n\n`
      : `💳 *История транзакций* (${page}-я страница):\n\n`;

    const paginationButtons = getPaginationButtons(page, totalPages, language);

    await ctx.editMessageText(messageHeader + lines.join('\n\n'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [paginationButtons]
      }
    });
  } catch (err) {
    console.error('Transaction history error:', err);
  }
}

function getPaginationButtons(
  currentPage: number,
  totalPages: number,
  lang: Languages
) {
  const maxVisiblePages = 5;
  const buttons = [];

  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (currentPage > 1) {
    buttons.push({
      text: lang === 'uz' ? '⬅️ Oldingi' : '⬅️ Назад',
      callback_data: `transactions_page_${currentPage - 1}`
    });
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push({
      text: `${i}`,
      callback_data: `transactions_page_${i}`
    });
  }

  if (currentPage < totalPages) {
    buttons.push({
      text: lang === 'uz' ? 'Keyingi ➡️' : 'Далее ➡️',
      callback_data: `transactions_page_${currentPage + 1}`
    });
  }

  return buttons;
}
