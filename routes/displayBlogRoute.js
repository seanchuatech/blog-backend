const express = require('express');
const router = express.Router();
const displayBlogController = require('../controllers/displayBlogController');

router.get('/', displayBlogController.getAllBlogs);

router.get('/:id', displayBlogController.getBlog);

module.exports = router;