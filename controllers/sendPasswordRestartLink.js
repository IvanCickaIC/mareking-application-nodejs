const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();
const secretKey = process.env.PASSWORD_SECRET;



async function sendPasswordRestartLink(req, res) {
    
    // generate jwt tocken
    const token = jwt.sign({ email: req.body.email }, secretKey, { expiresIn: '1h' });

    //console.log("Mail: ")
    //console.log("Mail :" +req.body.email)
    // Definišite URL potvrdnog linka koji sadrži JWT token
    const confirmationLink = `http://localhost:3000/restartPassword?token=${token}`;


    //sending mail to confirm mail
    let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL, 
        pass: process.env.GOOGLE_SECRET
    }
    });

    let mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: req.body.email, // Email adresa korisnika koji se registrovao
        subject: 'Confirm your email address',
        html: `<p>Click <a href="${confirmationLink}">here</a> to confirm your email address and login.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
             return res.status(500).send(error + 'An error occurred while sending confirmation email.');
        } else {
             console.log('Email poslat: ' + info.response);
            return res.status(200).send('Confirmation email sent. Please check your inbox.');
        }
    });
}

module.exports = sendPasswordRestartLink;
