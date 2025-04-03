require('dotenv').config({ path: '.env.test' });
const { sequelize } = require('../src/config/database.config');

beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    // Sync database
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    // Close database connection
    await sequelize.close();
});

afterEach(async () => {
    // Clear all tables after each test
    const tables = Object.keys(sequelize.models);
    for (const table of tables) {
        await sequelize.models[table].destroy({ truncate: true, cascade: true });
    }
}); 