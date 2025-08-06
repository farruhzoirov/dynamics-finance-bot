import { MyContext } from '../../bot';
import { ContractModel } from '../../models/contract.model';
import { ContractStatuses } from '../../common/enums/contract-status.enum';
import { UserStepModel } from '../../models/user-step.model';
import { sendContractPage } from './get-contracts'; // Export qilingan bo'lishi kerak

export async function handlePagination(ctx: MyContext) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const userActions = await UserStepModel.findOne({ userId });
  const lang = userActions?.data?.language === 'uz' ? 'uz' : 'ru';

  const contracts = await ContractModel.find({
    status: { $in: [ContractStatuses.APPROVED, ContractStatuses.CLOSED] }
  }).sort({ createdAt: -1 });

  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const match = callbackData.match(/(prev|next)_(\d+)/);
  if (!match) return;

  const direction = match[1];
  const currentPage = parseInt(match[2]);
  const newPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;

  await ctx.answerCallbackQuery();

  return sendContractPage(ctx, contracts, newPage, lang, true);
}
