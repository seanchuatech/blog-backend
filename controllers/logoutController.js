const User = require('../models/User');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
  
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204); // No content
    }
    const refreshToken = cookies.jwt;
  
    try {
      // Is refreshToken in db?
      const foundUser = await User.findOne({ refreshToken }).exec();
      if (!foundUser) {
        res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
        return res.sendStatus(204);
      }
  
      // Revoke the refresh token (add to blacklist, invalidate in DB, etc.)
      foundUser.refreshToken = '';
      await foundUser.save();
      console.log(result);
  
      // Clear cookie
      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
      res.sendStatus(204); // Successful logout
    } catch (error) {
      console.error("Error during logout:", error); // Log the error for debugging
      res.status(500).json({ error: { message: "Server error during logout" } });
    }
  };
  
  module.exports = { handleLogout };
  