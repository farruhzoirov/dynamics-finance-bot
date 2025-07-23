// import type { Context } from "grammy"
// import { authenticateUser, hasPermission } from "../auth.ts"
// import { database } from "../database.ts"
// import type { CashTransaction, UserSession } from "../types.ts"
// import { validateAmount, formatCurrency, calculateBalance } from "../utils.ts"
// import { getMainMenuKeyboard } from "../keyboards.ts"

// const userSessions = new Map<number, UserSession>()

// export async function handleCashIncome(ctx: Context) {
//   const user = await authenticateUser(ctx)
//   if (!user || !hasPermission(user.role, ["director", "cashier"])) {
//     await ctx.reply("❌ Sizga ushbu amalni bajarish uchun ruxsat yo'q.")
//     return
//   }

//   userSessions.set(user.telegramId, { step: "income_amount", data: { type: "kirim" } })
//   await ctx.reply("💰 **Pul kirim**\n\nKirim miqdorini kiriting (so'mda):")
// }

// export async function handleCashExpense(ctx: Context) {
//   const user = await authenticateUser(ctx)
//   if (!user || !hasPermission(user.role, ["director", "cashier"])) {
//     await ctx.reply("❌ Sizga ushbu amalni bajarish uchun ruxsat yo'q.")
//     return
//   }

//   userSessions.set(user.telegramId, { step: "expense_amount", data: { type: "chiqim" } })
//   await ctx.reply("💸 **Pul chiqim**\n\nChiqim miqdorini kiriting (so'mda):")
// }

// export async function handleCashTransaction(ctx: Context) {
//   const user = await authenticateUser(ctx)
//   if (!user) return

//   const session = userSessions.get(user.telegramId)
//   if (!session) return

//   const text = ctx.message?.text
//   if (!text) {
//     await ctx.reply("❌ Iltimos, matn kiriting.")
//     return
//   }

//   const isIncome = session.data.type === "kirim"

//   switch (session.step) {
//     case "income_amount":
//     case "expense_amount":
//       const amount = validateAmount(text)
//       if (!amount) {
//         await ctx.reply("❌ Noto'g'ri miqdor. Iltimos, raqam kiriting.")
//         return
//       }
//       session.data.amount = amount
//       session.step = isIncome ? "income_description" : "expense_description"
//       await ctx.reply("📝 Tavsif kiriting:")
//       break

//     case "income_description":
//     case "expense_description":
//       const description = text.trim()

//       const transaction: CashTransaction = {
//         type: session.data.type,
//         amount: session.data.amount,
//         date: new Date(),
//         description,
//         createdBy: user.telegramId,
//         createdAt: new Date(),
//       }

//       await database.cashTransactions.insertOne(transaction)
//       userSessions.delete(user.telegramId)

//       const transactionType = isIncome ? "Kirim" : "Chiqim"
//       const emoji = isIncome ? "💰" : "💸"

//       await ctx.reply(
//         `✅ **${transactionType} muvaffaqiyatli qo'shildi!**\n\n` +
//           `${emoji} Miqdor: ${formatCurrency(transaction.amount)}\n` +
//           `📝 Tavsif: ${description}`,
//         {
//           parse_mode: "Markdown",
//           reply_markup: getMainMenuKeyboard(user.role),
//         },
//       )
//       break
//   }
// }

// export async function handleBalance(ctx: Context) {
//   const user = await authenticateUser(ctx)
//   if (!user) return

//   try {
//     const balance = await calculateBalance()
//     const balanceColor = balance >= 0 ? "💚" : "🔴"

//     await ctx.reply(`💳 **Joriy qoldiq**\n\n${balanceColor} ${formatCurrency(balance)}`, {
//       parse_mode: "Markdown",
//       reply_markup: getMainMenuKeyboard(user.role),
//     })
//   } catch (error) {
//     await ctx.reply("❌ Qoldiqni hisoblashda xatolik yuz berdi.")
//   }
// }
