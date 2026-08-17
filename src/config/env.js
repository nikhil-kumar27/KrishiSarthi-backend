require('dotenv').config();

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = Object.freeze({
  PORT: toInt(process.env.PORT, 4004),
  NODE_ENV: process.env.NODE_ENV || 'production',
});
