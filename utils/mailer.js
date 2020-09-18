//jshint esversion:6
require("dotenv").config();
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
});
module.exports = function(email, content) {

  var mailOptions = {
    from:process.env.email,
    to: email,
    subject: 'Verify Mail',
    text:content,
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
