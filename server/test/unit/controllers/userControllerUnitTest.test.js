import { jest } from '@jest/globals';

// Mock del repository PRIMA di importare il controller
const mockGetUserRole = jest.fn();
const mockGetRoles = jest.fn();

jest.unstable_mockModule('../../../repositories/userRepository.js', () => ({
  getUserRole: mockGetUserRole,
  getRoles: mockGetRoles
}));

// Importa il controller DOPO aver mockato il repository
const { getUserRole, getRoles } = await import('../../../controllers/userController.js');

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return user role successfully', async () => {
      const mockRole = { role: 'officer' };
      const req = { params: { userId: '2' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetUserRole.mockReturnValue(mockRole);

      await getUserRole(req, res);

      expect(mockGetUserRole).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({ userId: 2, role: 'officer' });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      const req = { params: { userId: '999' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetUserRole.mockReturnValue(null);

      await getUserRole(req, res);

      expect(mockGetUserRole).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 if repository throws an error', async () => {
      const dbError = new Error('Database error');
      const req = { params: { userId: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetUserRole.mockImplementation(() => {
        throw dbError;
      });

      await getUserRole(req, res);

      expect(mockGetUserRole).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unable to fetch user role',
        details: 'Database error'
      });
    });

    it('should handle different userId values', async () => {
      const mockRole = { role: 'admin' };
      const req = { params: { userId: '4' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetUserRole.mockReturnValue(mockRole);

      await getUserRole(req, res);

      expect(mockGetUserRole).toHaveBeenCalledWith(4);
      expect(res.json).toHaveBeenCalledWith({ userId: 4, role: 'admin' });
    });

    it('should convert string userId to number', async () => {
      const mockRole = { role: 'customer' };
      const req = { params: { userId: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetUserRole.mockReturnValue(mockRole);

      await getUserRole(req, res);

      expect(mockGetUserRole).toHaveBeenCalledWith(1);
      expect(typeof mockGetUserRole.mock.calls[0][0]).toBe('number');
    });
  });

  describe('getRoles', () => {
    it('should return all roles successfully', async () => {
      const mockRoles = ['customer', 'officer', 'manager', 'admin'];
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetRoles.mockReturnValue(mockRoles);

      await getRoles(req, res);

      expect(mockGetRoles).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockRoles);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return empty array if no roles available', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetRoles.mockReturnValue([]);

      await getRoles(req, res);

      expect(mockGetRoles).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if repository throws an error', async () => {
      const dbError = new Error('Database connection failed');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      mockGetRoles.mockImplementation(() => {
        throw dbError;
      });

      await getRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unable to fetch roles',
        details: 'Database connection failed'
      });
    });
  });
});
