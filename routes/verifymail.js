//jshint esversion:6

require("dotenv").config();
const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const mail = require('../utils/mailer');
const User = require('../model/user');

//handling post request from signup page (registerandlogin.js)

//handling the link clicked on receiving the confirmation mail


module.exports = router;
