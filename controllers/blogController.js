const Blog = require('../models/Blog');
const mongoose = require('mongoose');
const { body, param, validationResult } = require("express-validator");

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

const createNewBlog = async (req, res) => {
    await Promise.all([
        body('title')
            .trim()
            .escape()
            .isLength({ min: 4 })
            .withMessage("Title must be at least 4 characters.")
            .run(req),
        body('description')
            .trim()
            .escape()
            .isLength({ min: 10 })
            .withMessage("Description must be at least 10 characters.")
            .run(req),
    ]); 

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    try {
        const result = await Blog.create({
            "title": title,
            "description": description
        });

        res.status(201).json({ 'success': `New blog ${title} created!` });
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

const updateBlog = async (req, res) => {

    // Check if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Initialize an empty array to store dynamic validation chains
    const dynamicValidations = [];

    // Check if title is present, if so, add validation
    if (req.body.title) {
        dynamicValidations.push(
            body('title')
                .trim()
                .escape()
                .isLength({ min: 4 })
                .withMessage("Title must be at least 4 characters.")
        );
    }

    // Check if description is present, if so, add validation
    if (req.body.description) {
        dynamicValidations.push(
            body('description')
                .trim()
                .escape()
                .isLength({ min: 10 })
                .withMessage("Description must be at least 10 characters.")
        );
    }

    // Validation for user ID always present
    dynamicValidations.push(
        param('id').isMongoId().withMessage('Invalid blog ID format')
    );

    // Run all dynamic validations + the ID validation
    await Promise.all(dynamicValidations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    try {
        if (!req?.params?.id) {
            return res.status(400).json({ message: 'Blog ID required' });
        }

        const blog = await Blog.findOneAndUpdate(
            { _id: req.params.id }, 
            { title: title, description: description },
            { new: true } // Return the updated document
        ).exec();
    
        if (!blog) {
            return res.status(404).json({ error: { message: 'Blog not found' } });
        }
        res.json(blog); // Return the updated user
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: "Server error" } });
    }
}

const deleteBlog = async (req, res) => {
    //Input Validation/Sanitization
    await Promise.all([
        param('id').isMongoId().withMessage('Invalid blog ID format').run(req)
    ])
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const blogId = req.params.id; 

        // 1. Check Blog Existence:
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: { message: 'Blog not found' } });
        }

        const result = await Blog.deleteOne({ _id: blogId }); 
        if (result.deletedCount === 0) { // Handle case where delete was unsuccessful
            return res.status(500).json({ error: { message: 'Failed to delete blog' } });
        }

        // 4. Success Response (Standard Format)
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
}

module.exports = { 
    getAllBlogs,
    createNewBlog,
    getBlog,
    updateBlog,
    deleteBlog,
};