import { jest } from '@jest/globals';
const { getUserRole, getRoles } = await import('../../../repositories/userRepository.js');

describe('UserRepository', () => {
  describe('getUserRole', () => {
    it('should return "customer" for userId 1', () => {
      const result = getUserRole(1);
      expect(result).toBe('customer');
    });

    it('should return "officer" for userId 2', () => {
      const result = getUserRole(2);
      expect(result).toBe('officer');
    });

    it('should return "manager" for userId 3', () => {
      const result = getUserRole(3);
      expect(result).toBe('manager');
    });

    it('should return "admin" for userId 4', () => {
      const result = getUserRole(4);
      expect(result).toBe('admin');
    });

    it('should return "guest" for unknown userId', () => {
      const result = getUserRole(999);
      expect(result).toBe('guest');
    });

    it('should return "guest" for userId 0', () => {
      const result = getUserRole(0);
      expect(result).toBe('guest');
    });

    it('should return "guest" for negative userId', () => {
      const result = getUserRole(-1);
      expect(result).toBe('guest');
    });

    it('should return "guest" for null userId', () => {
      const result = getUserRole(null);
      expect(result).toBe('guest');
    });

    it('should return "guest" for undefined userId', () => {
      const result = getUserRole(undefined);
      expect(result).toBe('guest');
    });

    it('should return "guest" for string userId', () => {
      const result = getUserRole('invalid');
      expect(result).toBe('guest');
    });

    it('should handle all valid role IDs correctly', () => {
      const validRoles = [
        { id: 1, expectedRole: 'customer' },
        { id: 2, expectedRole: 'officer' },
        { id: 3, expectedRole: 'manager' },
        { id: 4, expectedRole: 'admin' }
      ];

      validRoles.forEach(({ id, expectedRole }) => {
        expect(getUserRole(id)).toBe(expectedRole);
      });
    });

    it('should be case-sensitive with returned roles', () => {
      const result = getUserRole(1);
      expect(result).toBe('customer');
      expect(result).not.toBe('Customer');
      expect(result).not.toBe('CUSTOMER');
    });
  });

  describe('getRoles', () => {
    it('should return an array of all roles', () => {
      const result = getRoles();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
    });

    it('should return roles in correct order', () => {
      const result = getRoles();
      expect(result[0]).toBe('customer');
      expect(result[1]).toBe('officer');
      expect(result[2]).toBe('manager');
      expect(result[3]).toBe('admin');
    });

    it('should return all expected roles', () => {
      const result = getRoles();
      expect(result).toContain('customer');
      expect(result).toContain('officer');
      expect(result).toContain('manager');
      expect(result).toContain('admin');
    });

    it('should not include "guest" role', () => {
      const result = getRoles();
      expect(result).not.toContain('guest');
    });

    it('should return a new array each time (not mutate original)', () => {
      const result1 = getRoles();
      const result2 = getRoles();
      
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different array instances
    });

    it('should return exactly 4 roles', () => {
      const result = getRoles();
      expect(result.length).toBe(4);
    });

    it('should not contain duplicate roles', () => {
      const result = getRoles();
      const uniqueRoles = [...new Set(result)];
      expect(result.length).toBe(uniqueRoles.length);
    });

    it('should return all roles as strings', () => {
      const result = getRoles();
      result.forEach(role => {
        expect(typeof role).toBe('string');
      });
    });

    it('should match roles returned by getUserRole', () => {
      const allRoles = getRoles();
      const roleFromGetUserRole1 = getUserRole(1);
      const roleFromGetUserRole2 = getUserRole(2);
      const roleFromGetUserRole3 = getUserRole(3);
      const roleFromGetUserRole4 = getUserRole(4);

      expect(allRoles).toContain(roleFromGetUserRole1);
      expect(allRoles).toContain(roleFromGetUserRole2);
      expect(allRoles).toContain(roleFromGetUserRole3);
      expect(allRoles).toContain(roleFromGetUserRole4);
    });
  });
});
