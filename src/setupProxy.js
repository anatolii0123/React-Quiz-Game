const { createProxyMiddleware } = require('http-proxy-middleware');

const env = process.env.NODE_ENV;

console.log('proxy env:', env)

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: (!!env && env.includes('production')) ? 'https://arcane-atoll-82454.herokuapp.com' : 'https://arcane-atoll-82454.herokuapp.com',
      changeOrigin: true,
    })
  );
};