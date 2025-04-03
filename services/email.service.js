const nodemailer = require('nodemailer');
const { AppError } = require('../utils/error-handler.util');
const logger = require('../utils/logger.util');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to,
                subject,
                html
            };

            await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${to}`);
        } catch (error) {
            logger.error('Error sending email:', error);
            throw new AppError('Error sending email', 500);
        }
    }

    async sendVerificationEmail(user, token) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const html = `
            <h1>Email Verification</h1>
            <p>Hello ${user.firstName},</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        `;

        await this.sendEmail(user.email, 'Verify Your Email', html);
    }

    async sendPasswordResetEmail(user, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>Hello ${user.firstName},</p>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `;

        await this.sendEmail(user.email, 'Reset Your Password', html);
    }

    async sendTenantInvitationEmail(invitation, property) {
        const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitation.token}`;
        const html = `
            <h1>Tenant Invitation</h1>
            <p>Hello,</p>
            <p>You have been invited to become a tenant for the property:</p>
            <p><strong>${property.name}</strong></p>
            <p>Click the link below to accept the invitation and complete your registration:</p>
            <a href="${invitationUrl}">${invitationUrl}</a>
            <p>This invitation will expire in 7 days.</p>
            <p>If you didn't expect this invitation, please ignore this email.</p>
        `;

        await this.sendEmail(invitation.email, 'Property Tenant Invitation', html);
    }

    async sendMaintenanceUpdateEmail(user, maintenance) {
        const html = `
            <h1>Maintenance Request Update</h1>
            <p>Hello ${user.firstName},</p>
            <p>Your maintenance request has been updated:</p>
            <p><strong>Status:</strong> ${maintenance.status}</p>
            <p><strong>Description:</strong> ${maintenance.description}</p>
            ${maintenance.notes ? `<p><strong>Notes:</strong> ${maintenance.notes}</p>` : ''}
            <p>You can view the full details in your dashboard.</p>
        `;

        await this.sendEmail(user.email, 'Maintenance Request Update', html);
    }

    async sendRentReminderEmail(tenant, property, amount, dueDate) {
        const html = `
            <h1>Rent Payment Reminder</h1>
            <p>Hello ${tenant.firstName},</p>
            <p>This is a reminder that your rent payment is due soon:</p>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            <p>Please log in to your account to make the payment.</p>
        `;

        await this.sendEmail(tenant.email, 'Rent Payment Reminder', html);
    }

    async sendServiceProviderApprovalEmail(user) {
        const html = `
            <h1>Service Provider Account Approved</h1>
            <p>Hello ${user.firstName},</p>
            <p>Your service provider account has been approved!</p>
            <p>You can now log in to your account and start accepting maintenance requests.</p>
            <p>Click the link below to access your dashboard:</p>
            <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a>
        `;

        await this.sendEmail(user.email, 'Account Approved', html);
    }

    async sendPropertyAssignmentEmail(tenant, property) {
        const html = `
            <h1>Property Assignment Confirmation</h1>
            <p>Hello ${tenant.firstName},</p>
            <p>You have been assigned to a new property:</p>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Address:</strong> ${property.address}</p>
            <p>You can now access the property details and submit maintenance requests through your dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard">${process.env.FRONTEND_URL}/dashboard</a>
        `;

        await this.sendEmail(tenant.email, 'Property Assignment Confirmation', html);
    }

    async sendPropertyAddedEmail(owner, property) {
        const html = `
            <h1>Property Added Successfully</h1>
            <p>Hello ${owner.firstName},</p>
            <p>Your property has been successfully added to the system:</p>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Address:</strong> ${property.address}</p>
            <p>You can now manage this property from your dashboard:</p>
            <a href="${process.env.FRONTEND_URL}/properties/${property.id}">View Property</a>
        `;
        await this.sendEmail(owner.email, 'Property Added Successfully', html);
    }

    async sendMaintenanceConfirmationRequestEmail(tenant, maintenance) {
        const html = `
            <h1>Maintenance Request Confirmation Needed</h1>
            <p>Hello ${tenant.firstName},</p>
            <p>Please review and confirm your maintenance request:</p>
            <p><strong>Issue:</strong> ${maintenance.description}</p>
            <p><strong>Priority:</strong> ${maintenance.priority}</p>
            <p><strong>Category:</strong> ${maintenance.category}</p>
            <p>Click below to review and confirm:</p>
            <a href="${process.env.FRONTEND_URL}/maintenance/${maintenance.id}/confirm">Confirm Request</a>
        `;
        await this.sendEmail(tenant.email, 'Maintenance Confirmation Required', html);
    }

    async sendServiceProviderAssignmentEmail(serviceProvider, maintenance, property) {
        const html = `
            <h1>New Maintenance Request Assignment</h1>
            <p>Hello ${serviceProvider.firstName},</p>
            <p>You have been assigned a new maintenance request:</p>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Issue:</strong> ${maintenance.description}</p>
            <p><strong>Priority:</strong> ${maintenance.priority}</p>
            <p><strong>Category:</strong> ${maintenance.category}</p>
            <p>Click below to view details and accept:</p>
            <a href="${process.env.FRONTEND_URL}/maintenance/${maintenance.id}">View Request</a>
        `;
        await this.sendEmail(serviceProvider.email, 'New Maintenance Assignment', html);
    }

    async sendQuarterlyPropertyReportEmail(owner, property, report) {
        const html = `
            <h1>Quarterly Property Report - ${property.name}</h1>
            <p>Hello ${owner.firstName},</p>
            <p>Here's your quarterly report for ${property.name}:</p>
            <h2>Summary:</h2>
            <p><strong>Occupancy Rate:</strong> ${report.occupancyRate}%</p>
            <p><strong>Maintenance Requests:</strong> ${report.maintenanceCount}</p>
            <p><strong>Rent Collection Rate:</strong> ${report.rentCollectionRate}%</p>
            <p>Click below to view the full report:</p>
            <a href="${process.env.FRONTEND_URL}/reports/property/${property.id}">View Full Report</a>
        `;
        await this.sendEmail(owner.email, `Quarterly Report - ${property.name}`, html);
    }

    async sendNewMessageNotificationEmail(recipient, sender, context) {
        const html = `
            <h1>New Message Received</h1>
            <p>Hello ${recipient.firstName},</p>
            <p>You have received a new message from ${sender.firstName} ${sender.lastName}</p>
            ${context.propertyId ? `<p><strong>Regarding Property:</strong> ${context.propertyName}</p>` : ''}
            ${context.maintenanceId ? `<p><strong>Regarding Maintenance Request:</strong> #${context.maintenanceId}</p>` : ''}
            <p>Click below to view and respond:</p>
            <a href="${process.env.FRONTEND_URL}/messages/${sender.id}">View Message</a>
        `;
        await this.sendEmail(recipient.email, 'New Message Received', html);
    }

    async sendMaintenanceCompletionEmail(tenant, maintenance, photos) {
        const html = `
            <h1>Maintenance Work Completed</h1>
            <p>Hello ${tenant.firstName},</p>
            <p>The maintenance work has been completed:</p>
            <p><strong>Issue:</strong> ${maintenance.description}</p>
            <p><strong>Completed Date:</strong> ${new Date(maintenance.completedDate).toLocaleDateString()}</p>
            <p>Please review the completion photos and confirm the work:</p>
            <a href="${process.env.FRONTEND_URL}/maintenance/${maintenance.id}/review">Review Completion</a>
        `;
        await this.sendEmail(tenant.email, 'Maintenance Work Completed', html);
    }
}

module.exports = new EmailService();
