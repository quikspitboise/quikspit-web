const DIST_REQUIRE_PATH = '../dist/vercel.js';

let compiledHandler;
try {
  compiledHandler = require(DIST_REQUIRE_PATH);
} catch (error) {
  const detail = error && error.stack ? error.stack : String(error);
  const handler = (req, res) => {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ serverlessBundleError: String(detail).slice(0, 2000) }));
  };
  module.exports = handler;
  module.exports.default = handler;
  return;
}

module.exports = compiledHandler.default || compiledHandler;
