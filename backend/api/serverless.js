const compiledHandler = require('../dist/vercel.js');

module.exports = compiledHandler.default || compiledHandler;
