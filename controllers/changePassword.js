const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const {User} = require('../models');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY

async function changePassword(req, res) {

  try {
      
      // Check if the email exists in the database
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (!existingUser) {
          return res.status(400).json({ errors: [{ message: 'Email dont exists' }] });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      existingUser.password = hashedPassword
      await existingUser.save()
      return res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
      // If there's an error during registration, return with a 500 status and send an error message
      return res.status(500).json({ error: 'An error occurred while registering. Please try again later.' });
  }
}


module.exports = changePassword;
