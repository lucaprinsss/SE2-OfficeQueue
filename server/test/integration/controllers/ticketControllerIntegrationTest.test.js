import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockCreateTicket = jest.fn();
const mockGetNextTicketForCounter = jest.fn();
const mockServeTicket = jest.fn();
const mockGetTicketById = jest.fn();
const mockGetQueueLength = jest.fn();

// Mock dei repository PRIMA di importare il controller
jest.unstable_mockModule('../../../repositories/ticketRepository.js', () => ({
  createTicket: mockCreateTicket,
  getNextTicketForCounter: mockGetNextTicketForCounter,
  serveTicket: mockServeTicket,
  getTicketById: mockGetTicketById,
  getQueueLength: mockGetQueueLength,
}));

// Import controller e routes DOPO i mock
const ticketRoutes = await import('../../../routes/ticketRoutes.js');

const app = express();
app.use(express.json());
app.use('/tickets', ticketRoutes.default);

describe('TicketController Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a ticket successfully and return 201', async () => {
    mockCreateTicket.mockResolvedValue({ id: 1, serviceType: 1 });

    const response = await request(app)
      .post('/tickets')
      .send({ serviceType: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, serviceType: 1 });
  });

  it('should return 400 if serviceType is missing', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({}); // niente serviceType

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing serviceType');
  });

  it('should return the next ticket for a given counterId', async () => {
    const ticket = { id: 1, serviceType: 1 };
    mockGetNextTicketForCounter.mockResolvedValue(ticket);
    mockServeTicket.mockResolvedValue(true);
    mockGetTicketById.mockResolvedValue(ticket);

    const response = await request(app)
      .post('/tickets/counters/1/next-ticket')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('servedTicket');
    expect(response.body.servedTicket).toEqual(ticket);
  });

  it('should return 404 if no tickets are available for counter', async () => {
    mockGetNextTicketForCounter.mockResolvedValue(null);

    const response = await request(app)
      .post('/tickets/counters/1/next-ticket')
      .send();

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'No tickets to serve for this counter.');
  });

  it('should return the queue length for a service', async () => {
    mockGetQueueLength.mockResolvedValue(5);

    const response = await request(app)
      .get('/tickets/queue/1/length')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ serviceType: 1, queueLength: 5 });
  });

});
