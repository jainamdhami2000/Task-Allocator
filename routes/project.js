//jshint esversion:6

require("dotenv").config();
const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Project = require('../model/project');

router.get('/users',(req, res)=>{
  User.find({},(err,users)=>{
    var leftusers = users.filter(user=>{
      return String(req.user._id)!=String(user._id);
    });
    res.send({users:leftusers});
  });
});

router.get('/create', (req, res) => {
  res.render('createteam', {
    user: req.user
  });
});

router.post('/create',isLoggedIn, (req, res) => {
  var project = new Project({
    project_name: req.body.project_name,
    leader: req.user._id,
   // leader: req.body.leader,
  });
  var team = [];
  req.body.teammates.forEach(teammate => {
    team.push({
      user_id: teammate,
      status: false
    });
  });
  User.find({
    _id: {
      $in: req.body.teammates
    }
  }, (err, users) => {
    users.forEach(user => {
      user.asmember.push({
        project_id: project._id,
        status: false
      });
      user.save();
    });
  });
  project.teammates = team;
  project.save();
  //user_id = req.body.leader;
  User.findOne({
    _id: req.user._id
  //  _id: user_id
  }, (err, user) => {
    req.user.managing.push(project._id);
    //user.managing.push(project._id);
     user = req.user;
    user.save();
    res.json({
      project: project,
      user: req.user
    });
  });
});

router.post('/createtask', (req, res) => {
  Project.findOne({
    _id: req.body.projectId
  }, (err, project) => {
    project.task.push({
      task_name: req.body.task_name,
      task_description: req.body.task_description,
      assigned_to: req.body.user_id,
      isDone: 0,
      start_time: Date.now(),
      end_time: req.body.end_time
    });
    project.save();
    res.json(project);
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect('/');
}

module.exports = router;
