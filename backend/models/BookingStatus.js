'use strict';

module.exports = (sequelize, DataTypes) => {
  const BookingStatus = sequelize.define(
    'BookingStatus',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'booking_status',
    }
  );

  BookingStatus.associate = (models) => {
    BookingStatus.hasMany(models.Booking, {
      foreignKey: 'bookingStatusId',
      as: 'bookings',
    });
  };

  return BookingStatus;
};
