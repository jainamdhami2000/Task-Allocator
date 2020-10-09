//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
var User = require('../model/user');

router.use(express.static(path.join(__dirname + 'public')));

router.get('/',function(req,res){
    res.render("organization_chat.ejs");
});

router.get('/post/:userid', function(req, res) {
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Posts'
    });
  });

  router.get('/health/:userid', function(req, res) {
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Health & Family Welfare'
    });
  });

  router.get('/external_affair/:userid', function(req, res) {
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'External Affair'
    });
  });

  router.get('/banking/:userid', function(req, res) {
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Banking'
    });
  });

  router.get('/insurance/:userid', function(req, res){
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Insurance'
    });
  });

  router.get('/telecoms/:userid', function(req, res){
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Telecoms'
    });
  });

  router.get('/road/:userid', function(req, res){
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Road Transport And Highways'
    });
  });

  router.get('/schooledu/:userid', function(req, res){
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'School Education and Literacy'
    });
  });

  router.get('/petroleum/:userid', function(req, res){
    res.render('index2.ejs', {
      userid: req.params.userid,
      Ministry: 'Petroleum and Natural Gas'
    });
  });

module.exports = router;
