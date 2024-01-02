// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5000', // Change this to match your Flask server's address
      changeOrigin: true,
    })
  );
};
