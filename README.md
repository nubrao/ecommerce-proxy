# E-commerce Proxy 🔄

Backend for Frontend (BFF) and API Gateway for the e-commerce microfront-end architecture.

## 🚀 Features

- Route management for microfront-ends
- Shared state management
- API Gateway functionality
- Session management
- CORS handling
- Health checks

## 🛠️ Technologies

- Node.js
- Express.js
- http-proxy-middleware
- Express Session
- CORS

## 📋 Prerequisites

- Node.js 20.x or later
- npm or yarn
- Docker (for containerized environment)

## 🏃‍♂️ Running the Project

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
PORT=8080
SESSION_SECRET=your-secret-key
ECOMMERCE_APP_URL=http://localhost:3000
CHECKOUT_APP_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8080
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

### Using Docker

```bash
docker compose up ecommerce-proxy
```

The proxy will be available at http://localhost:8080

## 📁 Project Structure

```
ecommerce-proxy/
├── src/
│   ├── index.js     # Main application file
│   ├── routes/      # Route definitions
│   └── middleware/  # Custom middleware
├── config/          # Configuration files
└── tests/          # Test files
```

## 🔄 Dependencies

This project manages:
- `ecommerce-app` - Main store application
- `checkout-app` - Checkout process

## 🛣️ Routes

- `/` -> Main store application
- `/checkout` -> Checkout application
- `/api/shared/data` -> Shared state endpoint
- `/api/shared/cart` -> Cart data endpoint

## 📚 Available Scripts

- `npm run dev` - Run development server
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8080 |
| SESSION_SECRET | Session encryption key | required |
| CORS_ORIGINS | Allowed CORS origins | required |
| NODE_ENV | Environment | development |