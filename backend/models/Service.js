'use strict';

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'e.g., "1 hour", "2 hours"',
      },
    },
    {
      tableName: 'services',
    }
  );

  Service.associate = (models) => {
    Service.hasMany(models.Booking, { foreignKey: 'serviceId', as: 'bookings' });
  };

  return Service;
};
