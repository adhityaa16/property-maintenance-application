const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { AppError } = require('./error-handler.util');

// Generate a random token
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate a UUID
const generateUUID = () => {
    return uuidv4();
};

// Format date to ISO string
const formatDate = (date) => {
    return new Date(date).toISOString();
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number format
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};

// Validate password strength
const validatePassword = (password) => {
    if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
    }
    if (!/[A-Z]/.test(password)) {
        throw new AppError('Password must contain at least one uppercase letter', 400);
    }
    if (!/[a-z]/.test(password)) {
        throw new AppError('Password must contain at least one lowercase letter', 400);
    }
    if (!/[0-9]/.test(password)) {
        throw new AppError('Password must contain at least one number', 400);
    }
    if (!/[!@#$%^&*]/.test(password)) {
        throw new AppError('Password must contain at least one special character (!@#$%^&*)', 400);
    }
    return true;
};

// Calculate pagination
const calculatePagination = (page, limit) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};

// Format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sanitize input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .trim();
};

// Generate random string
const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Check if date is in the past
const isDateInPast = (date) => {
    return new Date(date) < new Date();
};

// Check if date is in the future
const isDateInFuture = (date) => {
    return new Date(date) > new Date();
};

// Calculate days between dates
const calculateDaysBetween = (date1, date2) => {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = {
    generateToken,
    generateUUID,
    formatDate,
    formatCurrency,
    isValidEmail,
    isValidPhoneNumber,
    validatePassword,
    calculatePagination,
    formatFileSize,
    sanitizeInput,
    generateRandomString,
    isDateInPast,
    isDateInFuture,
    calculateDaysBetween
};
