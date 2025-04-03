const express = require('express');
const router = express.Router();
const logger = require('../utils/logger.util');

// Test route to verify server is working
router.get('/test', (req, res) => {
    logger.info('Test route accessed');
    res.json({ message: 'Test route working!' });
});

module.exports = router; 