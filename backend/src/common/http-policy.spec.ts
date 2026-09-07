import express from 'express';
import request from 'supertest';
import { canonicalHttpsRedirect, configureProxyTrust } from './http-policy';

describe('HTTPS redirects and proxy trust', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = {
      ENFORCE_HTTPS: 'true',
      CANONICAL_API_ORIGIN: 'https://api.example.test',
    };
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  function app() {
    const server = express();
    configureProxyTrust(server);
    server.use(canonicalHttpsRedirect()!);
    server.get('/check', (req, res) => res.json({ ip: req.ip }));
    return server;
  }

  it('ignores a forged Host and untrusted forwarded protocol', async () => {
    await request(app())
      .post('/check?x=1')
      .set('Host', 'attacker.test')
      .set('X-Forwarded-Proto', 'https')
      .expect(308)
      .expect('Location', 'https://api.example.test/check?x=1');
    await request(app())
      .get('//attacker.test/path')
      .expect(308)
      .expect('Location', 'https://api.example.test//attacker.test/path');
  });

  it('uses forwarded client addresses only from configured ingress peers', async () => {
    process.env.TRUST_PROXY = 'loopback';
    await request(app())
      .get('/check')
      .set('X-Forwarded-Proto', 'https')
      .set('X-Forwarded-For', '198.51.100.7')
      .expect(200)
      .expect({ ip: '198.51.100.7' });
    process.env.TRUST_PROXY = '10.0.0.0/8';
    await request(app())
      .get('/check')
      .set('X-Forwarded-Proto', 'https')
      .expect(308);
    process.env.TRUST_PROXY = 'true';
    expect(() => app()).toThrow('trusted proxy IP addresses');
  });
});
