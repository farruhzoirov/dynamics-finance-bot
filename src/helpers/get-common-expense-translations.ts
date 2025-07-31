import { Expenses } from '../common/enums/expense-type.enum';
import { Languages } from '../common/types/languages';

export const expenseTypeTranslations: Record<
  Languages,
  Record<Expenses, string>
> = {
  uz: {
    [Expenses.OFFICE]: 'Ofis xarajatlari',
    [Expenses.SHARE]: "Ulush to'lovi",
    [Expenses.ADVANCE]: 'Avans',
    [Expenses.INCOME]: 'Daromad',
    [Expenses.EXPENSE_PURCHASE]: 'Xarid xarajatlari',
    [Expenses.EXPENSE_LOGISTICS]: 'Logistika xarajatlari',
    [Expenses.EXPENSE_CERTIFICATES]: 'Sertifikat xarajatlari',
    [Expenses.EXPENSE_OTHER]: 'Boshqa xarajatlar',
    [Expenses.EXPENSE_BONUS]: "Bonus to'lovi",
    [Expenses.EXPENSE_MANAGER_SHARE]: 'Menejer ulushi'
  },
  ru: {
    [Expenses.OFFICE]: 'Офисные расходы',
    [Expenses.SHARE]: 'Оплата доли',
    [Expenses.ADVANCE]: 'Аванс',
    [Expenses.INCOME]: 'Доход',
    [Expenses.EXPENSE_PURCHASE]: 'Расходы на закупку',
    [Expenses.EXPENSE_LOGISTICS]: 'Расходы на логистику',
    [Expenses.EXPENSE_CERTIFICATES]: 'Расходы на сертификаты',
    [Expenses.EXPENSE_OTHER]: 'Прочие расходы',
    [Expenses.EXPENSE_BONUS]: 'Выплата бонуса',
    [Expenses.EXPENSE_MANAGER_SHARE]: 'Доля менеджера'
  }
};

export function getExpenseTypeLabel(
  expenseType: Expenses,
  language: Languages
): string {
  return expenseTypeTranslations[language][expenseType] ?? expenseType;
}
