import type { VercelRequest, VercelResponse } from '@vercel/node';

let handler: (req: VercelRequest, res: VercelResponse) => Promise<any>;

export default async function (req: VercelRequest, res: VercelResponse) {
  if (!handler) {
    const mod = require('../dist/vercel');
    handler = mod.default;
  }
  return handler(req, res);
}
