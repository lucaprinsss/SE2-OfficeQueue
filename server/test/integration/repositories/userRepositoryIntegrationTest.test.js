/*  */import { getUserRole, getRoles } from '../../../repositories/userRepository.js';

describe('UserRepository Integration Tests', () => {

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

    it('should return "guest" for any unknown userId', () => {
      const result = getUserRole(999);
      expect(result).toBe('guest');
    });
  });

  describe('getRoles', () => {
    it('should return an array of all roles', () => {
      const roles = getRoles();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles).toEqual(['customer', 'officer', 'manager', 'admin']);
    });

    it('should contain "manager" and "admin"', () => {
      const roles = getRoles();
      expect(roles).toContain('manager');
      expect(roles).toContain('admin');
    });
  });

});
