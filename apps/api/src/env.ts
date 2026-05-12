import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_BOT_TOKEN: z.string(),
  WEB_URL: z.string().default("http://localhost:3000"),
  API_URL: z.string().default("http://localhost:3001"),
  API_PORT: z.coerce.number().default(3001),
  SESSION_SECRET: z.string(),

  // LLM Providers — at least one required
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),

  // Default LLM provider
  LLM_PROVIDER: z.enum(["anthropic", "openai", "gemini", "groq", "grok", "deepseek"]).default("anthropic"),

  // Stripe Billing (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
  STRIPE_STUDIO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_STUDIO_YEARLY_PRICE_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
