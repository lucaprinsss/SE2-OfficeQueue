import { jest } from '@jest/globals';

// Mock del repository PRIMA di importare il controller
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

// Importa il controller DOPO aver mockato il repository
const { createTicket } = await import('../../../controllers/ticketController.js');

describe('TicketController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should return 400 if serviceType is missing', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing serviceType' });
      expect(mockCreateTicket).not.toHaveBeenCalled();
    });

    it('should create ticket successfully and return 201', async () => {
      const mockTicketId = 123;
      const req = { body: { serviceType: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockCreateTicket.mockResolvedValue(mockTicketId);

      await createTicket(req, res);

      expect(mockCreateTicket).toHaveBeenCalledWith(1);
      expect(mockCreateTicket).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTicketId);
    });

    it('should return 500 if ticket creation returns null', async () => {
      const req = { body: { serviceType: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockCreateTicket.mockResolvedValue(null);

      await createTicket(req, res);

      expect(mockCreateTicket).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ticket creation failed' });
    });

    it('should return 500 if repository throws an error', async () => {
      const dbError = new Error('Database connection failed');
      const req = { body: { serviceType: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockCreateTicket.mockRejectedValue(dbError);

      await createTicket(req, res);

      expect(mockCreateTicket).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unable to create ticket',
        details: 'Database connection failed'
      });
    });

    it('should handle different serviceType values', async () => {
      const mockTicketId = 456;
      const req = { body: { serviceType: 3 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockCreateTicket.mockResolvedValue(mockTicketId);

      await createTicket(req, res);

      expect(mockCreateTicket).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTicketId);
    });
  });
});
