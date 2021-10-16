const { createProxyMiddleware } = require('http-proxy-middleware');

const env = process.env.NODE_ENV;

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: (!!env && env.includes('production')) ? 'https://arcane-atoll-82454.herokuapp.com' : 'http://localhost:3000',
      changeOrigin: true,
    })
  );
};