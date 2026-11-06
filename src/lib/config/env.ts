import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  APP_NAME: z.string().default("MomentLink"),
  APP_TIMEZONE: z.string().default("Asia/Ho_Chi_Minh"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  SESSION_SECRET: z.string().default("dev_session_secret_at_least_32_characters_long_for_security"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default("./public/uploads"),
  EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  EMAIL_FROM: z.string().default("no-reply@momentlink.vn"),
  PAYMENT_MODE: z.string().default("manual_review"),
  PAYMENT_PROVIDER: z.string().default("manual"),
  BANK_TRANSFER_DISPLAY_NAME: z.string().default("MOMENTLINK CORP"),
  BANK_TRANSFER_ACCOUNT_NUMBER: z.string().default("1903686868888"),
  BANK_TRANSFER_BANK_CODE: z.string().default("TCB"),
  GIFT_CARD_ACTIVATION_PEPPER: z.string().default("momentlink_dev_gift_card_pepper_secret_value_2026"),
  RATE_LIMIT_ENABLED: z.string().default("true"),
});

export const env = envSchema.parse(process.env);

