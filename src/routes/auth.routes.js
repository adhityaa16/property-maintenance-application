const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin, validatePasswordReset } = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.put('/reset-password/:token', validatePasswordReset, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/accept-invitation/:token', validateRegistration, AuthController.acceptInvitation);

module.exports = router;
