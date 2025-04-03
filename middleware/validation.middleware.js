const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

const validateRegistration = (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password || !firstName || !lastName) {
            throw new AppError('All fields are required', 400);
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new AppError('Invalid email format', 400);
        }

        if (password.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400);
        }

        if (role && !['owner', 'tenant', 'service_provider'].includes(role)) {
            throw new AppError('Invalid role', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validateLogin = (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new AppError('Invalid email format', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validatePasswordReset = (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            throw new AppError('Password is required', 400);
        }

        if (password.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validateProperty = (req, res, next) => {
    try {
        const {
            name,
            address,
            city,
            state,
            zipCode,
            type,
            rentAmount,
            dueDate
        } = req.body;

        // Check required fields
        if (!name || !address || !city || !state || !zipCode || !type || !rentAmount || !dueDate) {
            throw new AppError('All required fields must be provided', 400);
        }

        // Validate property type
        if (!['apartment', 'house', 'condo', 'commercial'].includes(type)) {
            throw new AppError('Invalid property type', 400);
        }

        // Validate rent amount
        if (isNaN(rentAmount) || rentAmount <= 0) {
            throw new AppError('Rent amount must be a positive number', 400);
        }

        // Validate due date (day of month)
        if (!Number.isInteger(dueDate) || dueDate < 1 || dueDate > 31) {
            throw new AppError('Due date must be a day of the month (1-31)', 400);
        }

        // Validate zip code format
        if (!zipCode.match(/^\d{5}(-\d{4})?$/)) {
            throw new AppError('Invalid zip code format', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validateMaintenanceRequest = (req, res, next) => {
    try {
        const {
            propertyId,
            category,
            title,
            description,
            priority
        } = req.body;

        // Check required fields
        if (!propertyId || !category || !title || !description) {
            throw new AppError('All required fields must be provided', 400);
        }

        // Validate category
        const validCategories = [
            'plumbing',
            'electrical',
            'hvac',
            'appliance',
            'structural',
            'pest_control',
            'other'
        ];
        if (!validCategories.includes(category)) {
            throw new AppError('Invalid maintenance category', 400);
        }

        // Validate priority
        if (priority && !['low', 'medium', 'high', 'emergency'].includes(priority)) {
            throw new AppError('Invalid priority level', 400);
        }

        // Validate title length
        if (title.length < 5 || title.length > 100) {
            throw new AppError('Title must be between 5 and 100 characters', 400);
        }

        // Validate description length
        if (description.length < 20 || description.length > 1000) {
            throw new AppError('Description must be between 20 and 1000 characters', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validatePayment = (req, res, next) => {
    try {
        const {
            property_id,
            amount,
            payment_type,
            payment_method
        } = req.body;

        // Check required fields
        if (!property_id || !amount || !payment_type || !payment_method) {
            throw new AppError('All required fields must be provided', 400);
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            throw new AppError('Amount must be a positive number', 400);
        }

        // Validate payment type
        if (!['rent', 'deposit', 'late_fee'].includes(payment_type)) {
            throw new AppError('Invalid payment type', 400);
        }

        // Validate payment method
        if (!['credit_card', 'debit_card', 'bank_transfer', 'cash'].includes(payment_method)) {
            throw new AppError('Invalid payment method', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateRegistration,
    validateLogin,
    validatePasswordReset,
    validateProperty,
    validateMaintenanceRequest,
    validatePayment
};
