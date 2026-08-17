/**
 * recommendation.routes.js
 *
 * Single Responsibility: Define the HTTP route(s) for the
 * recommendation feature and wire them to the controller. No business
 * logic here - just route -> controller mapping.
 */

const express = require('express');
const { postRecommend } = require('../controllers/recommendation.controller');

const router = express.Router();

router.post('/recommend', postRecommend);

module.exports = router;
