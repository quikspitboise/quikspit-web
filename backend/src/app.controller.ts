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
    // The csurf middleware attaches the token to req.csrfToken()
    // @ts-ignore - csrfToken is added by csurf middleware
    return { csrfToken: req.csrfToken ? req.csrfToken() : 'disabled' };
  }
}
