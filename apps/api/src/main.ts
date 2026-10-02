import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Verixa ID API is running on http://0.0.0.0:${port}`);
}
bootstrap();
