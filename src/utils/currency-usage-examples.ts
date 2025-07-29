// Usage examples for currency validation

import { PureCurrencyValidator, validateUSD, validateUZS, formatUSD, formatUZS } from './currency-validator-pure';

// Example 1: Basic validation
export function exampleBasicValidation() {
  console.log('=== BASIC VALIDATION EXAMPLES ===');
  
  // USD validation
  const usdTests = ['100.50', '1,234.99', '$500', '0.01', '999999', 'abc', ''];
  usdTests.forEach(test => {
    const result = validateUSD(test);
    console.log(`USD "${test}": ${result.isValid ? `✅ ${result.formatted}` : `❌ ${result.error}`}`);
  });

  // UZS validation  
  const uzsTests = ['15000', '1 000 000', '50000 сўм', '100.50', '0', 'invalid'];
  uzsTests.forEach(test => {
    const result = validateUZS(test);
    console.log(`UZS "${test}": ${result.isValid ? `✅ ${result.formatted}` : `❌ ${result.error}`}`);
  });
}

// Example 2: Integration with your bot handlers
export class CurrencyBotHelper {
  /**
   * Validate amount in Telegram message and reply with error or confirmation
   */
  static async validateAndRespond(
    ctx: any, // Your MyContext type
    input: string, 
    currencyType: 'USD' | 'UZS',
    userLanguage: 'uz' | 'ru'
  ) {
    const validation = PureCurrencyValidator.validateAmount(input, currencyType);
    
    if (!validation.isValid) {
      const errorMessage = this.getErrorMessage(validation.error!, userLanguage);
      await ctx.reply(errorMessage);
      return null;
    }

    // Success - return the validated amount
    return {
      value: validation.value!,
      formatted: validation.formatted!,
      forTelegram: PureCurrencyValidator.formatForTelegram(validation.value!, currencyType)
    };
  }

  /**
   * Get localized error messages
   */
  private static getErrorMessage(error: string, language: 'uz' | 'ru'): string {
    const errorMap: Record<string, { uz: string; ru: string }> = {
      'Amount is required': {
        uz: '❌ Miqdor kiritilishi shart',
        ru: '❌ Сумма обязательна'
      },
      'Amount cannot be empty': {
        uz: '❌ Miqdor bo\'sh bo\'lishi mumkin emas',
        ru: '❌ Сумма не может быть пустой'
      },
      'Amount cannot be negative': {
        uz: '❌ Miqdor manfiy bo\'lishi mumkin emas',
        ru: '❌ Сумма не может быть отрицательной'
      },
      'UZS does not support decimal places': {
        uz: '❌ So\'m valyutasida kasr qismlar qo\'llanilmaydi',
        ru: '❌ Валюта сум не поддерживает десятичные дроби'
      },
      'USD supports maximum 2 decimal places': {
        uz: '❌ Dollar valyutasi maksimum 2 ta kasr raqamni qo\'llab-quvvatlaydi',
        ru: '❌ Доллар поддерживает максимум 2 десятичных знака'
      }
    };

    const errorTranslation = errorMap[error];
    if (errorTranslation) {
      return errorTranslation[language];
    }

    // Generic error message for unknown errors
    return language === 'uz' 
      ? '❌ Noto\'g\'ri miqdor kiritildi'
      : '❌ Неверная сумма';
  }

  /**
   * Format amount for display in different contexts
   */
  static formatForDisplay(amount: number, currencyType: 'USD' | 'UZS', context: 'telegram' | 'normal' = 'normal') {
    if (context === 'telegram') {
      return PureCurrencyValidator.formatForTelegram(amount, currencyType);
    }
    return PureCurrencyValidator.formatAmount(amount, currencyType);
  }

  /**
   * Convert and format between currencies
   */
  static convertAndFormat(
    amount: number,
    fromCurrency: 'USD' | 'UZS',
    toCurrency: 'USD' | 'UZS',
    exchangeRate: number
  ) {
    const converted = PureCurrencyValidator.convertCurrency(amount, fromCurrency, toCurrency, exchangeRate);
    return {
      original: {
        amount,
        formatted: PureCurrencyValidator.formatAmount(amount, fromCurrency)
      },
      converted: {
        amount: converted,
        formatted: PureCurrencyValidator.formatAmount(converted, toCurrency)
      }
    };
  }
}

// Example 3: Enhanced handler integration
export function createEnhancedAmountHandler() {
  return async function handleAmountInput(ctx: any, userActions: any) {
    const text = ctx.message?.text;
    const language = userActions?.data?.language || 'uz';
    const currentStep = userActions?.step;

    // Determine currency type based on current step
    let currencyType: 'USD' | 'UZS' = 'USD';
    if (currentStep?.includes('uzs') || userActions?.data?.currency === 'UZS') {
      currencyType = 'UZS';
    }

    // Validate the amount
    const validationResult = await CurrencyBotHelper.validateAndRespond(
      ctx, 
      text, 
      currencyType, 
      language
    );

    if (!validationResult) {
      return; // Error already sent to user
    }

    // Success - save the validated amount
    userActions.data.amount = validationResult.value;
    userActions.data.amountFormatted = validationResult.formatted;
    
    // Send confirmation
    const confirmationMessage = language === 'uz'
      ? `✅ Miqdor saqlandi: ${validationResult.forTelegram}`
      : `✅ Сумма сохранена: ${validationResult.forTelegram}`;
    
    await ctx.reply(confirmationMessage, { parse_mode: 'Markdown' });
    
    // Continue to next step
    // ... your next step logic
  };
}

// Example 4: Validation in your existing contract creation
export function enhanceContractCreation() {
  return `
  // In your contract creation handler:
  
  if (userActions.step === 'ask_contract_amount') {
    const currencyType = userActions.data.currency; // 'USD' | 'UZS'
    const validation = PureCurrencyValidator.validateAmount(text, currencyType);
    
    if (!validation.isValid) {
      await ctx.reply(
        userActions?.data.language === 'uz'
          ? \`❌ \${validation.error}\`
          : \`❌ \${validation.error}\`
      );
      return;
    }

    // Save validated amount
    userActions.data.contractAmount = validation.value;
    userActions.data.contractAmountFormatted = validation.formatted;
    
    await ctx.reply(
      userActions?.data.language === 'uz'
        ? \`✅ Shartnoma summasi: \${validation.formatted}\`
        : \`✅ Сумма договора: \${validation.formatted}\`
    );
    
    // Continue to next step...
  }
  `;
}

// Example 5: Testing different input formats
export function testInputFormats() {
  console.log('=== INPUT FORMAT TESTS ===');
  
  const testInputs = [
    // USD tests
    { input: '100', currency: 'USD' as const },
    { input: '100.50', currency: 'USD' as const },
    { input: '$100.50', currency: 'USD' as const },
    { input: '1,234.99', currency: 'USD' as const },
    { input: '0.01', currency: 'USD' as const },
    { input: '1000000', currency: 'USD' as const },
    { input: '100.999', currency: 'USD' as const }, // Too many decimals
    
    // UZS tests
    { input: '15000', currency: 'UZS' as const },
    { input: '1 000 000', currency: 'UZS' as const },
    { input: '50000 сўм', currency: 'UZS' as const },
    { input: '100.50', currency: 'UZS' as const }, // Should fail - no decimals
    { input: '50000000000', currency: 'UZS' as const },
    { input: '50000000001', currency: 'UZS' as const }, // Over limit
  ];

  testInputs.forEach(({ input, currency }) => {
    const result = PureCurrencyValidator.validateAmount(input, currency);
    console.log(
      `${currency} "${input}": ${
        result.isValid 
          ? `✅ Value: ${result.value}, Formatted: ${result.formatted}` 
          : `❌ ${result.error}`
      }`
    );
  });
}

// Run examples
if (require.main === module) {
  exampleBasicValidation();
  console.log('\n');
  testInputFormats();
}