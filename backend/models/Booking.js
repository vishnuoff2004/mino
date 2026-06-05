'use strict';

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'services', key: 'id' },
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'service_providers', key: 'id' },
      },
      bookingStatusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: { model: 'booking_status', key: 'id' },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      bookingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: 'bookings',
    }
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Booking.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
    Booking.belongsTo(models.Provider, { foreignKey: 'providerId', as: 'provider' });
    Booking.belongsTo(models.BookingStatus, {
      foreignKey: 'bookingStatusId',
      as: 'bookingStatus',
    });
  };

  return Booking;
};
