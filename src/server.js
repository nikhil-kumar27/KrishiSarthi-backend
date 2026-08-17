/**
 * server.js
 *
 * Single Responsibility: Start the HTTP server. Does not define any
 * routes or middleware itself - that is app.js's job.
 */

const createApp = require('./app');
const env = require('./config/env');

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`backend-member-4 listening on port ${env.PORT} (env: ${env.NODE_ENV})`);});
