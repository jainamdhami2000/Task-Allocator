//jshint esversion:6
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const GitHubStrategy = require('passport-github2').Strategy;
// const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const configAuth = require('./auth');
const multer = require('multer');

//MULTER IMPLEMENTATION


module.exports = function(passport) {

  //PASSPORT SERIALIZATION AND DESERIALIZATION
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });



  //PASSPORT LOCAL
  passport.use('local', new localStrategy(
    function(username, password, done) {
      User.findOne({
        username: username
      }, function(err, user) {
        console.log(user)
        if (err) {

          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!user.validPassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  ));

  //PASSPORT FACEBOOK STRATEGY



  //PASSPORT GOOGLE STRATEGY
  passport.use(new GoogleStrategy({
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({
          'google.id': profile.id
        }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            // if a user is found, log them in
            return done(null, user, req.flash('message', 'Login'));
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new User();
            // set all of the relevant information
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.FirstName = profile.name.givenName;
            newUser.LastName = profile.name.familyName;
            newUser.isVerified = true;
            newUser.Email = profile.emails[0].value; // pull the first email
            newUser.username = profile.emails[0].value.substr(0, profile.emails[0].value.indexOf('@'));
            newUser.loginType = 'google';
            newUser.image = profile.photos[0].value;
            console.log(profile);
            // save the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser, req.flash('message', 'Signup'));
            });
          }
        });
      });
    }));


  //PASSPORT GITHUB STRATEGY



  //PASSPORT LINKEDIN STRATEGY


};
