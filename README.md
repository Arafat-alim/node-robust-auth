# Node-Robust-Authentication System

A comprehensive, production-ready authentication microservice built with modern security practices, scalability, and developer experience in mind. This system replicates and enhances the functionality offered by modern authentication providers like Clerk.dev.

## 🚀 Features

### Core Authentication

- **Email/Password Authentication** - Secure password hashing with bcrypt
- **OAuth Integration** - Google, GitHub, Facebook, and extensible for more providers
- **Magic Link Authentication** - Passwordless login via email
- **Phone/SMS OTP Verification** - Multi-channel verification support

### Advanced Security

- **Two-Factor Authentication (2FA)** - TOTP support with QR codes and backup codes
- **JWT-based Sessions** - Stateless authentication with access/refresh tokens
- **Rate Limiting** - Comprehensive protection against brute force attacks
- **Account Security** - Password reset, email verification, phone verification
- **OWASP Compliance** - Following security best practices

### User Management

- **Profile Management** - Complete user profile CRUD operations
- **Role-Based Access Control** - Flexible permission system
- **Session Management** - Multi-device session tracking and revocation
- **Account Recovery** - Multiple recovery options and security alerts

## 🏗️ Architecture

### Backend (Node.js + Express)

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, rate limiting
│   ├── models/         # Database schemas (User, Token)
│   ├── routes/         # API route definitions
│   ├── services/       # Email, SMS, external integrations
│   └── index.js        # Application entry point
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

### Frontend (React + TypeScript)

```
src/
├── components/         # Reusable UI components
├── pages/             # Route components
├── services/          # API client and utilities
├── store/             # State management (Zustand)
└── App.tsx            # Main application component
```

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Primary database with Mongoose ODM
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Speakeasy** - TOTP implementation
- **Nodemailer** - Email service
- **Express Rate Limit** - Rate limiting middleware

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Email service credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd node-robust-authentication-system
npm install
```

2. **Configure environment variables**

```bash
# Copy the example environment file
cp server/.env.example server/.env

# Edit server/.env with your configuration
```

3. **Start the development servers**

```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:5000
```

### Environment Configuration

Key environment variables to configure in `server/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/node-robust-auth

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Request Magic Link

```http
POST /api/auth/magic-link/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Setup 2FA

```http
POST /api/auth/2fa/setup
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### Update Profile

```http
PUT /api/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1987654321"
}
```

## 🔒 Security Features

### Password Security

- Bcrypt hashing with configurable rounds
- Password strength requirements
- Secure password reset flow

### Rate Limiting

- General API rate limiting (100 requests/15 minutes)
- Strict limits for sensitive operations (5 requests/15 minutes)
- OTP rate limiting (3 requests/minute)

### Token Management

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token rotation on refresh
- Secure token storage and transmission

### Account Protection

- Account lockout after failed attempts
- Email verification requirements
- Security event notifications
- Session management and revocation

## 🧪 Development

### Code Quality

- ESLint configuration for consistent code style
- TypeScript for type safety
- Comprehensive error handling
- Input validation and sanitization

### File Organization

- Modular architecture with clear separation of concerns
- Feature-based folder structure
- Reusable components and utilities
- Clean import/export patterns

## 🚀 Deployment

### Production Considerations

- Environment-specific configuration
- Database connection pooling
- Logging and monitoring setup
- SSL/TLS certificate configuration
- Load balancing for high availability

### Docker Support (Future Enhancement)

```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern authentication providers like Clerk.dev
- Built following OWASP security guidelines
- Implements industry-standard authentication patterns
- Designed for enterprise-grade applications

---
