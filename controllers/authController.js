const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT generations

const handleAuth = async (req, res) => {
    // Validation and Sanitization
    await Promise.all([
        body('username').trim().escape().run(req),
        body('password').trim().escape().run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // 1. Find the User
        const user = await User.findOne({ username }).exec();
        if (!user) {
            return res.status(401).json({ error: { message: 'Invalid username or password' } });
        }

        // 2. Compare Passwords
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // res.status(200).json({ 'success': `${user.username } logged in!` });

            // Create payload
            const tokenPayload = { 
                "UserInfo": {
                    "id": user._id,
                    "username": user.username 
                }
            };

            // 3. Generate access token
            const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });

            // 4. Generate refresh token
            const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

            try {
                user.refreshToken = refreshToken;
                const result = await user.save();
                console.log(result);
            } catch (err) {
                console.error("Error saving refresh token:", err);
                return res.status(500).json({ error: { message: 'Server error' } });
            }

            // // 5. Send Tokens in Cookies
            // res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 10 * 60 * 1000 }); // 10 minutes
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    
            // 4. Send Token in Response
            res.json({ accessToken });

            // No need to send accessToken in response body
            // res.json({ message: "Logged in successfully" });
            
            /* 
            Will add soon
            Rate Limiting (Backend):

            Prevent Brute-Force Attacks: Implement rate limiting on your backend to prevent excessive login attempts from a single IP address or user.
            */
        } else {
            return res.status(401).json({ error: { message: 'Invalid username or password' } });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: 'Server error' } });
    }
}

module.exports = { handleAuth };