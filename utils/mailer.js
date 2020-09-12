//jshint esversion:6
require("dotenv").config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
});
module.exports = function(email, content) {

};
