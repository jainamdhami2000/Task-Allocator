//jshint esversion:6
require("dotenv").config();
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const multer = require('multer');
const Project = require('../model/project');
//const mail=require('../utils/mailer');

module.exports = function(app, passport) {
  app.get('/', (req, res) => {
    res.render('firstpage', {
      user: req.user
    });
  });

  app.get('/dashboard', (req, res) => {
    var memberof = req.user.asmember;
    var leaderof = req.user.managing;
    var merged = [...memberof, ...leaderof];
    var managing = [];
    var asmember = [];
    var pending = [];
    Project.find({
      _id: {
        $in: merged
      }
    }, (err, projects) => {
      managing = projects.filter(project => {
        return leaderof.includes(project._id);
      });
      asmember = projects.filter(project => {
        return memberof.includes(project._id);
      });
      pending = projects.filter(project => {
        tasks = project.tasks.filter(task => {
          return String(req.user._id) == String(task.assigned_to) && task.isDone == 0;
        });
        return tasks;
      });
      // res.render('dashboard', {
      //   user: req.user,
      //   managing: managing,
      //   asmember: asmember,
      //   pending: pending
      // });
      res.json({
        managing: managing,
        asmember: asmember,
        pending: pending
      });
    });
  });

  app.get('/signup', (req, res) => {
    res.render('register', {
      message: req.flash('signupMessage')
    });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/login', (req, res) => {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/verify', function(req, res) {
    User.findOne({
      Email: req.user.Email,
    }, function(err, user) {
      if (user.isVerified) {
        res.redirect('/');
      } else {
        res.render('verify', {
          user: req.user // get the user out of session and pass to template
        });
      }
    });
  });

  app.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect('/');
}
