import { log } from 'console';
import * as fs from 'fs';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import helmet from 'helmet';
import compression from 'compression';
import { validationSchema } from './common/utils/environment.validations';

import { GlobalResponseInterceptor } from './common/interceptors/global.interceptor';

import { HttpExceptionFilter } from './common/filters/http.filter';
import { MessagesService } from './common/utils/messages/messages.service';
import { ApiKeyAuthGuard } from './common/guards/api-key-auth.guard';

async function bootstrap() {
  try {
    const { error }: { error?: Error } = validationSchema
      .prefs({ errors: { label: 'key' }, allowUnknown: true })
      .validate(process.env);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    // Configuración de variables de entorno
    const app = await NestFactory.create(AppModule, { rawBody: true });

    const configService = app.get(ConfigService);

    // Configuración de Stripe Webhook
    //app.use('/api/payments/stripe/webhook', bodyParser.raw({ type: '*/*' }));
    app.use(
      '/api/payments/stripe/webhook',
      express.raw({ type: 'application/json' }),
    );

    // Configuración global de pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Middleware de seguridad
    app.use(helmet());

    // Compresión de respuestas
    app.use(compression());

    // Configuración de CORS
    const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',');
    app.enableCors({
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Prefijo global para la API
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });
    app.setGlobalPrefix('api');

    const port = Number(process.env.APP_PORT);
    const { APP_NAME } = process.env;

    const messagesService = app.get(MessagesService);
    const reflector = app.get(Reflector);
    app.useGlobalGuards(
      new ApiKeyAuthGuard(configService, messagesService, reflector),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new GlobalResponseInterceptor(),
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const config = new DocumentBuilder()
      .setTitle(`API ${APP_NAME} Documentation`)
      .setDescription(`Requests for the API ${APP_NAME}`)
      .setVersion('1.0')
      .addTag(`${APP_NAME}`)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Guardar el documento Swagger en un archivo JSON
    fs.writeFileSync(
      './swagger-sample-api.json',
      JSON.stringify(document, null, 2),
    );
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        filter: true,
        showRequestDuration: true,
        classValidatorShim: true,
      },
    });

    await app.listen(port).then(() => {
      log(`
    ============================================
    =  HYBRID application execution info:
    =  HTTP PORT: ${port}
    =  NAME: ${APP_NAME}
    ============================================
     `);
    });
  } catch (err) {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  }
}

void bootstrap();
