require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Proxy routes
app.use('/auth', createProxyMiddleware({ 
  target: `http://${process.env.AUTH_SERVICE_HOST}:4001`, 
  changeOrigin: true 
}));

app.use('/products', createProxyMiddleware({ 
  target: `http://${process.env.PRODUCT_SERVICE_HOST}:4002`, 
  changeOrigin: true 
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));