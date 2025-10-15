import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock del repository PRIMA di importare le routes
const mockCreateTicket = jest.fn();
const mockGetQueueLength = jest.fn();
const mockGetNextTicketForCounter = jest.fn();
const mockServeTicket = jest.fn();
const mockGetTicketById = jest.fn();

jest.unstable_mockModule('../../../repositories/ticketRepository.js', () => ({
  createTicket: mockCreateTicket,
  getQueueLength: mockGetQueueLength,
  getNextTicketForCounter: mockGetNextTicketForCounter,
  serveTicket: mockServeTicket,
  getTicketById: mockGetTicketById
}));

// Importa routes DOPO i mock
const ticketRoutes = (await import('../../../routes/ticketRoutes.js')).default;

// Setup Express app per i test
const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

describe('Ticket Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tickets', () => {
    it('should create a ticket successfully and return 201', async () => {
      const mockTicketId = 123;
      mockCreateTicket.mockResolvedValue(mockTicketId);

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceType: 1 })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toBe(mockTicketId);
      expect(mockCreateTicket).toHaveBeenCalledWith(1);
      expect(mockCreateTicket).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if serviceType is missing', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing serviceType' });
      expect(mockCreateTicket).not.toHaveBeenCalled();
    });

    it('should return 500 if repository throws an error', async () => {
      const dbError = new Error('Database connection failed');
      mockCreateTicket.mockRejectedValue(dbError);

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceType: 1 })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Unable to create ticket');
      expect(response.body).toHaveProperty('details', 'Database connection failed');
      expect(mockCreateTicket).toHaveBeenCalledWith(1);
    });

    it('should return 500 if ticket creation returns null', async () => {
      mockCreateTicket.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceType: 2 })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Ticket creation failed' });
      expect(mockCreateTicket).toHaveBeenCalledWith(2);
    });

    it('should handle different serviceType values', async () => {
      mockCreateTicket.mockResolvedValue(456);

      const response = await request(app)
        .post('/api/tickets')
        .send({ serviceType: 3 })
        .expect(201);

      expect(response.body).toBe(456);
      expect(mockCreateTicket).toHaveBeenCalledWith(3);
    });
  });
});
