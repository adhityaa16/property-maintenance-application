const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { generateToken } = require('../src/utils/helpers');

describe('Authentication', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await User.create({
            email: 'test@example.com',
            password: 'password123',
            first_name: 'Test',
            last_name: 'User',
            role: 'owner'
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'new@example.com',
                    password: 'password123',
                    first_name: 'New',
                    last_name: 'User',
                    role: 'tenant'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', 'new@example.com');
            expect(response.body.user).toHaveProperty('role', 'tenant');
        });

        it('should not register with existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    first_name: 'Test',
                    last_name: 'User',
                    role: 'tenant'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });

        it('should not login with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });
}); 