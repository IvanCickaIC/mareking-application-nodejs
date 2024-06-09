const { body} = require('express-validator');


function registerValidation(){
  return [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ]
};


module.exports = registerValidation;