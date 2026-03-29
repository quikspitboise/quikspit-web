import { Module } from '@nestjs/common';
import { LoggerModule } from '../common/logger.module';
import { AdminAllowlistGuard } from './admin-allowlist.guard';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  imports: [LoggerModule],
  providers: [AuthService, ClerkAuthGuard, AdminAllowlistGuard],
  exports: [AuthService, ClerkAuthGuard, AdminAllowlistGuard],
})
export class AuthModule {}
