import { MyContext } from '../../bot';

export async function handleCommonExpensesRequest(ctx: MyContext) {
  const expenseType = ctx.callbackQuery?.data;

  switch (expenseType) {
    case 'office':
      break;
    case 'share':
      console.log('office');
      break;
    case 'advance':
      console.log('office');
      break;
    case 'income':
      console.log('office');
      break;
  }
}
