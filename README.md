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