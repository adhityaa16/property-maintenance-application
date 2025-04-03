const logger = require('../utils/logger.util');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info({
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent')
    }, 'Incoming request');

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        }, 'Outgoing response');
    });

    next();
};

module.exports = requestLogger; 