# Property Maintenance Application

A comprehensive property maintenance management system built with Node.js and MySQL.

## Features

- User Management (Landlords, Tenants, Maintenance Staff)
- Property Management
- Maintenance Request System
- Real-time Chat System
- Payment Processing
- Notification System
- Email Notifications
- File Upload System (AWS S3)

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT
- **File Storage:** AWS S3
- **Email Service:** SMTP
- **Real-time Features:** WebSocket

## Environment Variables

The following environment variables are required:

```env
# Application Settings
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=property_maintenance
DB_USER=root
DB_PASSWORD=your_password

# JWT Settings
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM_NAME=Property Maintenance
EMAIL_FROM_ADDRESS=noreply@example.com

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Logging
LOG_LEVEL=info
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up the database:
   ```bash
   npm run db:setup
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
└── utils/         # Utility functions
```

## API Documentation

API documentation will be available at `/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 