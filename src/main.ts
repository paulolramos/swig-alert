import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as exhbs from 'express-handlebars';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import { join } from 'path';
import { AppModule } from './app.module';
import { UnauthorizedFilter } from './filters/unauthorized.filter';

const hbs = exhbs.create({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: join(__dirname, '..', 'views/layouts'),
  partialsDir: join(__dirname, '..', 'views/partials'),
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.use(methodOverride('_method'));
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('hbs', hbs.engine);
  app.setViewEngine('hbs');
  app.useGlobalFilters(new UnauthorizedFilter());
  await app.listen(3000 || process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
