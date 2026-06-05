const request = require('supertest');
const app = require('../server');
const { User } = require('../models');

jest.mock('../models', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  return {
    User: mockUser,
    sequelize: {
      authenticate: jest.fn(),
    },
  };
});

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      });
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
      expect(User.create).toHaveBeenCalled();
    });

    it('should return 400 if validation fails (e.g. invalid email)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('valid email');
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return 409 if email is already registered', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'john@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already registered');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockCompare = jest.fn().mockResolvedValue(true);
      User.findOne.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        comparePassword: mockCompare,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('successful');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('john@example.com');
      expect(mockCompare).toHaveBeenCalledWith('password123');
    });

    it('should return 401 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should return 401 if password does not match', async () => {
      const mockCompare = jest.fn().mockResolvedValue(false);
      User.findOne.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        comparePassword: mockCompare,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });
});
