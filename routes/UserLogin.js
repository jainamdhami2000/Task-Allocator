//jshint esversion:6
var express=require('express')
require("dotenv").config();
const sanitize = require('mongo-sanitize');
const User = require('../model/user');
const multer = require('multer');

var isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
      next()
    }
    else{
      res.redirect('/login')
    }
}


module.exports = function(app, passport) {
//===============================passport-google-oauth20=========================================
  app.get('/',(req,res)=>{
      res.render('firstpage',{
        user:req.user
      });
  });


    app.get('/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

    app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  });
  
  app.get('/failed',(req,res)=>res.send("you failed to log in"));
  app.get('/success',isLoggedIn, (req,res)=>res.send("welcome ${req.user.email}"));


//=============================passport-local=================================================

app.get('/signup',(req,res)=>{
  res.render('register');
})


  app.post('/signup', function(req, res, next) {
    var body = req.body,
        username = body.username,
        password = body.password;
    User.findOne({username:username},function(err,doc){
        if(err) {res.status(500).send('error occured')}
        else {
            if(doc) {
                res.status(500).send('Username already exists') 
            }
            else {
                var record = new User()
                record.username = username;
                record.password = record.hashPassword(password)
                record.save(function(err,user){
                    if(err) {
                        res.status(500).send('db error')
                    } else{
                        res.send(user)
                    }
                })
            }
        }
    })
});

  app.get('/login',(req,res)=>{res.render('login')})
  app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/failed' }),
  function(req, res) {
    res.redirect('/success');
  });



//========================after signing/loginpage===============================================================================
  app.get('/failed',(req,res)=>res.send("you failed to log in"));
  app.get('/success',isLoggedIn, (req,res)=>res.send("welcome ${req.user.email}"));
  app.get('/logout',(req,res)=>{
    req.session=null;
    req.logout();
    res.redirect('/');
});

};

