import { jest } from '@jest/globals';

// Mock del modulo db e della classe Ticket
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockAll = jest.fn();

jest.unstable_mockModule('../../../db/db-connection.js', () => ({
  db: { run: mockRun, get: mockGet, all: mockAll }
}));

const mockTicketConstructor = jest.fn();
jest.unstable_mockModule('../../../models/TicketDAO.js', () => ({
  Ticket: mockTicketConstructor
}));

// Import del repository DOPO i mock
const {
  createTicket,
  getTicketById,
  getQueueLength,
  getNextTicketForCounter,
  serveTicket
} = await import('../../../repositories/ticketRepository.js');

describe('TicketRepository Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should resolve with the last inserted ID on success', async () => {
      mockRun.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 10 }, null);
      });

      const result = await createTicket(1);
      expect(result).toBe(10);
      expect(mockRun).toHaveBeenCalledWith(
        'INSERT INTO tickets (service_id) VALUES (?)',
        [1],
        expect.any(Function)
      );
    });

    it('should reject if db.run fails', async () => {
      const dbError = new Error('DB insert error');
      mockRun.mockImplementation((query, params, callback) => callback(dbError));

      await expect(createTicket(1)).rejects.toThrow('DB insert error');
    });
  });

  describe('getTicketById', () => {
    it('should resolve null if ticketId is not provided', async () => {
      const result = await getTicketById(undefined);
      expect(result).toBeNull();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should resolve null if no row is found', async () => {
      mockGet.mockImplementation((query, params, callback) => callback(null, null));
      const result = await getTicketById(5);
      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should resolve a Ticket instance when row is found', async () => {
      const fakeRow = { id: 1, service_id: 2 };
      mockGet.mockImplementation((query, params, callback) => callback(null, fakeRow));
      mockTicketConstructor.mockImplementation(row => ({ ...row }));

      const result = await getTicketById(1);
      expect(result).toEqual(fakeRow);
      expect(mockTicketConstructor).toHaveBeenCalledWith(fakeRow);
    });

    it('should reject if db.get returns error', async () => {
      const dbError = new Error('DB read error');
      mockGet.mockImplementation((query, params, callback) => callback(dbError));
      await expect(getTicketById(1)).rejects.toThrow('DB read error');
    });
  });

  describe('getQueueLength', () => {
    it('should resolve with queue length if query succeeds', async () => {
      mockGet.mockImplementation((query, params, callback) => callback(null, { length: 5 }));
      const result = await getQueueLength(1);
      expect(result).toBe(5);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should reject if db.get fails', async () => {
      const dbError = new Error('DB failure');
      mockGet.mockImplementation((query, params, callback) => callback(dbError));
      await expect(getQueueLength(1)).rejects.toThrow('DB failure');
    });
  });

  describe('serveTicket', () => {
    it('should resolve true if one row was updated', async () => {
      mockRun.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const result = await serveTicket(10, 2);
      expect(result).toBe(true);
      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    it('should resolve false if no rows were updated', async () => {
      mockRun.mockImplementation((query, params, callback) => {
        callback.call({ changes: 0 }, null);
      });

      const result = await serveTicket(10, 2);
      expect(result).toBe(false);
    });

    it('should reject if db.run fails', async () => {
      const dbError = new Error('DB update error');
      mockRun.mockImplementation((query, params, callback) => callback(dbError));
      await expect(serveTicket(10, 2)).rejects.toThrow('DB update error');
    });
  });

  describe('getNextTicketForCounter', () => {
    it('should resolve null if no manageable services', async () => {
      mockAll.mockImplementation((query, params, callback) => callback(null, []));
      const result = await getNextTicketForCounter(1);
      expect(result).toBeNull();
      expect(mockAll).toHaveBeenCalledTimes(1);
    });

    it('should reject if db.all fails when loading services', async () => {
      const dbError = new Error('DB services error');
      mockAll.mockImplementation((query, params, callback) => callback(dbError));
      await expect(getNextTicketForCounter(1)).rejects.toThrow('DB services error');
    });

    it('should resolve a Ticket when a waiting ticket is found', async () => {
      mockAll.mockImplementationOnce((query, params, callback) => callback(null, [
        { id: 1, service_time: 10 },
        { id: 2, service_time: 20 }
      ]));

      mockGet
        .mockImplementationOnce((query, params, callback) => callback(null, { length: 3 }))
        .mockImplementationOnce((query, params, callback) => callback(null, { length: 1 }));

      const fakeTicket = { id: 99, service_id: 1, status: 'waiting' };
      mockGet.mockImplementationOnce((query, params, callback) => callback(null, fakeTicket));

      mockTicketConstructor.mockImplementation(row => ({ ...row }));

      const result = await getNextTicketForCounter(5);

      expect(result).toEqual(fakeTicket);
      expect(mockTicketConstructor).toHaveBeenCalledWith(fakeTicket);
      expect(mockAll).toHaveBeenCalledTimes(1);
    });

    it('should resolve null if no waiting ticket found', async () => {
      mockAll.mockImplementationOnce((query, params, callback) => callback(null, [
        { id: 1, service_time: 10 }
      ]));
      mockGet.mockImplementationOnce((query, params, callback) => callback(null, { length: 0 }));
      const result = await getNextTicketForCounter(1);
      expect(result).toBeNull();
    });
  });

});
