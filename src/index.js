require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const cors = require('cors');

const app = express();

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
    credentials: true
}));

app.use(express.json());

// Shared API endpoints
const sharedApiRoutes = express.Router();

sharedApiRoutes.post('/cart', (req, res) => {
    console.log('Saving cart data:', req.body);
    req.session.cartData = req.body;
    res.json({ success: true });
});

sharedApiRoutes.get('/data', (req, res) => {
    console.log('Fetching shared data:', req.session.cartData);
    res.json({
        cart: req.session.cartData || null
    });
});

app.use('/api/shared', sharedApiRoutes);

// Proxy configurations
const mainAppProxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('x-forwarded-host', req.headers.host);
        proxyReq.setHeader('x-forwarded-proto', req.protocol);
    },
    onError: (err, req, res) => {
        console.error('Main app proxy error:', err);
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Main application unavailable');
    }
});

const checkoutAppProxy = createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/checkout': '/' 
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('x-forwarded-host', req.headers.host);
        proxyReq.setHeader('x-forwarded-proto', req.protocol);
    },
    onError: (err, req, res) => {
        console.error('Checkout app proxy error:', err);
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Checkout application unavailable');
    }
});

// Static files handling
app.use('/checkout/_next/static', express.static('public'));
app.use('/_next/static', express.static('public'));

// WebSocket handling
const handleWebSocket = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
    req.on('close', () => res.end());
};

app.use('/checkout/_next/webpack-hmr', handleWebSocket);
app.use('/_next/webpack-hmr', handleWebSocket);

app.use('/checkout', checkoutAppProxy);
app.use('/', mainAppProxy);

// Add debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('Main app running on http://localhost:3000');
    console.log('Checkout app running on http://localhost:3001');
});