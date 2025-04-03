const AuthService = require('../services/auth.service');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class AuthController {
    static async register(req, res, next) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Registration successful. Please check your email to verify your account.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const token = await AuthService.login(email, password);
            res.status(200).json({
                status: 'success',
                data: { token }
            });
        } catch (error) {
            next(error);
        }
    }

    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;
            const user = await AuthService.verifyEmail(token);
            res.status(200).json({
                status: 'success',
                message: 'Email verified successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await AuthService.forgotPassword(email);
            res.status(200).json({
                status: 'success',
                message: 'Password reset instructions sent to your email'
            });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;
            const user = await AuthService.resetPassword(token, password);
            res.status(200).json({
                status: 'success',
                message: 'Password reset successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async acceptInvitation(req, res, next) {
        try {
            const { token } = req.params;
            const user = await AuthService.acceptInvitation(token, req.body);
            res.status(201).json({
                status: 'success',
                message: 'Invitation accepted successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
