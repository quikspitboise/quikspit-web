import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint to get CSRF token for frontend
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request): { csrfToken: string } {
    // The csrf-csrf middleware attaches generateCsrfToken to app.locals
    const generateCsrfToken = req.app.locals.generateCsrfToken;
    if (generateCsrfToken) {
      const csrfToken = generateCsrfToken(req, req.res);
      return { csrfToken };
    }
    return { csrfToken: 'disabled' };
  }
}
