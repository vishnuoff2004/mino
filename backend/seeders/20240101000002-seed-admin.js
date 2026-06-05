'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@booking.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Seed sample services
    await queryInterface.bulkInsert('services', [
      {
        name: 'Home Cleaning',
        description: 'Professional home cleaning service for all types of homes. We ensure spotless results.',
        price: 49.99,
        duration: '2 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Plumbing',
        description: 'Expert plumbing services including pipe repair, installation, and leak fixing.',
        price: 79.99,
        duration: '1.5 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Electrical Repair',
        description: 'Licensed electricians for wiring, installation, and electrical repairs.',
        price: 99.99,
        duration: '2 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'AC Service',
        description: 'Air conditioning maintenance, repair, and installation services.',
        price: 59.99,
        duration: '1 hour',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pest Control',
        description: 'Safe and effective pest control services for homes and offices.',
        price: 89.99,
        duration: '3 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Painting',
        description: 'Interior and exterior painting services with premium quality paints.',
        price: 149.99,
        duration: '4 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Seed sample providers
    await queryInterface.bulkInsert('service_providers', [
      {
        name: 'John Smith',
        skill_type: 'Home Cleaning',
        phoneno: '555-0101',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Maria Garcia',
        skill_type: 'Home Cleaning',
        phoneno: '555-0102',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bob Johnson',
        skill_type: 'Plumbing',
        phoneno: '555-0103',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Alice Williams',
        skill_type: 'Electrical Repair',
        phoneno: '555-0104',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'David Brown',
        skill_type: 'AC Service',
        phoneno: '555-0105',
        availabilitystatus: 'not_available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sarah Davis',
        skill_type: 'Pest Control',
        phoneno: '555-0106',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mike Wilson',
        skill_type: 'Painting',
        phoneno: '555-0107',
        availabilitystatus: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { role: 'admin' }, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('service_providers', null, {});
  },
};
