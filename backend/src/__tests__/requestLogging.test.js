const request = require('supertest');
const express = require('express');

/**
 * Tests for request logging middleware
 * Verifies that all requests are properly logged with method, path, status code, and duration
 */
describe('Request Logging Middleware', () => {
  let app;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Create a test app with the logging middleware
    app = express();
    
    // Import and apply the logging middleware (same as in app.js)
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
    
    app.use(express.json());
    
    // Set up console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log successful GET requests', async () => {
    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'success' });
    });

    await request(app).get('/test');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/GET \/test 200 - \d+ms/);
  });

  it('should log POST requests with status code', async () => {
    app.post('/test', (req, res) => {
      res.status(201).json({ id: 1 });
    });

    await request(app)
      .post('/test')
      .send({ data: 'test' });

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/POST \/test 201 - \d+ms/);
  });

  it('should log PUT requests', async () => {
    app.put('/test/:id', (req, res) => {
      res.status(200).json({ updated: true });
    });

    await request(app)
      .put('/test/123')
      .send({ data: 'updated' });

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/PUT \/test\/123 200 - \d+ms/);
  });

  it('should log DELETE requests', async () => {
    app.delete('/test/:id', (req, res) => {
      res.status(204).send();
    });

    await request(app).delete('/test/123');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/DELETE \/test\/123 204 - \d+ms/);
  });

  it('should log error status codes (4xx)', async () => {
    app.get('/notfound', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    await request(app).get('/notfound');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/GET \/notfound 404 - \d+ms/);
  });

  it('should log error status codes (5xx)', async () => {
    app.get('/error', (req, res) => {
      res.status(500).json({ error: 'Server error' });
    });

    await request(app).get('/error');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/GET \/error 500 - \d+ms/);
  });

  it('should log request duration in milliseconds', async () => {
    app.get('/slow', (req, res) => {
      // Simulate a slow request
      setTimeout(() => {
        res.status(200).json({ message: 'done' });
      }, 50);
    });

    await request(app).get('/slow');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    // Duration should be at least 50ms
    const durationMatch = logCall.match(/(\d+)ms/);
    expect(durationMatch).toBeTruthy();
    const duration = parseInt(durationMatch[1]);
    expect(duration).toBeGreaterThanOrEqual(45); // Allow some margin
  });

  it('should log requests with query parameters', async () => {
    app.get('/search', (req, res) => {
      res.status(200).json({ results: [] });
    });

    await request(app).get('/search?q=test&page=1');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/GET \/search 200 - \d+ms/);
  });

  it('should log multiple requests separately', async () => {
    app.get('/test1', (req, res) => res.status(200).json({}));
    app.get('/test2', (req, res) => res.status(200).json({}));

    await request(app).get('/test1');
    await request(app).get('/test2');

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy.mock.calls[0][0]).toMatch(/GET \/test1 200/);
    expect(consoleLogSpy.mock.calls[1][0]).toMatch(/GET \/test2 200/);
  });

  it('should log requests even when response is sent without explicit status', async () => {
    app.get('/default', (req, res) => {
      res.json({ message: 'ok' }); // Default status is 200
    });

    await request(app).get('/default');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/GET \/default 200 - \d+ms/);
  });
});

