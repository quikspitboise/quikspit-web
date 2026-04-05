import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createNestApplication } from './bootstrap';

let app: express.Express | null = null;
let appPromise: Promise<express.Express> | null = null;

async function createApp(): Promise<express.Express> {
  const nestApp = await createNestApplication();
  await nestApp.init();
  return nestApp.getHttpAdapter().getInstance() as express.Express;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!app) {
      appPromise ??= createApp();
      app = await appPromise;
    }

    return app(req, res);
  } catch (error) {
    console.error('Failed to bootstrap Vercel backend handler', error);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Backend bootstrap failed' });
    }
  }
}
