const User = require('../models/User');
const mongoose = require('mongoose');
const { body, param, validationResult } = require("express-validator");

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const users = await User.find()
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json(users);
    } catch (err) {
        console.error(err); // Log full error object
        res.status(500).json({ error: { message: err.message, code: 'INTERNAL_SERVER_ERROR' } });
    }
}

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: { message: 'Invalid user ID format' } });
        }

        const user = await User.findOne({ _id: userId }).select('-password').exec();
        if (!user) {
            return res.status(404).json({ error: { message: `User not found` } });
        }

        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: { message: err.message, code: 'INTERNAL_SERVER_ERROR' } });
    }
}

// Update is on hold for now since we still need to do the password validation
const updateUser = async (req, res) => {

    // Check if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Input Validation and Sanitization
    await Promise.all([
        body('username')
            .trim()
            .escape()
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters."),
        param('id').isMongoId().withMessage('Invalid user ID format').run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    try {
        // Check for duplicate usernames (case-insensitive)
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).exec();
        if (existingUser) {
            return res.status(409).json({ error: { message: "Username already exists" } });
        }
        
        const user = await User.findOneAndUpdate(
            { _id: req.params.id }, 
            { username: username }, 
            { new: true } // Return the updated document
        ).select('-password').exec();
        if (!user) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }
        res.json(user); // Return the updated user
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: "Server error" } });
    }
}

const deleteUser = async (req, res) => {
    //Input Validation/Sanitization
    await Promise.all([
        param('id').isMongoId().withMessage('Invalid user ID format').run(req)
    ])
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id; 

        // 1. Check User Existence:
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        const result = await User.deleteOne({ _id: userId }); 
        if (result.deletedCount === 0) { // Handle case where delete was unsuccessful
            return res.status(500).json({ error: { message: 'Failed to delete user' } });
        }

        // 4. Success Response (Standard Format)
        res.status(200).json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
}

module.exports = { 
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
};