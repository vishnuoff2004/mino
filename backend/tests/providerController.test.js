const request = require('supertest');
const app = require('../server');
const { Provider } = require('../models');

// Mock auth & role middlewares to bypass token validation during controller testing
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, email: 'admin@booking.com', role: 'admin' };
  next();
});

jest.mock('../middleware/roleMiddleware', () => (role) => (req, res, next) => {
  next();
});

jest.mock('../models', () => {
  const mockProvider = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };
  return {
    Provider: mockProvider,
    sequelize: {
      authenticate: jest.fn(),
    },
  };
});

describe('Provider Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/providers', () => {
    it('should retrieve a paginated list of providers', async () => {
      Provider.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [
          {
            id: 1,
            name: 'Jane Cleaning',
            skill_type: 'Home Cleaning',
            phoneno: '555-0105',
            availabilitystatus: 'available',
          },
        ],
      });

      const res = await request(app).get('/api/providers?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.providers).toHaveLength(1);
      expect(res.body.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(Provider.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/providers', () => {
    it('should create a new provider when Joi validation passes', async () => {
      Provider.create.mockResolvedValue({
        id: 1,
        name: 'Jane Cleaning',
        skill_type: 'Home Cleaning',
        phoneno: '555-0105',
        availabilitystatus: 'available',
      });

      const res = await request(app)
        .post('/api/providers')
        .send({
          name: 'Jane Cleaning',
          skill_type: 'Home Cleaning',
          phoneno: '555-0105',
          availabilitystatus: 'available',
          // Should tolerate extra fields (allowUnknown: true)
          id: 999,
          createdAt: '2026-05-30',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('created successfully');
      expect(res.body.provider.name).toBe('Jane Cleaning');
      expect(Provider.create).toHaveBeenCalledWith({
        name: 'Jane Cleaning',
        skill_type: 'Home Cleaning',
        phoneno: '555-0105',
        availabilitystatus: 'available',
      });
    });

    it('should fail with 400 Bad Request if fields are invalid or missing', async () => {
      const res = await request(app)
        .post('/api/providers')
        .send({
          name: 'J', // too short
          skill_type: 'Home Cleaning',
          phoneno: '123', // too short
          availabilitystatus: 'invalid-status',
        });

      expect(res.status).toBe(400);
      expect(Provider.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/providers/:id', () => {
    it('should update an existing provider successfully', async () => {
      const mockUpdate = jest.fn();
      Provider.findByPk.mockResolvedValue({
        id: 1,
        name: 'Jane Cleaning',
        skill_type: 'Home Cleaning',
        phoneno: '555-0105',
        availabilitystatus: 'available',
        update: mockUpdate,
      });

      const res = await request(app)
        .put('/api/providers/1')
        .send({
          name: 'Jane Clean',
          skill_type: 'Home Cleaning',
          phoneno: '555-0105',
          availabilitystatus: 'not_available',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated successfully');
      expect(Provider.findByPk).toHaveBeenCalledWith('1');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Jane Clean',
        skill_type: 'Home Cleaning',
        phoneno: '555-0105',
        availabilitystatus: 'not_available',
      });
    });

    it('should return 404 if provider to update does not exist', async () => {
      Provider.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/providers/99')
        .send({
          name: 'Jane Clean',
          skill_type: 'Home Cleaning',
          phoneno: '555-0105',
          availabilitystatus: 'available',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });
});
