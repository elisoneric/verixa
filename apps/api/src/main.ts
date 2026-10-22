import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // SEC-3: Startup validation for production environment variables
  if (process.env.NODE_ENV === 'production') {
    const requiredEnv = ['JWT_SECRET', 'SYSTEM_ENCRYPTION_KEY', 'DB_PASSWORD'];
    for (const key of requiredEnv) {
      const val = process.env[key];
      if (!val) {
        logger.warn(`[CONFIG WARNING] Missing recommended environment variable in production: ${key}. Using instance fallback.`);
      }
    }
  }

  const app = await NestFactory.create(AppModule);

  // DEPLOY-2: CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : [
        'https://verixa.esam.com.ng',
        'https://api-verixa.esam.com.ng',
        'https://dashboard-verixa.esam.com.ng',
        'https://docs-verixa.esam.com.ng',
        'https://verixaid.com',
        'https://www.verixaid.com',
        'https://api.verixaid.com',
        'https://dashboard.verixaid.com',
        'https://docs.verixaid.com',
        'https://app.verixaid.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3005',
      ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests, whitelisted origins, or any verixaid.com / esam.com.ng subdomains
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.verixaid.com') ||
        origin === 'https://verixaid.com' ||
        origin.endsWith('.esam.com.ng') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('129.121.118.93') ||
        process.env.NODE_ENV !== 'production'
      ) {
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
      'x-environment',
      'X-Environment',
      'environment',
      'x-mode',
      'X-Mode',
      'x-verixa-verbose',
      'x-app-id',
      'app-id',
      'appid',
      'Accept',
      'Origin',
      'X-Requested-With',
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
