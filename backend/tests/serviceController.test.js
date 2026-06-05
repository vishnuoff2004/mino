const request = require('supertest');
const app = require('../server');
const { Service } = require('../models');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, email: 'admin@booking.com', role: 'admin' };
  next();
});

jest.mock('../middleware/roleMiddleware', () => () => (req, res, next) => next());

jest.mock('../models', () => {
  const mockService = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };

  return {
    Service: mockService,
    sequelize: {
      authenticate: jest.fn(),
    },
  };
});

describe('Service Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/services', () => {
    it('should retrieve paginated services', async () => {
      Service.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [
          {
            id: 1,
            name: 'Home Cleaning',
            description: 'Complete deep cleaning service',
            price: 49.99,
            duration: '2 hours',
          },
        ],
      });

      const res = await request(app).get('/api/services?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.services).toHaveLength(1);
      expect(res.body.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(Service.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
    });
  });

  describe('POST /api/services', () => {
    it('should create a service when validation passes', async () => {
      Service.create.mockResolvedValue({
        id: 1,
        name: 'Home Cleaning',
        description: 'Complete deep cleaning service',
        price: 49.99,
        duration: '2 hours',
      });

      const res = await request(app)
        .post('/api/services')
        .send({
          name: 'Home Cleaning',
          description: 'Complete deep cleaning service',
          price: 49.99,
          duration: '2 hours',
          ignoredField: 'not persisted',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('created successfully');
      expect(res.body.service.name).toBe('Home Cleaning');
      expect(Service.create).toHaveBeenCalledWith({
        name: 'Home Cleaning',
        description: 'Complete deep cleaning service',
        price: 49.99,
        duration: '2 hours',
      });
    });

    it('should return 400 when service data is invalid', async () => {
      const res = await request(app)
        .post('/api/services')
        .send({
          name: 'H',
          description: 'short',
          price: -10,
          duration: '',
        });

      expect(res.status).toBe(400);
      expect(Service.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update an existing service', async () => {
      const update = jest.fn();
      Service.findByPk.mockResolvedValue({
        id: 1,
        update,
      });

      const res = await request(app)
        .put('/api/services/1')
        .send({
          name: 'Premium Cleaning',
          description: 'Premium deep cleaning service',
          price: 89.99,
          duration: '3 hours',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated successfully');
      expect(Service.findByPk).toHaveBeenCalledWith('1');
      expect(update).toHaveBeenCalledWith({
        name: 'Premium Cleaning',
        description: 'Premium deep cleaning service',
        price: 89.99,
        duration: '3 hours',
      });
    });

    it('should return 404 when the service does not exist', async () => {
      Service.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/services/99')
        .send({
          name: 'Premium Cleaning',
          description: 'Premium deep cleaning service',
          price: 89.99,
          duration: '3 hours',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });
});
