import { jest } from '@jest/globals';

// Mock del modulo db e della classe Service
const mockAll = jest.fn();
jest.unstable_mockModule('../../../db/db-connection.js', () => ({
  db: { all: mockAll }
}));

const mockServiceConstructor = jest.fn();
jest.unstable_mockModule('../../../models/ServiceDAO.js', () => ({
  Service: mockServiceConstructor
}));

// Import del repository DOPO aver fatto i mock
const { getServices } = await import('../../../repositories/serviceRepository.js');

describe('ServiceRepository Integration Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an array of Service instances when rows are returned', async () => {
    const fakeRows = [
      { id: 1, name: 'Service A' },
      { id: 2, name: 'Service B' }
    ];

    mockAll.mockImplementation((query, callback) => callback(null, fakeRows));
    mockServiceConstructor.mockImplementation(row => ({ ...row }));

    const result = await getServices();

    expect(mockAll).toHaveBeenCalledWith('SELECT * FROM services', expect.any(Function));
    expect(mockServiceConstructor).toHaveBeenCalledTimes(fakeRows.length);
    expect(result).toEqual(fakeRows);
  });

  it('should resolve undefined when rows are undefined', async () => {
    mockAll.mockImplementation((query, callback) => callback(null, undefined));

    const result = await getServices();

    expect(result).toBeUndefined();
    expect(mockAll).toHaveBeenCalledTimes(1);
  });

  it('should reject when db.all returns an error', async () => {
    const error = new Error('DB failure');
    mockAll.mockImplementation((query, callback) => callback(error, null));

    await expect(getServices()).rejects.toThrow('DB failure');
    expect(mockAll).toHaveBeenCalledTimes(1);
  });
});
