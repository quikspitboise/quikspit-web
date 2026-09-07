import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('live')
  live() {
    return this.health();
  }

  @Get('ready')
  async ready() {
    let timeout: ReturnType<typeof setTimeout>;
    try {
      if (!this.dataSource.isInitialized) throw new Error('Database unavailable');
      await Promise.race([
        this.dataSource.query('SELECT 1'),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Readiness deadline exceeded')), 1500);
        }),
      ]);
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException('Database is not ready');
    } finally {
      clearTimeout(timeout);
    }
  }
}
