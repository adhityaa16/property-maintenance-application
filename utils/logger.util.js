const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write all logs error (and above) to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        })
    ]
});

// Create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger; 