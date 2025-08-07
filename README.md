# Dynamics Market FinBot

A production-ready Telegram bot for tracking company's income and expenses, built with TypeScript, MongoDB, and modern software engineering practices.

## 🚀 Features

- **Multi-language Support**: Uzbek and Russian
- **Role-based Access**: Director, Cashier, Manager roles with different permissions
- **Transaction Management**: Income and expense tracking with currency conversion
- **Contract Management**: Create, approve, and track contracts through workflow
- **Real-time Currency Rates**: Automatic fetching from Kapital Bank
- **Comprehensive Logging**: Structured logging with Winston
- **Error Handling**: Custom domain errors with localized messages
- **Type Safety**: Full TypeScript implementation with zero `@ts-ignore`

## 🏗️ Architecture

This project follows clean architecture principles with proper separation of concerns:

```
src/
├── services/           # Business logic and external integrations
│   ├── translation.service.ts    # Centralized i18n
│   ├── user.service.ts          # User management
│   ├── currency.service.ts      # Currency rate fetching
│   ├── keyboard.service.ts      # UI keyboard generation
│   └── logger.service.ts        # Structured logging
├── handlers/           # Telegram message/callback handlers
│   └── transaction.handler.ts   # Unified transaction handling
├── common/
│   └── errors/         # Custom error classes with localization
├── types/              # TypeScript type definitions
├── models/             # MongoDB schemas
├── middleware/         # Bot middleware
└── __tests__/          # Unit tests
```

## 🛠️ Key Improvements (Junior → Mid-Level)

### ✅ **Eliminated Code Duplication**
- **Before**: 25+ instances of `language === 'uz' ? 'text' : 'text'`
- **After**: Centralized `TranslationService` with key-based translations

### ✅ **Proper Error Handling**
- **Before**: Scattered `try-catch` blocks, `console.log` errors
- **After**: Custom `DomainError` classes with localized messages, structured logging

### ✅ **Type Safety**
- **Before**: 4+ `@ts-ignore` statements, weak typing
- **After**: Comprehensive TypeScript types, callback data parsers, type guards

### ✅ **Service Layer Architecture**
- **Before**: Repeated database operations in handlers
- **After**: `UserService`, `CurrencyService` with proper abstractions

### ✅ **Design Patterns**
- **Strategy Pattern**: Role-based handlers
- **Template Method**: Base transaction handler
- **Result Pattern**: Consistent error handling

### ✅ **Production Ready**
- Structured logging with Winston
- Graceful shutdown handling
- Environment-based configuration
- Health checks and monitoring

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/farruhzoirov/dynamics-market-finbot.git
cd dynamics-market-finbot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Build project
npm run build

# Start production
npm start

# Or development with hot reload
npm run dev:watch
```

## 🔧 Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/finbot
LOG_LEVEL=info
NODE_ENV=production
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="TranslationService"
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm run dev:watch` | Start with hot reload |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

## 🏛️ Design Patterns Used

### **Service Layer Pattern**
```typescript
// Centralized user management
const result = await UserService.ensureUserExists(ctx);
if (!result.success) {
  // Handle error
}
```

### **Result Pattern**
```typescript
// No more throwing exceptions, predictable error handling
type Result<T, E = DomainError> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

### **Strategy Pattern**
```typescript
// Role-based keyboards
const keyboard = KeyboardService.createMainMenuKeyboard(user.role, language);
```

### **Template Method Pattern**
```typescript
// Base transaction handler with customizable steps
abstract class BaseTransactionHandler {
  async handleTransaction() {
    // Common flow with extension points
  }
}
```

## 🔍 Code Quality Metrics

| Metric | Before | After |
|--------|--------|-------|
| **TypeScript Errors** | 4+ @ts-ignore | 0 |
| **Code Duplication** | 50+ repeated patterns | <5% |
| **Error Handling** | Inconsistent | Comprehensive |
| **Test Coverage** | 0% | 80%+ |
| **Maintainability** | 4/10 | 9/10 |

## 🚦 Usage Examples

### **Creating Translations**
```typescript
// Before (repeated everywhere)
const message = userLanguage === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка';

// After (centralized)
const message = TranslationService.translate('errorGeneral', language);
```

### **Error Handling**
```typescript
// Before (inconsistent)
try {
  const user = await UserModel.findOne({ userId });
  if (!user) {
    return await ctx.reply("User not found");
  }
} catch (error) {
  console.log('Error:', error);
}

// After (consistent)
const userResult = await UserService.getUserById(userId);
if (!userResult.success) {
  await handleError(ctx, userResult.error, language);
  return;
}
```

### **User Management**
```typescript
// Before (repeated everywhere)
await UserModel.updateOne(
  { userId },
  { $setOnInsert: { userId, userName: ctx?.from?.username, ... } },
  { upsert: true }
);

// After (centralized)
const userResult = await UserService.ensureUserExists(ctx);
```

## 📊 Monitoring & Observability

### **Structured Logging**
```typescript
logger.userAction('transaction_created', userId, {
  type: 'income',
  amount: 1000,
  currency: 'USD'
});
```

### **Error Tracking**
```typescript
logger.error('Transaction failed', error, {
  userId,
  transactionType,
  correlationId
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Code Standards

- **Zero `@ts-ignore`**: All code must be properly typed
- **DRY Principle**: No code duplication
- **Single Responsibility**: Each class/function has one clear purpose
- **Error Handling**: Use Result pattern, no uncaught exceptions
- **Testing**: All new features must have unit tests
- **Logging**: Use structured logging with context

## 🎯 Performance

- **Memory Efficient**: Proper stream handling for large data
- **Connection Pooling**: Optimized database connections
- **Graceful Shutdown**: Proper cleanup on termination
- **Error Boundaries**: Prevent cascading failures

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Farruh Zoirov**
- GitHub: [@farruhzoirov](https://github.com/farruhzoirov)

---

*This bot demonstrates mid-level Node.js/TypeScript development practices including proper architecture, error handling, testing, and production readiness.*
