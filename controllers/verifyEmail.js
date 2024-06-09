const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

async function verifyEmail(req, res) {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ errors: [{ message: 'Token not provided' }] });
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        const email = decodedToken.email;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ errors: [{ message: 'User not found' }] });
        }

        // Update the emailConfirmed field in the User table to true
        await User.update({ emailConfirmed: true }, { where: { email } });

        // Redirect to the login page after successful confirmation
        res.redirect('/login');
    } catch (error) {
        return res.status(400).json({ errors: [{ message: 'Invalid or expired token' }] });
    }
}

module.exports = verifyEmail;

