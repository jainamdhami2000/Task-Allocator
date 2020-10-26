//jshint esversion:8

require("dotenv").config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../model/user');
const Project = require('../model/project');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

var uploads = multer({storage: storage});

router.get('/users', (req, res) => {
  var user_id = req.user._id;
  // var user_id = req.body.user_id;
  User.find({}, (err, users) => {
    var leftusers = users.filter(user => {
      return String(user_id) != String(user._id);
    });
    res.send({users: leftusers});
  });
});

router.get('/create', isLoggedIn, (req, res) => {
  res.render('createteam', {user: req.user});
});

router.post('/create', isLoggedIn, (req, res) => {
  var project = new Project({
    project_name: req.body.project_name, leader: req.user._id,
    // leader: req.body.leader,
  });
  var team = [];
  req.body.teammates.forEach(teammate => {
    team.push({user_id: teammate, status: false});
  });
  User.find({
    _id: {
      $in: req.body.teammates
    }
  }, (err, users) => {
    users.forEach(user => {
      user.asmember.push({project_id: project._id, status: false});
      user.save();
    });
  });
  project.teammates = team;
  project.save();
  user_id = req.body.leader;
  User.findOne({
    _id: req.user._id
    // _id: user_id
  }, (err, user) => {
    req.user.managing.push(project._id);
    // user.managing.push(project._id);
    user = req.user;
    user.save();
    res.json({project: project, user: req.user});
  });
});

router.post('/createtask', isLoggedIn, (req, res) => {
  if (req.user.managing.includes(String(req.body.projectId))) {
    Project.findOne({
      _id: req.body.projectId
    }, (err, project) => {
      console.log(req.body.end_time)
      project.tasks.push({
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
  } else {
    res.send('You are not team leader');
  }
});

router.post('/addmembers', isLoggedIn, (req, res) => {
  var teammates = req.body.teammates;
  var projectId = req.body.projectId;
  if (req.user.managing.includes(String(req.body.projectId))) {
    Project.findOne({
      _id: projectId
    }, (err, project) => {
      teammates.forEach(teammate => {
        project.teammates.push({status: false, user_id: teammate});
        project.save();
      });
    });
    User.find({
      _id: {
        $in: teammates
      }
    }, (err, users) => {
      users.forEach(user => {
        user.asmember.push({status: false, project_id: projectId});
        user.save();
      });
    });
    res.send('Members added successfully');
  } else {
    res.send('You are not team leader');
  }
});

router.post('/showproject', isLoggedIn, (req, res) => {
  var managing = req.app.locals.managing;
  var asmember = req.app.locals.asmember;
  console.log(asmember)
  Project.findOne({
    _id: req.body.projectId
  }, async (err, project) => {
    var tasks = [];
    var task_user_ids = [];
    project.tasks.forEach(task => {
      task_user_ids.push(task.assigned_to);
    });
    await User.find({
      _id: {
        $in: task_user_ids
      }
    }, (err, taskusers) => {
      if (req.user.managing.includes(req.body.projectId)) {
        project.tasks.forEach(task => {
          taskusers.forEach(user => {
            if (String(user._id) == String(task.assigned_to)) {
              tasks.push({
                _id: task._id,
                task_name: task.task_name,
                task_description: task.task_description,
                assigned_to: task.assigned_to,
                isDone: task.isDone,
                start_time: task.start_time,
                end_time: task.end_time,
                name_of_user: user.FirstName + ' ' + user.LastName
              });
            }
          });
        });
      } else {
        tasks = project.tasks.filter(task => {
          return String(task.assigned_to) == String(req.user._id);
        });
      }
      console.log('Hole', tasks);
      res.render('project_page', {
        project: project,
        managing: managing,
        asmember: asmember,
        tasks: tasks,
        user: req.user
      });
    });
  });
});

// router.get('/viewinvite', isLoggedIn, (req, res) => {
//   var managing = req.app.locals.managing;
//   var asmember = req.app.locals.asmember;
//   console.log('one');
//   var invites = req.user.asmember.filter(invite => {
//     return invite.status == false;
//   });
//   console.log('in the routes');
//   res.json(invites);
//   res.render('invitespage', {invites:invites, user:req.user, asmember:asmember, managing:managing})
// });

router.get('/viewinvite', isLoggedIn, (req, res) => {
  var managing = req.app.locals.managing;
  var asmember = req.app.locals.asmember;
  console.log(req.app.locals.asmember)
  console.log('one');
  var invites = req.user.asmember.filter(invite => {
    return invite.status == false;
  });
  console.log('hi')
  var invitearray = [];
  invites.forEach(i => {
    invitearray.push(String(i.project_id));
  });
console.log(invitearray)
  Project.find({
    _id: {
      $in: invitearray
    }
  }, (err, invitations) => {
    console.log('in the routes');
    console.log(invitations);
    console.log(asmember);
    //res.json(invites);
    res.render('invitespage', {
      invites: invitations,
      user: req.user,
      asmember: asmember,
      managing: managing
    })
  })
});

router.post('/checkinvite', isLoggedIn, (req, res) => {
  var projectId = req.body.projectId;
  var accept = req.body.accept;
  var reject = req.body.reject;
  var user_id = req.user._id;
  // var user_id = req.body.user_id;
  User.findOne({
    _id: user_id
  }, (err, user) => {
    user.asmember.forEach(member => {
      if (String(member.project_id) == projectId) {
        if (accept == 'accept') {
          member.status = true;
        } else if (reject == 'reject') {
          member.status = false;
        }
        user.save();
        req.user = user;
      }
    });
  });
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    project.teammates.forEach(teammate => {
      if (String(user_id) == String(teammate.user_id)) {
        console.log(teammate.user_id);
        if (accept == 'accept') {
          teammate.status = true;
        } else if (reject == 'reject') {
          teammate.status = false;
        }
        project.save();
      }
    });
  });
  res.send('Invite is reviewed');
});

router.post('/submittask', isLoggedIn, uploads.array('uploadedImages', 10), (req, res) => {
  var projectId = req.body.projectId;
  var task_id = req.body.task_id;
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    project.tasks.forEach(task => {
      if (String(task._id) == task_id) {
        if (Date.now() <= task.end_time) {
          task.isDone = 1;
        } else {
          task.isDone = 2;
        }
        if (req.body.review) {
          task.review = req.body.review;
        }
        if (req.files.length != 0) {
          project.uploads.push({uploaded_by: req.user._id, images: req.files, upload_description: req.body.upload_description});
        }
        project.save();
      }
    });
    res.redirect('/dashboard');
  });
});

router.post('/uploadimages', isLoggedIn, uploads.array('uploadedImages', 10), (req, res) => {
  var projectId = req.body.projectId;
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    if (req.files.length != 0) {
      project.uploads.push({uploaded_by: req.user._id, images: req.files, upload_description: req.body.upload_description});
    }
    project.save();
  });
  res.redirect('/dashboard');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect('/');
}

module.exports = router;
