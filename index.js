require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn'); 
const PORT = process.env.PORT || 3500;
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');

connectDB();

const app = express();

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// Public Route(s)
app.use('/register', require('./routes/registerRoute'));
app.use('/auth', require('./routes/authRoute'));
app.use('/refresh', require('./routes/refreshTokenRoute.js'));
app.use('/logout', require('./routes/logoutRoute.js'));
app.use('/display-blog', require('./routes/displayBlogRoute'));

// Protected Route(s)
app.use(verifyJWT);
app.use('/blog', require('./routes/blogRoute'));
app.use('/user', require('./routes/userRoute'));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});