import { config } from "dotenv";
config();

export const configEnv = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  CASHIER_ID: process.env.CASHIER_ID || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
};
