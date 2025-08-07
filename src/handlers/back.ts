import { MyContext } from '../bot';
import { UserStepModel } from '../models/user-step.model';
import { handleInitialMenu } from './initial';

export async function handleBack(ctx: MyContext) {
  const findUserActions = await UserStepModel.findOne({ userId: ctx.from?.id });
  if (!findUserActions) return;
  if (findUserActions.step === 'settings') {
    findUserActions.step = 'main_menu';
    findUserActions.markModified('step');
    await findUserActions.save();
    await handleInitialMenu(ctx);
  }
}
