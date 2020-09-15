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

  passport.use('google', new GoogleStrategy({
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientID,
      callbackURL: configAuth.googleAuth.callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
      //User.findOrCreate({ googleId: profile.id }, function (err, user) {
      // return cb(err, user);
      return (null, profile);
      // });
    }
  ));


  //PASSPORT GITHUB STRATEGY



  //PASSPORT LINKEDIN STRATEGY


};
