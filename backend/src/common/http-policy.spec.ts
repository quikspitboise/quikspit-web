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

  it.each(['::ffff:10.0.0.0/8', '::/1'])(
    'does not trust IPv4 clients through an incomplete IPv6 subnet (%s)',
    async (subnet) => {
      process.env.TRUST_PROXY = subnet;
      await request(app())
        .get('/check')
        .set('X-Forwarded-Proto', 'https')
        .set('X-Forwarded-For', '198.51.100.7')
        .expect(308);
    },
  );

  it.each(['10.0.0.0/8', '::ffff:10.0.0.0/104'])(
    'retains correctly scoped trusted IPv4 subnets (%s)',
    (subnet) => {
      process.env.TRUST_PROXY = subnet;
      const server = app();
      const trust = server.get('trust proxy fn') as (
        address: string,
      ) => boolean;
      expect(trust('10.1.2.3')).toBe(true);
      expect(trust('198.51.100.7')).toBe(false);
    },
  );
});
