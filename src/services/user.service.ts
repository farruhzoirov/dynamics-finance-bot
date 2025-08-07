import { MyContext } from '../bot';
import { UserModel } from '../models/user.model';
import { UserStepModel } from '../models/user-step.model';
import { 
  Result, 
  success, 
  failure, 
  UserNotFoundError,
  DatabaseError 
} from '../common/errors/domain-errors';
import { Language } from './translation.service';
import { logger } from './logger.service';

export interface UserData {
  userId: number;
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
  phone?: string;
  role?: string;
}

export interface UserStepData {
  step: string;
  data: {
    language?: Language;
    type?: string;
    amount?: number;
    currency?: string;
    description?: string;
    [key: string]: any;
  };
}

export class UserService {
  /**
   * Ensures user exists in database, creates if not found
   */
  static async ensureUserExists(ctx: MyContext): Promise<Result<UserData>> {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        return failure(new UserNotFoundError(0));
      }

      const userData = {
        userId,
        userName: ctx.from?.username,
        userFirstName: ctx.from?.first_name,
        userLastName: ctx.from?.last_name
      };

      await UserModel.updateOne(
        { userId },
        {
          $setOnInsert: userData
        },
        { upsert: true }
      );

      logger.userAction('user_ensured', userId);
      
      const user = await UserModel.findOne({ userId });
      return success(user?.toObject() as UserData);
    } catch (error) {
      logger.error('Failed to ensure user exists', error as Error, { userId: ctx.from?.id });
      return failure(new DatabaseError('Failed to ensure user exists', error as Error));
    }
  }

  /**
   * Updates user step and associated data
   */
  static async updateUserStep(
    userId: number,
    step: string,
    additionalData: Record<string, any> = {}
  ): Promise<Result<UserStepData>> {
    try {
      const existingUserStep = await UserStepModel.findOne({ userId });
      
      const updatedData = {
        ...existingUserStep?.data,
        ...additionalData
      };

      const userStep = await UserStepModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            step,
            data: updatedData
          }
        },
        { upsert: true, new: true }
      );

      logger.userAction('step_updated', userId, { step, additionalData });
      
      return success({
        step: userStep.step,
        data: userStep.data
      });
    } catch (error) {
      logger.error('Failed to update user step', error as Error, { userId, step });
      return failure(new DatabaseError('Failed to update user step', error as Error));
    }
  }

  /**
   * Gets user step data
   */
  static async getUserStep(userId: number): Promise<Result<UserStepData | null>> {
    try {
      const userStep = await UserStepModel.findOne({ userId });
      
      if (!userStep) {
        return success(null);
      }

      return success({
        step: userStep.step,
        data: userStep.data
      });
    } catch (error) {
      logger.error('Failed to get user step', error as Error, { userId });
      return failure(new DatabaseError('Failed to get user step', error as Error));
    }
  }

  /**
   * Gets user by ID
   */
  static async getUserById(userId: number): Promise<Result<UserData>> {
    try {
      const user = await UserModel.findOne({ userId });
      
      if (!user) {
        return failure(new UserNotFoundError(userId));
      }

      return success(user.toObject() as UserData);
    } catch (error) {
      logger.error('Failed to get user by ID', error as Error, { userId });
      return failure(new DatabaseError('Failed to get user by ID', error as Error));
    }
  }

  /**
   * Gets users by role
   */
  static async getUsersByRole(role: string): Promise<Result<UserData[]>> {
    try {
      const users = await UserModel.find({ role });
      return success(users.map(user => user.toObject() as UserData));
    } catch (error) {
      logger.error('Failed to get users by role', error as Error, { role });
      return failure(new DatabaseError('Failed to get users by role', error as Error));
    }
  }

  /**
   * Updates user data partially
   */
  static async updateUser(
    userId: number, 
    updates: Partial<UserData>
  ): Promise<Result<UserData>> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true }
      );

      if (!user) {
        return failure(new UserNotFoundError(userId));
      }

      logger.userAction('user_updated', userId, { updates });
      return success(user.toObject() as UserData);
    } catch (error) {
      logger.error('Failed to update user', error as Error, { userId, updates });
      return failure(new DatabaseError('Failed to update user', error as Error));
    }
  }

  /**
   * Clears user step data and resets to main menu
   */
  static async resetUserToMainMenu(userId: number): Promise<Result<void>> {
    try {
      const userStepResult = await this.getUserStep(userId);
      
      if (userStepResult.success && userStepResult.data) {
        const { language } = userStepResult.data.data;
        
        await this.updateUserStep(userId, 'main_menu', { language });
      } else {
        await this.updateUserStep(userId, 'main_menu', {});
      }

      logger.userAction('reset_to_main_menu', userId);
      return success(undefined);
    } catch (error) {
      logger.error('Failed to reset user to main menu', error as Error, { userId });
      return failure(new DatabaseError('Failed to reset user to main menu', error as Error));
    }
  }

  /**
   * Gets user's preferred language
   */
  static async getUserLanguage(userId: number): Promise<Result<Language>> {
    const userStepResult = await this.getUserStep(userId);
    
    if (userStepResult.success && userStepResult.data?.data.language) {
      return success(userStepResult.data.data.language as Language);
    }
    
    // Default to Uzbek if no preference found
    return success('uz');
  }

  /**
   * Sets user's preferred language
   */
  static async setUserLanguage(userId: number, language: Language): Promise<Result<void>> {
    const result = await this.updateUserStep(userId, 'main_menu', { language });
    
    if (result.success) {
      logger.userAction('language_set', userId, { language });
      return success(undefined);
    }
    
    return failure(result.error);
  }

  /**
   * Helper method to get user context from MyContext
   */
  static async getUserContext(ctx: MyContext): Promise<Result<{
    user: UserData;
    userStep: UserStepData | null;
    language: Language;
  }>> {
    const userId = ctx.from?.id;
    if (!userId) {
      return failure(new UserNotFoundError(0));
    }

    const [userResult, userStepResult, languageResult] = await Promise.all([
      this.ensureUserExists(ctx),
      this.getUserStep(userId),
      this.getUserLanguage(userId)
    ]);

    if (!userResult.success) return failure(userResult.error);
    if (!languageResult.success) return failure(languageResult.error);

    return success({
      user: userResult.data,
      userStep: userStepResult.success ? userStepResult.data : null,
      language: languageResult.data
    });
  }
}