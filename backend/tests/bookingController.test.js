const request = require('supertest');
const app = require('../server');
const { Booking, Service, Provider, BookingStatus } = require('../models');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 7, email: 'user@example.com', role: 'user' };
  next();
});

jest.mock('../middleware/roleMiddleware', () => () => (req, res, next) => next());

jest.mock('../models', () => {
  const mockBooking = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };
  const mockService = {
    findByPk: jest.fn(),
  };
  const mockProvider = {
    findByPk: jest.fn(),
  };
  const mockBookingStatus = {
    findOne: jest.fn(),
  };

  return {
    Booking: mockBooking,
    Service: mockService,
    Provider: mockProvider,
    BookingStatus: mockBookingStatus,
    User: {},
    sequelize: {
      authenticate: jest.fn(),
    },
  };
});

describe('Booking Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking for an available provider and valid service', async () => {
      Provider.findByPk.mockResolvedValue({ id: 2, availabilitystatus: 'available' });
      Service.findByPk.mockResolvedValue({ id: 3, name: 'Home Cleaning' });
      Booking.create.mockResolvedValue({ id: 10 });
      Booking.findByPk.mockResolvedValue({
        id: 10,
        userId: 7,
        serviceId: 3,
        providerId: 2,
        address: '123 Main Street',
        bookingDate: '2026-06-01',
      });

      const res = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: 3,
          providerId: 2,
          address: '123 Main Street',
          bookingDate: '2026-06-01',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('created successfully');
      expect(Booking.create).toHaveBeenCalledWith({
        userId: 7,
        serviceId: 3,
        providerId: 2,
        bookingStatusId: 1,
        address: '123 Main Street',
        bookingDate: '2026-06-01',
      });
      expect(Booking.findByPk).toHaveBeenCalledWith(10, expect.any(Object));
    });

    it('should return 400 when the provider is not available', async () => {
      Provider.findByPk.mockResolvedValue({ id: 2, availabilitystatus: 'not_available' });

      const res = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: 3,
          providerId: 2,
          address: '123 Main Street',
          bookingDate: '2026-06-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not available');
      expect(Service.findByPk).not.toHaveBeenCalled();
      expect(Booking.create).not.toHaveBeenCalled();
    });

    it('should return 404 when the service does not exist', async () => {
      Provider.findByPk.mockResolvedValue({ id: 2, availabilitystatus: 'available' });
      Service.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/bookings')
        .send({
          serviceId: 99,
          providerId: 2,
          address: '123 Main Street',
          bookingDate: '2026-06-01',
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Service not found');
      expect(Booking.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/bookings/my', () => {
    it('should return bookings for the authenticated user with pagination', async () => {
      Booking.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 10, userId: 7 }],
      });

      const res = await request(app).get('/api/bookings/my?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.bookings).toEqual([{ id: 10, userId: 7 }]);
      expect(res.body.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      });
      expect(Booking.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 7 },
          limit: 5,
          offset: 0,
        })
      );
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('should return user dashboard booking stats', async () => {
      Booking.count
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(1);
      BookingStatus.findOne
        .mockResolvedValueOnce({ id: 1, status: 'pending' })
        .mockResolvedValueOnce({ id: 2, status: 'confirmed' })
        .mockResolvedValueOnce({ id: 3, status: 'completed' })
        .mockResolvedValueOnce({ id: 4, status: 'cancelled' });

      const res = await request(app).get('/api/bookings/stats');

      expect(res.status).toBe(200);
      expect(res.body.stats).toEqual({
        totalBookings: 8,
        upcomingBookings: 3,
        completedBookings: 4,
        cancelledBookings: 1,
      });
      expect(Booking.count).toHaveBeenCalledTimes(4);
    });
  });
});
