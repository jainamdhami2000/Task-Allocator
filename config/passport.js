//jshint esversion:6

const localStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const configAuth = require('./auth');
const multer = require('multer');

//MULTER IMPLEMENTATION


module.exports = function(passport) {

  //PASSPORT SERIALIZATION AND DESERIALIZATION



  //PASSPORT LOCAL SIGNUP



  //PASSPORT LOCAL LOGIN




  //PASSPORT FACEBOOK STRATEGY



  //PASSPORT GOOGLE STRATEGY



  //PASSPORT GITHUB STRATEGY



  //PASSPORT LINKEDIN STRATEGY

  
};
