const { Booking, Service, Provider, BookingStatus, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { updateBookingStatusSchema } = require('../validators/validators');

const bookingIncludes = [
  { model: Service, as: 'service', attributes: ['id', 'name', 'price', 'duration'] },
  {
    model: Provider,
    as: 'provider',
    attributes: ['id', 'name', 'skill_type', 'phoneno'],
  },
  { model: BookingStatus, as: 'bookingStatus', attributes: ['id', 'status'] },
  { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
];

exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.count();
    const totalProviders = await Provider.count();
    const availableProviders = await Provider.count({
      where: { availabilitystatus: 'available' },
    });

    // Revenue from completed bookings
    const completedStatus = await BookingStatus.findOne({ where: { status: 'completed' } });
    const revenueResult = await Booking.findAll({
      where: { bookingStatusId: completedStatus?.id },
      include: [{ model: Service, as: 'service', attributes: ['price'] }],
      attributes: [],
    });

    const revenue = revenueResult.reduce((acc, b) => acc + parseFloat(b.service?.price || 0), 0);

    const bookingsByStatus = await Booking.findAll({
      include: [{ model: BookingStatus, as: 'bookingStatus', attributes: ['status'] }],
      attributes: ['bookingStatusId', [fn('COUNT', col('Booking.id')), 'count']],
      group: ['bookingStatusId', 'bookingStatus.id', 'bookingStatus.status'],
      raw: false,
    });

    res.json({
      stats: {
        totalBookings,
        totalProviders,
        availableProviders,
        revenue: revenue.toFixed(2),
        bookingsByStatus: bookingsByStatus.map((b) => ({
          status: b.bookingStatus?.status,
          count: b.dataValues.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      const statusRecord = await BookingStatus.findOne({ where: { status } });
      if (statusRecord) where.bookingStatusId = statusRecord.id;
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: bookingIncludes,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      bookings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { error } = updateBookingStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await booking.update({ bookingStatusId: req.body.bookingStatusId });
    const updatedBooking = await Booking.findByPk(booking.id, { include: bookingIncludes });

    res.json({ message: 'Booking status updated.', booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
