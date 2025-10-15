import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dei repository PRIMA di importare il controller
const mockGetUserRole = jest.fn();
const mockGetRoles = jest.fn();

jest.unstable_mockModule('../../../repositories/userRepository.js', () => ({
  getUserRole: mockGetUserRole,
  getRoles: mockGetRoles,
}));

// Import controller e router DOPO aver fatto il mock
const userRoutes = await import('../../../routes/userRoutes.js');

const app = express();
app.use(express.json());
app.use('/users', userRoutes.default);

describe('UserController Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('GET /users/roles should return all roles', async () => {
    const rolesList = ['customer', 'officer', 'manager', 'admin'];
    mockGetRoles.mockResolvedValue(rolesList);

    const response = await request(app).get('/users/roles');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(rolesList);
    expect(mockGetRoles).toHaveBeenCalledTimes(1);
  });

  it('GET /users/roles should return 500 if repository fails', async () => {
    mockGetRoles.mockRejectedValue(new Error('DB failure'));

    const response = await request(app).get('/users/roles');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Unable to fetch roles');
    expect(response.body).toHaveProperty('details', 'DB failure');
  });

});
