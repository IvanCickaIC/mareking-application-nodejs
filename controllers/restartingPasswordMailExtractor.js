const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();
const secretKey = process.env.PASSWORD_SECRET;

async function emailExtractorFromToken(req, res, next) {
    
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ errors: [{ message: 'Token not provided' }] });
    }

    try {
        console.log("Token"+token);
        const decodedToken = jwt.verify(token, secretKey);
        const email = decodedToken.email;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ errors: [{ message: 'User not found' }] });
        }

        // Set the email in the request object
        req.email = email;

        // Call the next middleware
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ errors: [{ message: 'Invalid or expired token' }] });
    }
}

module.exports = emailExtractorFromToken;
