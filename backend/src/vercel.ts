import type { IncomingMessage, ServerResponse } from 'node:http';
import express from 'express';
import { createNestApplication } from './bootstrap';

let app: express.Express | null = null;
let appPromise: Promise<express.Express> | null = null;

async function createApp(): Promise<express.Express> {
  const nestApp = await createNestApplication();
  await nestApp.init();
  return nestApp.getHttpAdapter().getInstance() as express.Express;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    if (!app) {
      appPromise ??= createApp();

      try {
        app = await appPromise;
      } catch (bootstrapError) {
        // Drop the poisoned promise so the next invocation retries bootstrap
        // instead of failing instantly forever.
        appPromise = null;
        throw bootstrapError;
      }
    }

    return app(req, res);
  } catch (error) {
    console.error('Failed to bootstrap Vercel backend handler', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });

    if (!res.headersSent) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ error: 'Backend bootstrap failed' }));
    }
  }
}
