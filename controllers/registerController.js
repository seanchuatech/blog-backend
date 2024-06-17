const User = require('../models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator");

const handleNewUser = async (req, res) => {
    await Promise.all([
        body('username')
            .trim()
            .escape()
            .isLength({ min: 4 })
            .withMessage("Username must be at least 4 characters.")
            .run(req),
        body('password')
            .trim()
            .escape()
            .isLength({ min: 4 })
            .withMessage("Password must be at least 4 characters.")
            .run(req),
        body('passwordConfirmation').custom((value, { req }) => {
            return value === req.body.password;
        })
            .withMessage("Password didn't match.")
            .run(req),
    ]); 

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: username }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {
        //encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create and store the new user
        const result = await User.create({
            "username": username,
            "password": hashedPassword
        });

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        console.error(err); // Log full error object
        res.status(500).json({ error: { message: err.message, code: 'INTERNAL_SERVER_ERROR' } });
    }
}

module.exports = { handleNewUser }; 