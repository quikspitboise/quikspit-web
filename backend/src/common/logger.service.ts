import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    // Define format for sanitizing sensitive data
    const sanitizeFormat = winston.format((info) => {
      // Sanitize common sensitive fields
      const sensitiveFields = [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        'customerPhone',
        'customerEmail',
        'email',
        'phone',
      ];

      if (info.message && typeof info.message === 'object') {
        info.message = this.sanitizeObject(info.message, sensitiveFields);
      }

      // Sanitize metadata
      if (info.metadata) {
        info.metadata = this.sanitizeObject(info.metadata, sensitiveFields);
      }

      return info;
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        sanitizeFormat(),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'quickspit-backend' },
      transports: [
        // Write all logs with importance level of `error` or higher to `error.log`
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Write all logs to `combined.log`
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // If we're not in production, log to the console with a simpler format
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...metadata }) => {
              let msg = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(metadata).length > 0 && metadata.service) {
                const { service, ...rest } = metadata;
                if (Object.keys(rest).length > 0) {
                  msg += ` ${JSON.stringify(rest)}`;
                }
              }
              return msg;
            }),
          ),
        }),
      );
    }
  }

  /**
   * Sanitize sensitive fields in objects by replacing with masked values
   */
  private sanitizeObject(obj: any, sensitiveFields: string[]): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in sanitized) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        // Mask sensitive data
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
          sanitized[key] = '***REDACTED***';
        }
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeObject(sanitized[key], sensitiveFields);
      }
    }

    return sanitized;
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }

  error(message: any, trace?: string, ...optionalParams: any[]) {
    this.logger.error(message, { trace, ...optionalParams });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
  }

  /**
   * Log with specific context
   */
  logWithContext(level: string, message: string, context?: any) {
    this.logger.log(level, message, { context });
  }
}
