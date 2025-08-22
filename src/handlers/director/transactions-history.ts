import { MyContext } from '../../bot';
import { TransactionType } from '../../common/enums/transaction.enum';
import { Languages } from '../../common/types/languages';
import { getExpenseTypeLabel } from '../../helpers/get-common-expense-translations';
import { TransactionModel } from '../../models/transaction.model';
import { UserStepModel } from '../../models/user-step.model';

type Btn = { text: string; callback_data: string };
type Keyboard = Btn[][];
type TxFilter = 'all' | 'income' | 'expense';

export async function handleTransactionsHistory(
  ctx: MyContext,
  page = 1,
  filterType: TxFilter = 'all'
) {
  try {
    const userId = ctx.from!.id;
    const limit = 5;
    const skip = limit * (page - 1);

    let filter: Record<string, any> = {};
    if (filterType === 'income') {
      filter = { type: TransactionType.INCOME };
    } else if (filterType === 'expense') {
      filter = { type: { $ne: TransactionType.INCOME } };
    }

    const [userActions, transactions, transactionsCount] = await Promise.all([
      UserStepModel.findOne({ userId }),
      TransactionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TransactionModel.countDocuments(filter)
    ]);

    await ctx.answerCallbackQuery();

    const language = (userActions?.data.language as Languages) || 'ru';
    const isUzbek = language === 'uz';

    if (!transactions.length) {
      return ctx.editMessageText(
        isUzbek ? 'Tranzaksiyalar topilmadi.' : 'Транзакции не найдены.',
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: getPaginationButtons(page, 0, language, filterType)
          }
        }
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

    await ctx.editMessageText(messageHeader + lines.join('\n\n'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: getPaginationButtons(
          page,
          totalPages,
          language,
          filterType
        )
      }
    });
  } catch (err) {
    console.error('Transaction history error:', err);
  }
}

function getPaginationButtons(
  currentPage: number,
  totalPages: number,
  lang: Languages,
  filterType: TxFilter
): Keyboard {
  const maxVisiblePages = 5;

  const topRows: Btn[] = [
    {
      text: lang === 'uz' ? 'Hammasi' : 'Все',
      callback_data: `tx_all_1`
    },
    {
      text: lang === 'uz' ? 'Kirimlar' : 'Доходы',
      callback_data: `tx_income_1`
    },
    {
      text: lang === 'uz' ? 'Chiqimlar' : 'Расходы',
      callback_data: `tx_expense_1`
    }
  ];

  const keyboards: Keyboard = [topRows];

  const paginationRow: Btn[] = [];

  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages || 1, startPage + maxVisiblePages - 1);

  if (currentPage > 1) {
    paginationRow.push({
      text: lang === 'uz' ? '⬅️ Oldingi' : '⬅️ Назад',
      callback_data: `tx_${filterType}_${currentPage - 1}`
    });
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationRow.push({
      text: `${i}${i === currentPage ? ' •' : ''}`,
      callback_data: `tx_${filterType}_${i}`
    });
  }

  if (currentPage < totalPages) {
    paginationRow.push({
      text: lang === 'uz' ? 'Keyingi ➡️' : 'Далее ➡️',
      callback_data: `tx_${filterType}_${currentPage + 1}`
    });
  }

  if (paginationRow.length) {
    keyboards.push(paginationRow);
  }

  return keyboards;
}
