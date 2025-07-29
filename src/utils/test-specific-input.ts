import { PureCurrencyValidator } from './currency-validator-pure';

// Test the specific input: "3 942 040 509,44"
export function testSpecificInput() {
  const testInput = "3 942 040 509,44";
  
  console.log('=== TESTING INPUT: "3 942 040 509,44" ===\n');
  
  // Test with USD
  console.log('🇺🇸 Testing with USD:');
  const usdResult = PureCurrencyValidator.validateAmount(testInput, 'USD');
  console.log(`Input: "${testInput}"`);
  console.log(`Result: ${JSON.stringify(usdResult, null, 2)}\n`);
  
  // Test with UZS  
  console.log('🇺🇿 Testing with UZS:');
  const uzsResult = PureCurrencyValidator.validateAmount(testInput, 'UZS');
  console.log(`Input: "${testInput}"`);
  console.log(`Result: ${JSON.stringify(uzsResult, null, 2)}\n`);
  
  // Let's trace through the validation process step by step
  console.log('=== STEP-BY-STEP BREAKDOWN ===\n');
  
  // Step 1: Input cleaning
  console.log('Step 1: Input cleaning');
  console.log(`Original: "${testInput}"`);
  
  // Simulate the cleanInput function
  const cleaned = testInput
    .replace(/[$сўм\s,]/g, '') // Remove currency symbols, spaces, commas
    .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
    .trim();
  
  console.log(`After cleaning: "${cleaned}"`);
  console.log(`What was removed: spaces and comma\n`);
  
  // Step 2: Format validation
  console.log('Step 2: Format validation');
  const decimalMatches = cleaned.match(/\./g);
  console.log(`Decimal points found: ${decimalMatches ? decimalMatches.length : 0}`);
  
  const minusMatches = cleaned.match(/-/g);
  console.log(`Minus signs found: ${minusMatches ? minusMatches.length : 0}`);
  
  if (cleaned.includes('.')) {
    const decimalPart = cleaned.split('.')[1];
    console.log(`Decimal part: "${decimalPart}"`);
    console.log(`Decimal places: ${decimalPart ? decimalPart.length : 0}`);
  }
  console.log();
  
  // Step 3: Parse to number
  console.log('Step 3: Parse to number');
  const numericValue = parseFloat(cleaned);
  console.log(`Parsed value: ${numericValue}`);
  console.log(`Is valid number: ${!isNaN(numericValue)}\n`);
  
  // Step 4: Range validation for USD
  console.log('Step 4: Range validation for USD');
  console.log(`Value: ${numericValue}`);
  console.log(`USD Max allowed: 1,000,000`);
  console.log(`Exceeds USD limit: ${numericValue > 1000000 ? 'YES' : 'NO'}\n`);
  
  // Step 5: Range validation for UZS
  console.log('Step 5: Range validation for UZS');
  console.log(`Value: ${numericValue}`);
  console.log(`UZS Max allowed: 50,000,000,000`);
  console.log(`Exceeds UZS limit: ${numericValue > 50000000000 ? 'YES' : 'NO'}`);
  console.log(`Has decimals (not allowed for UZS): ${cleaned.includes('.') ? 'YES' : 'NO'}\n`);
  
  // Test some variations
  console.log('=== TESTING VARIATIONS ===\n');
  
  const variations = [
    "3942040509.44",     // No spaces, dot decimal
    "3,942,040,509.44",  // US format
    "3 942 040 509",     // No decimals
    "3942040509",        // Simple format
    "3.942.040.509,44",  // European format (will fail)
  ];
  
  variations.forEach(variation => {
    console.log(`Testing: "${variation}"`);
    const usdTest = PureCurrencyValidator.validateAmount(variation, 'USD');
    const uzsTest = PureCurrencyValidator.validateAmount(variation, 'UZS');
    
    console.log(`  USD: ${usdTest.isValid ? '✅ ' + usdTest.formatted : '❌ ' + usdTest.error}`);
    console.log(`  UZS: ${uzsTest.isValid ? '✅ ' + uzsTest.formatted : '❌ ' + uzsTest.error}`);
    console.log();
  });
  
  return { usdResult, uzsResult };
}

// Manual test execution
testSpecificInput();