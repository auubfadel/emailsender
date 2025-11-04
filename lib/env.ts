import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(24),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().int()),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === 'true')
    .optional()
    .default('false' as unknown as boolean),

  DEFAULT_FROM_NAME: z.string().min(1),
  DEFAULT_FROM_EMAIL: z.string().email(),
  DEFAULT_REPLY_TO: z.string().email(),

  SEND_RATE_PER_SEC: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive())
    .default('10' as unknown as number),
  MAX_CONCURRENCY: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().positive())
    .default('3' as unknown as number),

  AWS_SNS_VERIFY_TOKEN: z.string().min(8),
  PUBLIC_SIGNUP_ENABLED: z
    .string()
    .transform((v) => v === 'true')
    .optional()
    .default('false' as unknown as boolean)
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Redact potential secrets in error output
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}

