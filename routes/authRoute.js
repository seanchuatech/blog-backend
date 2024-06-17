const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Create user
router.post('/', authController.handleAuth);

module.exports = router;