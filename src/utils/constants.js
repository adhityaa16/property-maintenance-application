module.exports = {
    // User roles
    ROLES: {
        OWNER: 'owner',
        TENANT: 'tenant',
        SERVICE_PROVIDER: 'service_provider'
    },

    // Property status
    PROPERTY_STATUS: {
        AVAILABLE: 'available',
        OCCUPIED: 'occupied',
        MAINTENANCE: 'maintenance',
        INACTIVE: 'inactive'
    },

    // Maintenance request status
    MAINTENANCE_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        ASSIGNED: 'assigned',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Maintenance categories
    MAINTENANCE_CATEGORIES: [
        'plumbing',
        'electrical',
        'hvac',
        'appliance',
        'structural',
        'pest_control',
        'other'
    ],

    // Maintenance priority
    MAINTENANCE_PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        EMERGENCY: 'emergency'
    },

    // Payment status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    },

    // Payment methods
    PAYMENT_METHODS: {
        CREDIT_CARD: 'credit_card',
        BANK_TRANSFER: 'bank_transfer',
        CASH: 'cash'
    },

    // Notification types
    NOTIFICATION_TYPES: {
        MAINTENANCE_REQUEST: 'maintenance_request',
        MAINTENANCE_UPDATE: 'maintenance_update',
        CHAT_MESSAGE: 'chat_message',
        RENT_REMINDER: 'rent_reminder',
        RENT_PAYMENT: 'rent_payment',
        TENANT_INVITATION: 'tenant_invitation',
        SYSTEM: 'system'
    },

    // Notification priority
    NOTIFICATION_PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    },

    // File upload
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
        ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        FOLDERS: {
            PROPERTY_IMAGES: 'property-images',
            MAINTENANCE_IMAGES: 'maintenance-images',
            DOCUMENTS: 'documents',
            PROFILE_IMAGES: 'profile-images'
        }
    },

    // JWT
    JWT: {
        EXPIRES_IN: '24h',
        REFRESH_EXPIRES_IN: '7d'
    },

    // Email
    EMAIL: {
        VERIFICATION_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
        PASSWORD_RESET_EXPIRES_IN: 60 * 60 * 1000, // 1 hour
        INVITATION_EXPIRES_IN: 7 * 24 * 60 * 60 * 1000 // 7 days
    },

    // Pagination
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    }
};
