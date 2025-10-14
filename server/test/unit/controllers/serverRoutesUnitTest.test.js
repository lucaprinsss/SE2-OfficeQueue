import { describe, jest } from '@jest/globals';

// Mock del repository PRIMA di importare il controller
const mockGetServices = jest.fn();

jest.unstable_mockModule('../../../repositories/serviceRepository.js', () => ({
    getServices: mockGetServices,
}));

// Importa il controller DOPO aver mockato il repository
const { getServices } = await import('../../../controllers/serviceController.js');

describe('ServiceController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getServices', () => {
        it('should return services successfully', async () => {
            const mockService = { id: 1, name: 'Service 1' };
            const req = { params: { id: '1' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            mockGetServices.mockReturnValue(mockService);

            await getServices(req, res);

            expect(mockGetServices).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockService);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return empty array if no services available', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            mockGetServices.mockReturnValue([]);

            await getServices(req, res);

            expect(mockGetServices).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should return 500 if repository throws an error', async () => {
            const dbError = new Error('Database error');
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            mockGetServices.mockRejectedValue(dbError);

            await getServices(req, res);

            expect(mockGetServices).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unable to fetch services',
                details: 'Database error'
            });
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});