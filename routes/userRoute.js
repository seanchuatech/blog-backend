const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create user
router.get('/', userController.getAllUsers);

// Create user
router.get('/:id', userController.getUser);

// Create user
router.put('/:id', userController.updateUser);

// Create user
router.delete('/:id', userController.deleteUser);

module.exports = router;