import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock del repository PRIMA di importare le routes
const mockGetUserRole = jest.fn();
const mockGetRoles = jest.fn();

jest.unstable_mockModule('../../repositories/userRepository.js', () => ({
    getUserRole: mockGetUserRole,
    getRoles: mockGetRoles
}));

// Importa routes DOPO i mock
const userRoutes = (await import('../../routes/userRoutes.js')).default;

// Setup Express app per i test
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/users/roles', () => {
        it('should return all roles successfully and return 200', async () => {
            const mockRoles = ['role1', 'role2', 'role3'];
            mockGetRoles.mockResolvedValue(mockRoles);

            const response = await request(app)
                .get('/api/users/roles')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual(mockRoles);
            expect(mockGetRoles).toHaveBeenCalledTimes(1);
        });

        it('should return empty array if no roles found', async () => {
            mockGetRoles.mockResolvedValue([]);
            const response = await request(app)
                .get('/api/users/roles')
                .expect('Content-Type', /json/)
                .expect(200);   
            expect(response.body).toEqual([]);
            expect(mockGetRoles).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if repository throws an error', async () => {
            const dbError = new Error('Database connection failed');
            mockGetRoles.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/api/users/roles')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('error', 'Unable to fetch roles');
            expect(response.body).toHaveProperty('details', 'Database connection failed');
            expect(mockGetRoles).toHaveBeenCalledTimes(1);
        });
    });

    
});
