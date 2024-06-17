const Blog = require('../models/Blog');
const mongoose = require('mongoose');

const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const blogs = await Blog.find()
            .skip((page - 1) * limit)
            .limit(limit);

        if (blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found' });
        }
        res.json(blogs);
    } catch (err) {
        console.error(err); // Log full error object
        res.status(500).json({ error: { message: err.message, code: 'INTERNAL_SERVER_ERROR' } });
    }
}

const getBlog = async (req, res) => {
    const blogId = req.params.id;

    // Check if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: { message: 'Invalid blog ID format' } });
    }

    try {
        if (!req?.params?.id) {
            return res.status(400).json({ message: 'Blog ID required' });
        }

        // Check if the ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid blog ID format' });
        }

        const blog = await Blog.findOne({ _id: req.params.id }).exec();

        if (!blog) {
            return res.status(204).json({ message: `Blog ID ${req.params.id} not found` });
        }

        res.json(blog);
    } catch (error) {
        console.error(err); // Log full error object
        res.status(500).json({ error: { message: err.message, code: 'INTERNAL_SERVER_ERROR' } });
    }
}

module.exports = { 
    getAllBlogs,
    getBlog,
};