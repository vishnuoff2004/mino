'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('booking_status', [
      { status: 'pending', createdAt: new Date(), updatedAt: new Date() },
      { status: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
      { status: 'completed', createdAt: new Date(), updatedAt: new Date() },
      { status: 'cancelled', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('booking_status', null, {});
  },
};
