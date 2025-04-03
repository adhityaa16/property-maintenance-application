'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await queryInterface.bulkInsert('Users', [{
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create sample owner
    await queryInterface.bulkInsert('Users', [{
      id: '00000000-0000-0000-0000-000000000002',
      email: 'owner@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'owner',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create sample property
    await queryInterface.bulkInsert('Properties', [{
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Sample Property',
      address: '123 Main St, City, State',
      type: 'apartment',
      status: 'vacant',
      ownerId: '00000000-0000-0000-0000-000000000002',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Properties', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 