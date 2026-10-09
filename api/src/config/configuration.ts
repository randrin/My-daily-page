export default () => ({
  templateAi: {
    apiKey: process.env.TEMPLATE_AI_OPENAI_API_KEY,
    model: process.env.TEMPLATE_AI_MODEL,
  },
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === 'true',
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    apiUrl: process.env.PUBLIC_API_URL ?? 'http://localhost:5500',
  },
  push: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
  },
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER ?? 'twilio',
  },
  ultramsg: {
    instanceId: process.env.ULTRAMSG_INSTANCE_ID,
    webhookSecret: process.env.ULTRAMSG_WEBHOOK_SECRET,
    token: process.env.ULTRAMSG_TOKEN,
  },
  twilio: {
    inboundUrl: process.env.TWILIO_INBOUND_URL,
    whatsappQuickReplySid: process.env.TWILIO_WHATSAPP_QUICK_REPLY_SID,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    whatsappContentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID,
  },
  storage: {
    driver:
      process.env.STORAGE_DRIVER ??
      (process.env.NODE_ENV === 'test' ? 'memory' : 's3'),
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSsl: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'mydailypage',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'mydailypage-minio',
    bucket: process.env.MINIO_BUCKET ?? 'my-daily-page',
    publicUrl: process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000',
  },
});
