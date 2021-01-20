import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as exhbs from 'express-handlebars';
import * as cookieParser from 'cookie-parser';
import * as methodOverride from 'method-override';
import { join } from 'path';
import { AppModule } from './app.module';
import { UnauthorizedFilter } from './filters/unauthorized.filter';
import { formatDistanceToNow } from 'date-fns';

const hbs = exhbs.create({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: join(__dirname, '..', 'views/layouts'),
  partialsDir: join(__dirname, '..', 'views/partials'),
  helpers: {
    formatDate: function (dateString: string): string {
      const date = new Date(dateString);
      const newDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60 * 1000,
      );
      const offset = date.getTimezoneOffset() / 60;
      const hours = date.getHours();
      newDate.setHours(hours - offset);
      return newDate.toLocaleTimeString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    dateFromNow: function (dateString: string): string {
      const sinceDate = new Date(dateString);
      return formatDistanceToNow(sinceDate);
    },
  },
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
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
