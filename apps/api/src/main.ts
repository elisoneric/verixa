import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // SEC-3: Startup validation for required production environment variables
  if (process.env.NODE_ENV === 'production') {
    const requiredEnv = ['JWT_SECRET', 'SYSTEM_ENCRYPTION_KEY', 'DB_PASSWORD'];
    for (const key of requiredEnv) {
      const val = process.env[key];
      if (!val || val.includes('super_secret') || val.includes('01234567890123456789')) {
        throw new Error(`[FATAL] Insecure or missing required environment variable in production: ${key}`);
      }
    }
  }

  const app = await NestFactory.create(AppModule);

  // DEPLOY-2: CORS Lockdown
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : [
        'https://verixa.esam.com.ng',
        'https://api-verixa.esam.com.ng',
        'https://dashboard-verixa.esam.com.ng',
        'https://docs-verixa.esam.com.ng',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
      ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (e.g. mobile apps, curl, server-to-server) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Api-Key',
      'x-api-key',
      'Idempotency-Key',
      'idempotency-key',
      'x-verixa-environment',
      'x-paystack-signature',
    ],
  });

  // CODE-1: Global request payload validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Verixa ID API is running on http://0.0.0.0:${port}`);
}
bootstrap();
