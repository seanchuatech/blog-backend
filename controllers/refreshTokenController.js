const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) return res.sendStatus(401);  // Unauthorized
    const refreshToken = cookies.jwt;

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) return res.status(403); // Forbidden
        // evaluate jwt 
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser.username !== decoded.UserInfo.username) return res.sendStatus(403);
                // if (err) {
                //     return res.sendStatus(403);
                // }
                // if (foundUser.username !== decoded.username) {
                //     console.log('db user: ', foundUser.username)
                //     console.log('decoded user: ', decoded.username)
                //     return res.sendStatus(403);
                // }
                // console.log(decoded.UserInfo.username);
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "id": decoded._id,
                            "username": decoded.username 
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '10s' }
                );
                res.json({ accessToken })
            }
        );

        /* 
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err || foundUser.username !== decoded.username) {
              // Revoke refresh token if there's an error
              await User.updateOne({ _id: foundUser._id }, { refreshToken: null });
              return res.status(403).json({ error: { message: 'Forbidden (Token invalid or revoked)' } });
            }
            // Create payload
            const tokenPayload = { 
                id: user._id,
                username: user.username 
                // Add any other relevant user data you want to include in the token
            };

            const accessToken = jwt.sign(
                tokenPayload,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' } 
            );
            res.json({ accessToken });
        });
        */
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: 'Server error' } });
    }
}

module.exports = { handleRefreshToken }