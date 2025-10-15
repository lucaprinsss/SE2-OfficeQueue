import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock del repository PRIMA di importare le routes
const mockGetServices = jest.fn();

jest.unstable_mockModule('../../../repositories/serviceRepository.js', () => ({
    getServices: mockGetServices
}));

// Importa routes DOPO i mock
const serviceRoutes = (await import('../../../routes/serviceRoutes.js')).default;

// Setup Express app per i test
const app = express();
app.use(express.json());
app.use('/api/services', serviceRoutes);

describe('Service Routes Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/services', () => {
        it('should return a list of services successfully and return 200', async () => {
            const mockServices = [
                { id: 1, name: 'Service 1' },
                { id: 2, name: 'Service 2' }
            ];
            mockGetServices.mockResolvedValue(mockServices);

            const response = await request(app)
                .get('/api/services')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual(mockServices);
            expect(mockGetServices).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array if no services found', async () => {
            mockGetServices.mockResolvedValue([]);
            const response = await request(app)
                .get('/api/services')
                .expect('Content-Type', /json/)
                .expect(200);
            expect(response.body).toEqual([]);
            expect(mockGetServices).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if repository throws an error', async () => {
            const dbError = new Error('Database connection failed');
            mockGetServices.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/api/services')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toEqual({
                error: 'Unable to fetch services',
                details: 'Database connection failed'
            });
            expect(mockGetServices).toHaveBeenCalledTimes(1);
        });


    });
});