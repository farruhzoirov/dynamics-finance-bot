import { Languages } from '../common/types/languages';
import { TransactionType } from '../common/enums/transaction.enum';

export const expenseTypeTranslations: Record<
  Languages,
  Record<TransactionType, string>
> = {
  uz: {
    [TransactionType.INCOME]: 'Kirim',
    [TransactionType.EXPENSE]: 'Chiqim',
    [TransactionType.OFFICE]: 'Ofis xarajatlari',
    [TransactionType.SHARE]: "Ulush to'lovi",
    [TransactionType.ADVANCE]: 'Avans',
    [TransactionType.EXPENSE_PURCHASE]: 'Xarid xarajatlari',
    [TransactionType.EXPENSE_LOGISTICS]: 'Logistika xarajatlari',
    [TransactionType.EXPENSE_CERTIFICATES]: 'Sertifikat xarajatlari',
    [TransactionType.EXPENSE_OTHER]: 'Boshqa xarajatlar',
    [TransactionType.EXPENSE_BONUS]: "Bonus to'lovi",
    [TransactionType.EXPENSE_MANAGER_SHARE]: 'Menejer ulushi',
    [TransactionType.DEBT]: 'Qarz'
  },
  ru: {
    [TransactionType.INCOME]: 'Доход',
    [TransactionType.EXPENSE]: 'Расход',
    [TransactionType.OFFICE]: 'Офисные расходы',
    [TransactionType.SHARE]: 'Оплата доли',
    [TransactionType.ADVANCE]: 'Аванс',
    [TransactionType.EXPENSE_PURCHASE]: 'Расходы на закупку',
    [TransactionType.EXPENSE_LOGISTICS]: 'Расходы на логистику',
    [TransactionType.EXPENSE_CERTIFICATES]: 'Расходы на сертификаты',
    [TransactionType.EXPENSE_OTHER]: 'Прочие расходы',
    [TransactionType.EXPENSE_BONUS]: 'Выплата бонуса',
    [TransactionType.EXPENSE_MANAGER_SHARE]: 'Доля менеджера',
    [TransactionType.DEBT]: 'Долг'
  }
};

export function getExpenseTypeLabel(
  expenseType: TransactionType,
  language: Languages
): string {
  return expenseTypeTranslations[language][expenseType] ?? expenseType;
}
