import { jest } from '@jest/globals';

// Mock del database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
};

// Mock del modulo db-connection PRIMA di importare il repository
jest.unstable_mockModule('../../../db/db-connection.js', () => ({
  db: mockDb
}));

// Mock del modello Ticket
jest.unstable_mockModule('../../../models/TicketDAO.js', () => ({
  Ticket: class Ticket {
    constructor(data) {
      if (data) {
        this.id = data.id;
        this.service_id = data.service_id;
        this.status = data.status;
        this.issue_time = data.issue_time;
        this.serve_time = data.serve_time;
        this.counter_id = data.counter_id;
        this.queue_date = data.queue_date;
      }
    }
  }
}));

// Importa il repository DOPO aver mockato le dipendenze
const { createTicket } = await import('../../../repositories/ticketRepository.js');

describe('TicketRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket and return its ID', async () => {
      const serviceType = 1;
      const mockLastID = 123;

      // Mock db.run per simulare inserimento riuscito
      mockDb.run.mockImplementation((sql, params, callback) => {
        // Simula il contesto 'this' con lastID
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await createTicket(serviceType);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO tickets (service_id) VALUES (?)',
        [serviceType],
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockLastID);
    });

    it('should create ticket with different service types', async () => {
      const serviceType = 3;
      const mockLastID = 456;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: mockLastID }, null);
      });

      const result = await createTicket(serviceType);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO tickets (service_id) VALUES (?)',
        [serviceType],
        expect.any(Function)
      );
      expect(result).toBe(mockLastID);
    });

    it('should reject with error if database insertion fails', async () => {
      const serviceType = 2;
      const dbError = new Error('Database connection failed');

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({}, dbError);
      });

      await expect(createTicket(serviceType)).rejects.toThrow('Database connection failed');
      expect(mockDb.run).toHaveBeenCalledTimes(1);
    });

    it('should reject with error if constraint violation occurs', async () => {
      const serviceType = 999; // servizio non esistente
      const constraintError = new Error('FOREIGN KEY constraint failed');

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({}, constraintError);
      });

      await expect(createTicket(serviceType)).rejects.toThrow('FOREIGN KEY constraint failed');
    });

    it('should pass correct SQL query to database', async () => {
      const serviceType = 5;
      
      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 789 }, null);
      });

      await createTicket(serviceType);

      const [sql, params] = mockDb.run.mock.calls[0];
      expect(sql).toBe('INSERT INTO tickets (service_id) VALUES (?)');
      expect(params).toEqual([serviceType]);
    });

    it('should return sequential IDs for multiple insertions', async () => {
      let currentId = 100;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: currentId++ }, null);
      });

      const id1 = await createTicket(1);
      const id2 = await createTicket(2);
      const id3 = await createTicket(1);

      expect(id1).toBe(100);
      expect(id2).toBe(101);
      expect(id3).toBe(102);
      expect(mockDb.run).toHaveBeenCalledTimes(3);
    });
  });
});
