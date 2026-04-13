import request from 'supertest';
import app from '../app.js';

describe('Auth Endpoints', () => {
  describe('POST /auth/magic-link', () => {
    it('should request a magic link', async () => {
      const res = await request(app)
        .post('/auth/magic-link')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('test@example.com');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/auth/magic-link')
        .send({ email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject missing email', async () => {
      const res = await request(app)
        .post('/auth/magic-link')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me (Protected Route)', () => {
    it('should reject request without token', async () => {
      const res = await request(app).get('/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
