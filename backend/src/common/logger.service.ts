import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const sanitizeFormat = winston.format((info) => {
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

      if (info.metadata) {
        info.metadata = this.sanitizeObject(info.metadata, sensitiveFields);
      }

      return info;
    });

    const consoleTransport = new winston.transports.Console({
      format:
        process.env.NODE_ENV !== 'production'
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(
                ({ level, message, timestamp, ...metadata }) => {
                  let msg = `${timestamp} [${level}]: ${message}`;

                  if (Object.keys(metadata).length > 0 && metadata.service) {
                    const rest = { ...metadata };
                    delete rest.service;

                    if (Object.keys(rest).length > 0) {
                      msg += ` ${JSON.stringify(rest)}`;
                    }
                  }

                  return msg;
                },
              ),
            )
          : undefined,
    });

    const transports: winston.transport[] = [consoleTransport];

    if (this.shouldUseFileTransports()) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      );
    }

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
      transports,
    });
  }

  private shouldUseFileTransports(): boolean {
    if (process.env.ENABLE_FILE_LOGGING === 'false') {
      return false;
    }

    if (process.env.ENABLE_FILE_LOGGING === 'true') {
      return true;
    }

    return !(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NOW_REGION
    );
  }

  private sanitizeObject(obj: any, sensitiveFields: string[]): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in sanitized) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
          sanitized[key] = '***REDACTED***';
        }
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
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

  logWithContext(level: string, message: string, context?: any) {
    this.logger.log(level, message, { context });
  }
}
