require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const cors = require('cors');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
    credentials: true
}));

app.use(express.json());

app.post('/api/shared/cart', (req, res) => {
    console.log('Saving cart data:', req.body);
    req.session.cartData = req.body;
    res.json({ success: true });
});

app.get('/api/shared/data', (req, res) => {
    console.log('Fetching shared data:', req.session.cartData);
    res.json({
        cart: req.session.cartData || null
    });
});

const mainAppProxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('x-forwarded-host', req.headers.host);
        proxyReq.setHeader('x-forwarded-proto', req.protocol);
    }
});

const checkoutAppProxy = createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/checkout': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('x-forwarded-host', req.headers.host);
        proxyReq.setHeader('x-forwarded-proto', req.protocol);
    }
});

app.use('/_next/static', express.static('public'));
app.use('/_next/webpack-hmr', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
    req.on('close', () => res.end());
});

app.use('/checkout/_next', checkoutAppProxy);
app.use('/checkout', checkoutAppProxy);
app.use('/_next', mainAppProxy);
app.use('/', mainAppProxy);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('Routes:');
    console.log('- Main app: http://localhost:8080');
    console.log('- Checkout: http://localhost:8080/checkout');
    console.log('- API: http://localhost:8080/api/shared/*');
});