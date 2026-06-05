'use strict';

module.exports = (sequelize, DataTypes) => {
  const Provider = sequelize.define(
    'Provider',
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
      skill_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneno: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      availabilitystatus: {
        type: DataTypes.ENUM('available', 'not_available'),
        defaultValue: 'available',
      },
    },
    {
      tableName: 'service_providers',
    }
  );

  Provider.associate = (models) => {
    Provider.hasMany(models.Booking, { foreignKey: 'providerId', as: 'bookings' });
  };

  return Provider;
};
