const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError } = require('../utils/error-handler.util');
const { sendEmail } = require('../config/email.config');
const User = require('../models/user.model');
const Invitation = require('../models/invitation.model');
const logger = require('../utils/logger.util');

class AuthService {
    static async register(userData) {
        try {
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('Email already registered', 400);
            }

            const user = await User.create(userData);
            await this.sendVerificationEmail(user);

            return user;
        } catch (error) {
            logger.error('Registration error:', error);
            throw error;
        }
    }

    static async login(email, password) {
        try {
            const user = await User.findByEmail(email);
            if (!user || !(await user.comparePassword(password))) {
                throw new AppError('Invalid email or password', 401);
            }

            if (!user.isEmailVerified) {
                throw new AppError('Please verify your email first', 401);
            }

            if (!user.isActive) {
                throw new AppError('Account is deactivated', 401);
            }

            user.lastLogin = new Date();
            await user.save();

            return this.generateToken(user);
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    static async verifyEmail(token) {
        try {
            const user = await User.findOne({
                where: {
                    emailVerificationToken: token,
                    emailVerificationExpires: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!user) {
                throw new AppError('Invalid or expired verification token', 400);
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            await user.save();

            return user;
        } catch (error) {
            logger.error('Email verification error:', error);
            throw error;
        }
    }

    static async forgotPassword(email) {
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
            await user.save();

            await this.sendPasswordResetEmail(user, token);
            return true;
        } catch (error) {
            logger.error('Forgot password error:', error);
            throw error;
        }
    }

    static async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!user) {
                throw new AppError('Invalid or expired reset token', 400);
            }

            user.password = newPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            return user;
        } catch (error) {
            logger.error('Reset password error:', error);
            throw error;
        }
    }

    static async acceptInvitation(token, userData) {
        try {
            const invitation = await Invitation.findByToken(token);
            if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
                throw new AppError('Invalid or expired invitation', 400);
            }

            const existingUser = await User.findByEmail(invitation.email);
            if (existingUser) {
                throw new AppError('Email already registered', 400);
            }

            const user = await User.create({
                ...userData,
                email: invitation.email,
                role: 'tenant'
            });

            invitation.status = 'accepted';
            invitation.acceptedAt = new Date();
            await invitation.save();

            return user;
        } catch (error) {
            logger.error('Invitation acceptance error:', error);
            throw error;
        }
    }

    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static async sendVerificationEmail(user) {
        const token = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = token;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours
        await user.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await sendEmail({
            email: user.email,
            subject: 'Verify your email',
            html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
        });
    }

    static async sendPasswordResetEmail(user, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            email: user.email,
            subject: 'Reset your password',
            html: `Please click <a href="${resetUrl}">here</a> to reset your password.`
        });
    }
}

module.exports = AuthService; 