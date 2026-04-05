import { createNestApplication } from './bootstrap';
import { LoggerService } from './common/logger.service';

async function bootstrap() {
  const app = await createNestApplication();
  const logger = app.get(LoggerService);
  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');
  logger.log(`Backend server is running on port ${port}`);
}

bootstrap();
