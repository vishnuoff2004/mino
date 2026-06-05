const { Booking, Service, Provider, BookingStatus, User } = require('../models');
const { bookingSchema, updateBookingStatusSchema } = require('../validators/validators');

const bookingIncludes = [
  { model: Service, as: 'service', attributes: ['id', 'name', 'price', 'duration'] },
  {
    model: Provider,
    as: 'provider',
    attributes: ['id', 'name', 'skill_type', 'phoneno', 'availabilitystatus'],
  },
  { model: BookingStatus, as: 'bookingStatus', attributes: ['id', 'status'] },
  { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
];

exports.createBooking = async (req, res, next) => {
  try {
    const { error } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { serviceId, providerId, address, bookingDate } = req.body;

    // Validate provider availability
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }
    if (provider.availabilitystatus !== 'available') {
      return res.status(400).json({ message: 'This provider is currently not available.' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      serviceId,
      providerId,
      bookingStatusId: 1, // pending
      address,
      bookingDate,
    });

    const fullBooking = await Booking.findByPk(booking.id, { include: bookingIncludes });

    res.status(201).json({ message: 'Booking created successfully.', booking: fullBooking });
  } catch (error) {
    next(error);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Booking.findAndCountAll({
      where: { userId: req.user.id },
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

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: bookingIncludes,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

exports.getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalBookings = await Booking.count({ where: { userId } });

    const pendingStatus = await BookingStatus.findOne({ where: { status: 'pending' } });
    const confirmedStatus = await BookingStatus.findOne({ where: { status: 'confirmed' } });
    const completedStatus = await BookingStatus.findOne({ where: { status: 'completed' } });
    const cancelledStatus = await BookingStatus.findOne({ where: { status: 'cancelled' } });

    const upcomingBookings = await Booking.count({
      where: {
        userId,
        bookingStatusId: [pendingStatus?.id, confirmedStatus?.id].filter(Boolean),
      },
    });

    const completedBookings = await Booking.count({
      where: { userId, bookingStatusId: completedStatus?.id },
    });

    const cancelledBookings = await Booking.count({
      where: { userId, bookingStatusId: cancelledStatus?.id },
    });

    res.json({
      stats: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
