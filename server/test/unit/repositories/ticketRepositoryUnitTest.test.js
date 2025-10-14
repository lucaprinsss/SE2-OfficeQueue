import { jest } from '@jest/globals';

// Database mock
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
};

// Module mocking for db-connection BEFORE importing the repository
jest.unstable_mockModule('../../../db/db-connection.js', () => ({
  db: mockDb
}));

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

// Import the repository after mocking dependencies
const { createTicket, getQueueLength, serveTicket, getTicketById, getNextTicketForCounter } = await import('../../../repositories/ticketRepository.js');

describe('TicketRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket and return its ID', async () => {
      const serviceType = 1;
      const mockLastID = 123;

      mockDb.run.mockImplementation((sql, params, callback) => {
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
      const serviceType = 999; // non-existent service
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

  
  describe('getQueueLength', () => {
    it('should return the correct queue length for a service', async () => {
      const serviceType = 1;
      const mockRow = { length: 5 };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await getQueueLength(serviceType);

      expect(mockDb.get).toHaveBeenCalledWith(expect.stringContaining('SELECT COUNT(*)'), [serviceType], expect.any(Function));
      expect(result).toBe(5);
    });

    it('should reject with error if query fails', async () => {
      const serviceType = 2;
      const dbError = new Error('Database error');

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(dbError);
      });

      await expect(getQueueLength(serviceType)).rejects.toThrow('Database error');
    });
  });

  describe('serveTicket', () => {
    it('should resolve true if ticket is successfully served', async () => {
      const ticketCode = 123;
      const counterId = 5;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const result = await serveTicket(ticketCode, counterId);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tickets'),
        [counterId, ticketCode],
        expect.any(Function)
      );
      expect(result).toBe(true);
    });

    it('should resolve false if no ticket was updated (e.g., already served)', async () => {
      const ticketCode = 456;
      const counterId = 3;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await serveTicket(ticketCode, counterId);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tickets'),
        [counterId, ticketCode],
        expect.any(Function)
      );
      expect(result).toBe(false);
    });

    it('should reject with error if update fails', async () => {
      const ticketCode = 789;
      const counterId = 2;
      const dbError = new Error('Update failed');

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({}, dbError);
      });

      await expect(serveTicket(ticketCode, counterId)).rejects.toThrow('Update failed');
    });

    it('should pass correct parameters in correct order', async () => {
      const ticketCode = 100;
      const counterId = 7;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      await serveTicket(ticketCode, counterId);

      const [sql, params] = mockDb.run.mock.calls[0];
      expect(sql).toContain('counter_id = ?');
      expect(sql).toContain('WHERE id = ?');
      expect(params).toEqual([counterId, ticketCode]); // counterId corresponds to counter_id, ticketCode to id
    });

    it('should only update tickets with status "waiting"', async () => {
      const ticketCode = 200;
      const counterId = 4;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      await serveTicket(ticketCode, counterId);

      const [sql] = mockDb.run.mock.calls[0];
      expect(sql).toContain("status = 'waiting'");
    });

    it('should set status to "served"', async () => {
      const ticketCode = 300;
      const counterId = 6;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      await serveTicket(ticketCode, counterId);

      const [sql] = mockDb.run.mock.calls[0];
      expect(sql).toContain("status = 'served'");
    });

    it('should set serve_time to CURRENT_TIMESTAMP', async () => {
      const ticketCode = 400;
      const counterId = 8;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      await serveTicket(ticketCode, counterId);

      const [sql] = mockDb.run.mock.calls[0];
      expect(sql).toContain('serve_time = CURRENT_TIMESTAMP');
    });

    it('should return false when trying to serve non-existent ticket', async () => {
      const ticketCode = 999;
      const counterId = 1;

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await serveTicket(ticketCode, counterId);

      expect(result).toBe(false);
    });

    it('should handle database constraint errors', async () => {
      const ticketCode = 500;
      const counterId = 999; // Non-existent counter
      const constraintError = new Error('FOREIGN KEY constraint failed');

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback.call({}, constraintError);
      });

      await expect(serveTicket(ticketCode, counterId)).rejects.toThrow('FOREIGN KEY constraint failed');
    });
  });

  describe('getTicketById', () => {
    it('should return a ticket when ID exists', async () => {
      const ticketId = 123;
      const mockRow = {
        id: 123,
        service_id: 1,
        status: 'waiting',
        issue_time: '2025-10-14 10:00:00',
        serve_time: null,
        counter_id: null,
        queue_date: '2025-10-14'
      };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await getTicketById(ticketId);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM tickets WHERE id = ?',
        [ticketId],
        expect.any(Function)
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(123);
      expect(result.service_id).toBe(1);
      expect(result.status).toBe('waiting');
    });

    it('should return null when ticket ID does not exist', async () => {
      const ticketId = 999;

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, undefined);
      });

      const result = await getTicketById(ticketId);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM tickets WHERE id = ?',
        [ticketId],
        expect.any(Function)
      );
      expect(result).toBeNull();
    });

    it('should return null when ticketId is null', async () => {
      const result = await getTicketById(null);

      expect(mockDb.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when ticketId is undefined', async () => {
      const result = await getTicketById(undefined);

      expect(mockDb.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should reject with error if database query fails', async () => {
      const ticketId = 456;
      const dbError = new Error('Database connection error');

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(dbError);
      });

      await expect(getTicketById(ticketId)).rejects.toThrow('Database connection error');
      expect(mockDb.get).toHaveBeenCalledTimes(1);
    });

    it('should return a served ticket correctly', async () => {
      const ticketId = 200;
      const mockRow = {
        id: 200,
        service_id: 2,
        status: 'served',
        issue_time: '2025-10-14 09:00:00',
        serve_time: '2025-10-14 09:15:00',
        counter_id: 3,
        queue_date: '2025-10-14'
      };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await getTicketById(ticketId);

      expect(result).toBeDefined();
      expect(result.id).toBe(200);
      expect(result.status).toBe('served');
      expect(result.counter_id).toBe(3);
      expect(result.serve_time).toBe('2025-10-14 09:15:00');
    });
  });

  describe('getNextTicketForCounter', () => {
    it('should return null when no services are assigned to counter', async () => {
      const counterId = 1;

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await getNextTicketForCounter(counterId);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT s.id, s.service_time'),
        [counterId],
        expect.any(Function)
      );
      expect(result).toBeNull();
    });

    it('should return null when services array is undefined', async () => {
      const counterId = 1;

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, undefined);
      });

      const result = await getNextTicketForCounter(counterId);

      expect(result).toBeNull();
    });

    it('should reject with error if database query for services fails', async () => {
      const counterId = 2;
      const dbError = new Error('Failed to fetch services');

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(dbError);
      });

      await expect(getNextTicketForCounter(counterId)).rejects.toThrow('Failed to fetch services');
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    it('should return null when all services have no waiting tickets', async () => {
      const counterId = 3;
      const mockServices = [
        { id: 1, service_time: 10 },
        { id: 2, service_time: 15 }
      ];

      // Mock db.all for services
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      // Mock db.get to count tickets (0 tickets for each service)
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { length: 0 });
      });

      const result = await getNextTicketForCounter(counterId);

      expect(mockDb.all).toHaveBeenCalledTimes(1);
      expect(mockDb.get).toHaveBeenCalledTimes(2); // One for each service
      expect(result).toBeNull();
    });

    it('should return the ticket from the longest queue', async () => {
      const counterId = 4;
      const mockServices = [
        { id: 1, service_time: 10 },
        { id: 2, service_time: 15 }
      ];
      const mockTicket = {
        id: 100,
        service_id: 2,
        status: 'waiting',
        issue_time: '2025-10-14 10:00:00',
        queue_date: '2025-10-14'
      };

      // Mock db.all for services
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      // Mock db.get to count tickets
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT(*)')) {
          // Service 1 has 2 tickets, Service 2 has 5 tickets
          if (params[0] === 1) {
            callback(null, { length: 2 });
          } else if (params[0] === 2) {
            callback(null, { length: 5 });
          }
        } else if (sql.includes('SELECT *')) {
          // Return the ticket from service 2 (longest queue)
          callback(null, mockTicket);
        }
      });

      const result = await getNextTicketForCounter(counterId);

      expect(result).toBeDefined();
      expect(result.id).toBe(100);
      expect(result.service_id).toBe(2);
    });

    it('should choose service with lower service_time when queues are equal', async () => {
      const counterId = 5;
      const mockServices = [
        { id: 1, service_time: 20 },
        { id: 2, service_time: 10 }, // Should choose this
        { id: 3, service_time: 15 }
      ];
      const mockTicket = {
        id: 200,
        service_id: 2,
        status: 'waiting',
        issue_time: '2025-10-14 11:00:00',
        queue_date: '2025-10-14'
      };

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT(*)')) {
          // All services have 3 tickets
          callback(null, { length: 3 });
        } else if (sql.includes('SELECT *')) {
          // Should request the ticket from service 2 (lower service_time)
          if (params[0] === 2) {
            callback(null, mockTicket);
          }
        }
      });

      const result = await getNextTicketForCounter(counterId);

      expect(result).toBeDefined();
      expect(result.id).toBe(200);
      expect(result.service_id).toBe(2);
    });

    it('should return null when no ticket found for selected service', async () => {
      const counterId = 6;
      const mockServices = [{ id: 1, service_time: 10 }];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT(*)')) {
          callback(null, { length: 1 });
        } else if (sql.includes('SELECT *')) {
          // No ticket found
          callback(null, null);
        }
      });

      const result = await getNextTicketForCounter(counterId);

      expect(result).toBeNull();
    });

    it('should reject if error occurs while counting tickets', async () => {
      const counterId = 7;
      const mockServices = [{ id: 1, service_time: 10 }];
      const countError = new Error('Count query failed');

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT(*)')) {
          callback(countError);
        }
      });

      await expect(getNextTicketForCounter(counterId)).rejects.toThrow('Count query failed');
    });

    it('should reject if error occurs while fetching ticket', async () => {
      const counterId = 8;
      const mockServices = [{ id: 1, service_time: 10 }];
      const fetchError = new Error('Fetch ticket failed');

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockServices);
      });

      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT(*)')) {
          callback(null, { length: 2 });
        } else if (sql.includes('SELECT *')) {
          callback(fetchError);
        }
      });

      await expect(getNextTicketForCounter(counterId)).rejects.toThrow('Fetch ticket failed');
    });
  });

});
