const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Create user
router.get('/', blogController.getAllBlogs);

// Create user
router.post('/', blogController.createNewBlog);

// Create user
router.get('/:id', blogController.getBlog);

// Create user
router.put('/:id', blogController.updateBlog);

// Create user
router.delete('/:id', blogController.deleteBlog);

module.exports = router;