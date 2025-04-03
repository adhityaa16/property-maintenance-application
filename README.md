# Property Maintenance Application

A comprehensive property maintenance management system built with Node.js, Express, and MySQL.

## Features

1. User Registration & Access
- Owner Registration with email verification
- Tenant Registration through invitation system
- Service Provider Registration with approval system

2. Property Management
- Property Overview (Q1, Q2, etc.)
- Tenant Management
- Property Status Tracking

3. Maintenance Request System
- Submit and confirm maintenance requests
- Photo upload support
- Priority and category management
- Service provider assignment

4. Communication System
- Real-time chat between tenants and service providers
- Property-related queries
- Photo sharing
- Chat history

5. Rent Management
- Payment tracking
- Automated reminders
- Payment history
- Owner controls

6. Notification System
- Real-time alerts
- Email notifications
- Status updates

7. Mobile App Support
- Responsive design
- Photo handling
- Offline support

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd property-maintenance
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create .env file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update environment variables in .env

5. Create database:
\`\`\`sql
CREATE DATABASE property_maintenance;
\`\`\`

6. Run migrations:
\`\`\`bash
npm run migrate
\`\`\`

## Running the Application

Development mode:
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

## API Documentation

API endpoints are organized into the following categories:

1. Authentication (/api/auth)
2. Properties (/api/properties)
3. Maintenance (/api/maintenance)
4. Chat (/api/chat)
5. Payments (/api/payments)
6. Notifications (/api/notifications)

## Testing

Run tests:
\`\`\`bash
npm test
\`\`\`

## Security

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- Security headers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 