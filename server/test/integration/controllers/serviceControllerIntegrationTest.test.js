import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock del repository PRIMA di importare il controller
const mockGetServices = jest.fn();

jest.unstable_mockModule('../../../repositories/serviceRepository.js', () => ({
  getServices: mockGetServices,
}));

// Import controller e router DOPO aver fatto il mock
const serviceRoutes = await import('../../../routes/serviceRoutes.js');

const app = express();
app.use(express.json());
app.use('/services', serviceRoutes.default);

describe('ServiceController Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /services should return all services', async () => {
    const fakeServices = [
      { id: 1, name: 'Service A' },
      { id: 2, name: 'Service B' },
    ];
    mockGetServices.mockResolvedValue(fakeServices);

    const response = await request(app).get('/services');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeServices);
    expect(mockGetServices).toHaveBeenCalledTimes(1);
  });

  it('GET /services should return empty array if no services', async () => {
    mockGetServices.mockResolvedValue([]);

    const response = await request(app).get('/services');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /services should return 500 if repository throws', async () => {
    mockGetServices.mockRejectedValue(new Error('DB failure'));

    const response = await request(app).get('/services');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Unable to fetch services');
    expect(response.body).toHaveProperty('details', 'DB failure');
  });

});
