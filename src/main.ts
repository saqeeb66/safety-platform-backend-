import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'; // ✅ ADD THIS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.use('/uploads', express.static('uploads'));

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://safety-platform-frontend.onrender.com'
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
