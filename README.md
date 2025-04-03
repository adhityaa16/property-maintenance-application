<<<<<<< HEAD
# Property Maintenance Application

A full-stack application for managing property maintenance tasks.

## Project Structure

```
property-maintenance-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── .env               # Environment variables
│   └── package.json       # Dependencies and scripts
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials and other settings

3. Initialize the database:
   ```bash
   npm run db:setup
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/test` - Test route to verify server functionality
- More endpoints to be added...

## Database Configuration

The application uses MySQL with Sequelize ORM. Make sure to:
1. Have MySQL installed and running
2. Create a database named `property_maintenance`
3. Update the `.env` file with correct credentials

## Development

- Node.js version: 14.x or higher
- MySQL version: 5.7 or higher
- NPM version: 6.x or higher

## License

MIT 
=======
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
>>>>>>> 1f09a4e613cf65445297670a0a257ec2a34bcc46
