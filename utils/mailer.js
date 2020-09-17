//jshint esversion:6
require("dotenv").config();
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0a28e8fe0fd01b",
    pass: "3d5b9c0dbbe6e3"
  }
});
//module.exports = function(email, content) {

  var mailOptions = {
    from:'"Task Allocator" <TaskAllocaator@gmail.com>',
    to: "a0606kp@gmail.com",
    subject: 'message sent by task allocator.',
    text:"the first mail sent my nodemailer",
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
//};
