'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_providers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      skill_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneno: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      availabilitystatus: {
        type: Sequelize.ENUM('available', 'not_available'),
        defaultValue: 'available',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_providers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_service_providers_availabilitystatus";');
  },
};
