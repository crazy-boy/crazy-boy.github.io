process.env.MARKDOWN_TEX = 'false';
const http = require('http');
const Waline = require('@waline/vercel');
const serverless = require('serverless-http');
const app = Waline({ env: 'netlify' });
module.exports.handler = serverless(http.createServer(app));
