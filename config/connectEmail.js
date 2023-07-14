import NodeMailer from 'nodemailer'
// const dotenv = require('dotenv');
import * as dotenv from 'dotenv' 
dotenv.config();


export const transporter = NodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Admin Gmail ID
        pass: process.env.EMAIL_PASS, // Admin Gmail Password
    },
})

// module.exports = transporter;