//jshint esversion:6
require("dotenv").config();
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    if (file.mimetype === 'application/pdf') {
      callback(null, './uploads');
    } else {
      callback(new Error('file type not supported'), false);
    }
  },
  filename: function(req, file, callback) {
    if (file.mimetype === 'application/pdf') {
      callback(null, file.fieldname + '-' + Date.now() + '.pdf');
    } else {
      callback(new Error('file type not supported'), false);
    }
  }
});
var upload = multer({
  storage: storage
});

module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    res.render('index.ejs', {
      user: req.user
    });
  });

  app.get('/signup2-stud', function(req, res) {
    res.render('signup2-stud', {
      user: req.user,
      message: req.flash('signupMessage')
    });
  });

  app.post('/signup2-stud', upload.single('resume'), function(req, res) {
    const file = req.file;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    User.findOne({
      _id: req.user._id
    }, function(err, newUser) {
      newUser.CollegeName = sanitize(req.body.college_name);
      if (req.user.Email == null) {
        newUser.isVerified = false;
        newUser.Email = sanitize(req.body.email);
      }
      newUser.DateofBirth = sanitize(req.body.birthdate);
      newUser.BasicSkills = sanitize(req.body.skills);
      newUser.City = sanitize(req.body.city);
      newUser.resume = file;
      newUser.save();
      if (newUser.isVerified == false)
        res.redirect('/verify');
      else
        res.redirect('/profile/student');
    });
  });

  app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login', {
      message: req.flash('loginMessage')
    });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup', {
      message: req.flash('signupMessage')
    });
  });

  //WITH MULTER USAGE

  // app.post('/signup', upload.single('resume'), passport.authenticate('local-signup', {
  //   successRedirect: '/verify', // redirect to the secure profile section
  //   failureRedirect: '/signup-stud', // redirect back to the signup page if there is an error
  //   failureFlash: true // allow flash messages
  // }));

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/verify', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  app.get('/verify', function(req, res) {
    User.findOne({
      Email: req.user.Email,
    }, function(err, user) {
      if (user.isVerified) {
        if (user.isEmployer) {
          res.redirect('/profile/employer');
        } else if (user.isStudent) {
          res.redirect('/profile/student');
        } else if (user.isTrainer) {
          res.redirect('/profile/trainer');
        }
      } else {
        res.render('verify', {
          user: req.user // get the user out of session and pass to template
        });
      }
    });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
  }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      // successRedirect: '/profile',
      failureRedirect: '/login-stud'
    }),
    function(req, res) {
      // Successful authentication, redirect home.
      if (req.flash('message') == 'Login') {
        if (req.user.isEmployer) {
          res.redirect('/profile/employer');
        } else if (req.user.isStudent) {
          res.redirect('/profile/student');
        }
      } else {
        res.redirect('/signup2-stud');
      }
    });

  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authenticated the user
  app.get('/auth/google/oye-internshala',
    passport.authenticate('google', {
      // successRedirect: '/profile',
      failureRedirect: '/login-stud'
    }),
    function(req, res) {
      // Successful authentication, redirect home.
      if (req.flash('message') == 'Login') {
        if (req.user.isEmployer) {
          res.redirect('/profile/employer');
        } else if (req.user.isStudent) {
          res.redirect('/profile/student');
        }
      } else {
        res.redirect('/signup2-stud');
      }
    });

  app.get('/auth/github', passport.authenticate('github', {
    scope: ['profile', 'user:email']
  }));

  // the callback after github has authenticated the user
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      // successRedirect: '/profile',
      failureRedirect: '/login-stud'
    }),
    function(req, res) {
      // Successful authentication, redirect home.
      if (req.flash('message') == 'Login') {
        if (req.user.isEmployer) {
          res.redirect('/profile/employer');
        } else if (req.user.isStudent) {
          res.redirect('/profile/student');
        }
      } else {
        res.redirect('/signup2-stud');
      }
    });

  app.get('/auth/linkedin', passport.authenticate('linkedin'));

  app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    // successRedirect: '/profile',
    failureRedirect: '/login-stud'
  }), function(req, res) {
    // Successful authentication, redirect home.
    if (req.flash('message') == 'Login') {
      if (req.user.isEmployer) {
        res.redirect('/profile/employer');
      } else if (req.user.isStudent) {
        res.redirect('/profile/student');
      }
    } else {
      res.redirect('/signup2-stud');
    }
  });
};

function isLoggedIn(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      req.isLogged = true;
      return next();
    }
    res.redirect('/');
  } catch (e) {
    console.log(e);
  }
}
