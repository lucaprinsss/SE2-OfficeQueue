import { jest } from '@jest/globals';

// Database mock
const mockDb = {
  all: jest.fn()
};

// Module mocking for db-connection BEFORE importing the repository
jest.unstable_mockModule('../../../db/db-connection.js', () => ({
  db: mockDb
}));

// Module mocking for ServiceDAO BEFORE importing the repository
jest.unstable_mockModule('../../../models/ServiceDAO.js', () => ({
  Service: class Service {
    constructor(data) {
      if (data) {
        this.id = data.id;
        this.service_code = data.service_code;
        this.service_name = data.service_name;
        this.service_time = data.service_time;
      }
    }
  }
}));

// Import the repository after mocking dependencies
const { getServices } = await import('../../../repositories/serviceRepository.js');

describe('ServiceRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getServices', () => {
    it('should return all services from the database', async () => {
      const mockRows = [
        {
          id: 1,
          service_code: 'S1',
          service_name: 'Service One',
          service_time: 10
        },
        {
          id: 2,
          service_code: 'S2',
          service_name: 'Service Two',
          service_time: 15
        },
        {
          id: 3,
          service_code: 'S3',
          service_name: 'Service Three',
          service_time: 20
        }
      ];

      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, mockRows);
      });

      const result = await getServices();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM services',
        expect.any(Function)
      );
      expect(mockDb.all).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[0].service_code).toBe('S1');
      expect(result[0].service_name).toBe('Service One');
      expect(result[0].service_time).toBe(10);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should return an empty array when no services exist', async () => {
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, []);
      });

      const result = await getServices();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM services',
        expect.any(Function)
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return undefined when rows are undefined', async () => {
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, undefined);
      });

      const result = await getServices();

      expect(mockDb.all).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should reject with error if database query fails', async () => {
      const dbError = new Error('Database connection failed');

      mockDb.all.mockImplementation((sql, callback) => {
        callback(dbError);
      });

      await expect(getServices()).rejects.toThrow('Database connection failed');
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    it('should reject with error for SQL syntax errors', async () => {
      const sqlError = new Error('SQL syntax error');

      mockDb.all.mockImplementation((sql, callback) => {
        callback(sqlError);
      });

      await expect(getServices()).rejects.toThrow('SQL syntax error');
    });

    it('should handle single service correctly', async () => {
      const mockRow = [
        {
          id: 5,
          service_code: 'S5',
          service_name: 'Single Service',
          service_time: 25
        }
      ];

      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, mockRow);
      });

      const result = await getServices();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
      expect(result[0].service_name).toBe('Single Service');
    });

    it('should create Service instances for each row', async () => {
      const mockRows = [
        { id: 1, service_code: 'A1', service_name: 'Service A', service_time: 5 },
        { id: 2, service_code: 'B1', service_name: 'Service B', service_time: 10 }
      ];

      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, mockRows);
      });

      const result = await getServices();

      expect(result).toHaveLength(2);
      // Verify that each result has the properties from Service constructor
      result.forEach((service, index) => {
        expect(service.id).toBe(mockRows[index].id);
        expect(service.service_code).toBe(mockRows[index].service_code);
        expect(service.service_name).toBe(mockRows[index].service_name);
        expect(service.service_time).toBe(mockRows[index].service_time);
      });
    });

    it('should use correct SQL query', async () => {
      mockDb.all.mockImplementation((sql, callback) => {
        callback(null, []);
      });

      await getServices();

      const [sql] = mockDb.all.mock.calls[0];
      expect(sql).toBe('SELECT * FROM services');
    });
  });
});
