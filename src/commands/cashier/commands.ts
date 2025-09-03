import { bot, MyContext } from '../../bot';
import { handleContractApproval } from '../../handlers/cashier/approve.contract';
import { handleInProgressContractConfirmation } from '../../handlers/cashier/in-progress.contract';
import { handleContractRejection } from '../../handlers/cashier/reject.contract';
import { handleInProgressCommonExpenseConfirmation } from '../../handlers/cashier/inProgress.common-expense';
import { handleCommonExpenseApproval } from '../../handlers/cashier/approve.common-expense';
import { handleCommonExpenseRejection } from '../../handlers/cashier/reject.common-expense';
import { handleClosingContract } from '../../handlers/cashier/close-contract';
import { NextFunction } from 'grammy';
import { UserStepModel } from '../../models/user-step.model';
import { ContractModel } from '../../models/contract.model';
import { ContractStatuses } from '../../common/enums/contract-status.enum';

bot.callbackQuery(
  /^cashier_in_progress:(.+)$/,
  handleInProgressContractConfirmation
);

bot.callbackQuery(/^cashier_approve:(.+)$/, handleContractApproval);

bot.callbackQuery(/^cashier_reject:(.+)$/, handleContractRejection);

bot.callbackQuery(
  /^common_expense_cashier_in_progress:([^:]+):([^:]+):([^:]+)$/,
  handleInProgressCommonExpenseConfirmation
);

bot.callbackQuery(
  /^common_expense_cashier_approve:([^:]+):([^:]+):([^:]+)$/,
  handleCommonExpenseApproval
);

bot.callbackQuery(
  /^common_expense_cashier_reject:([^:]+):([^:]+):([^:]+)$/,
  handleCommonExpenseRejection
);

bot.callbackQuery('close_contract', handleClosingContract);

bot.on('message:text', async (ctx: MyContext, next: NextFunction) => {
  try {
    const userId = ctx.from!.id;
    const userActions = await UserStepModel.findOne({ userId: userId });
    if (!userActions) return;

    if (userActions.step === 'ask_contract_id_for_closing_contract') {
      const contractId = ctx.message!.text as string;
      const lang = userActions.data?.language === 'uz' ? 'uz' : 'ru';
      const isNumeric = /^\d+$/.test(contractId);

      if (!isNumeric) {
        return await ctx.reply(
          lang === 'uz'
            ? 'Iltimos, to‘g‘ri formatda shartnoma raqamini kiriting. (Masalan: 1000 yoki 12)'
            : 'Пожалуйста, введите номер контракта  в правильном формате. (например: 1000 или 12).'
        );
      }
      const id = parseInt(contractId, 10);
      const findContract = await ContractModel.findOne({
        $or: [
          {
            contractId: id
          },
          {
            uniqueId: id
          }
        ]
      });

      if (!findContract) {
        return await ctx.reply(
          lang === 'uz' ? 'Shartnoma mavjud emas!' : 'Контракт не найдено!'
        );
      }

      const isContractClosed = await ContractModel.findOne({
        $or: [{ contractId: id }],
        status: ContractStatuses.CLOSED
      });

      if (isContractClosed) {
        return await ctx.reply(
          lang === 'uz'
            ? `‼️Bu shartnoma allaqachon yopilgan.`
            : '‼️Этот договор уже закрыт.'
        );
      }

      findContract.status = ContractStatuses.CLOSED;
      await findContract.save();
      userActions.step = 'main_menu';
      await userActions.save();
      await ctx.reply(
        lang === 'uz'
          ? `✅ Shartnoma - ${contractId} yopildi.`
          : '✅ Договор - ${contractId} закрыт.'
      );
    }
    await next();
  } catch (err) {
    console.error('Error in close_contract, inside of message:text', err);
    return await ctx.reply('Error in close_contract, inside of message:text');
  }
});
