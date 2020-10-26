//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
var User = require('../model/user');

router.use(express.static(path.join(__dirname + '/../public')));

router.get('/', isLoggedIn, (req, res) => {
  res.redirect('http://localhost:3001/chat/' + req.user._id);
});

router.get('/:userid', (req, res) => {
  // console.log(req.params.userid)
  User.findOne({
    _id: req.params.userid
  }, function(err, user) {
    if (err) {
      res.send(err);
    } else {
      req.user = user;
      res.render("team_chat.ejs", {userid: req.user._id});
    }
  });
  // res.redirect('/chatrooms');
});

function isLoggedIn(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      req.isLogged = true;
      return next();
    }
    res.redirect('/login-user');
  } catch (e) {
    console.log(e);
  }
}

module.exports = router;
