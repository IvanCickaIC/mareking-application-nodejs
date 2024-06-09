const { User } = require('../models'); 
const { validationResult } = require('express-validator');
const passport = require('passport')
const initializeLocallPassport = require('../utility/initLocalPassport')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY



async function blockUser(req, res) {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (user) {
      user.isBlocked = true;
      await user.save();
      res.status(200).send('User blocked');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).send('Internal Server Error');
  }
}


async function registerUser(req, res) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      // If there are validation errors, return with a 400 status and send the errors as a response
      return res.status(400).json({ errors: errors.array() });
  }

  // Additional check for password confirmation
  if (req.body.password !== req.body.confirmPassword) {
      // If passwords do not match, return with a 400 status and send a custom error message
      return res.status(400).json({ errors: [{ message: 'Passwords do not match' }] });
  }

  try {
      // Check if the username already exists in the database
      const existingUsername = await User.findOne({ where: { username: req.body.username } });
      if (existingUsername) {
          // If the username already exists, return with a 400 status and send a custom error message
          return res.status(400).json({ errors: [{ message: 'Username already exists' }] });
      }

      // Check if the email already exists in the database
      const existingEmail = await User.findOne({ where: { email: req.body.email } });
      if (existingEmail) {
          // If the email already exists, return with a 400 status and send a custom error message
          return res.status(400).json({ errors: [{ message: 'Email already exists' }] });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Create a new user with the hashed password
      await User.create({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign({ email: req.body.email }, secretKey, { expiresIn: '1h' });

      // Define URL confirmation link with JWT token
      const confirmationLink = `http://localhost:3000/verify_email?token=${token}`;

      // Send confirmation email
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            //   user: process.env.GOOGLE_EMAIL,
            //   pass: process.env.GOOGLE_SECRET
            user:process.env.GOOGLE_SLIKE_EMAIL,
            pass:process.env.GOOGLE_SLIKE_PASS
          }
      });

      let mailOptions = {
          from: process.env.GOOGLE_EMAIL,
          to: req.body.email,
          subject: 'Confirm your email address',
          html: `<p>Click <a href="${confirmationLink}">here</a> to confirm your email address and login.</p>`
      };

      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
              // If there's an error sending the email, return with a 500 status and send an error message
              return res.status(500).json({ error: 'An error occurred while sending confirmation email.' });
          } else {
              // If email sent successfully, return with a 200 status and send a success message
              return res.status(200).json({ message: 'Confirmation email sent. Please check your inbox.' });
          }
      });
  } catch (error) {
      // If there's an error during registration, return with a 500 status and send an error message
      return res.status(500).json({ error: 'An error occurred while registering. Please try again later.' });
  }
}



initializeLocallPassport(passport,User);



const loginUser = async (req, res, next) => {
  // Proverite da li je korisnik već verifikovan
  const user = await User.findOne({ where: { email: req.body.email } });
  if (user && !user.emailConfirmed) {
    // Ako korisnik nije verifikovan, prikažite popup sa obaveštenjem
    return res.status(401).json({ errors: [{ message: 'Please verify your email address.' }] });
  } else if (user && user.isBlocked) {
    // Ako korisnik nije verifikovan, prikažite popup sa obaveštenjem
    return res.status(403).json({ errors: [{ message: 'you are bloced cannot longer write comments on this site' }] });
  }else {
    // Ako je korisnik verifikovan, nastavite sa standardnim procesom logovanja
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
  }
}

module.exports = {blockUser,registerUser,loginUser};