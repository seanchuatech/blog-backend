const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {

    // Get the Authorization header from either 'authorization' or 'Authorization'
    const authHeader = req.headers.authorization || req.headers.Authorization;
  
    // Check if the Authorization header is present and starts with 'Bearer '
    if (!authHeader?.startsWith('Bearer ')) {
      // If not, send a 401 Unauthorized response with an error message
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }
  
    // Extract the JWT token from the Authorization header
    const token = authHeader.split(' ')[1];
  
    // Verify the JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  
      // Check if there's an error during verification
      if (err) {
        // If so, send a 403 Forbidden response with an error message
        return res.status(403).json({ error: { message: 'Forbidden' } }); 
      }
  
      // If the token is valid, attach the decoded user information to the request object
      req.user = decoded.username;
    //   req.roles = decoded.UserInfo.roles;
  
      // Call the next middleware or route handler
      next(); 
    });
  };

  module.exports = verifyJWT
  