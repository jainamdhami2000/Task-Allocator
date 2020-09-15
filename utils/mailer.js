//jshint esversion:6
require("dotenv").config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
});
module.exports = function(email, content) {

  var mailOptions = {
    from:'"Task Allocator" <smtp.mailtrap.io>',
    to: email,
    subject: 'message sent by task allocator.',
    text:content
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
