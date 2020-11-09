//jshint esversion:8

require("dotenv").config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../model/user');
const Project = require('../model/project');
const jwt = require('jwt-simple');
const mail = require('../utils/mailer');

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
    res.redirect('/dashboard');
  });
});

router.post('/createtask', isLoggedIn, (req, res) => {
  if (req.user.managing.includes(String(req.body.projectId))) {
    Project.findOne({
      _id: req.body.projectId
    }, (err, project) => {
      project.tasks.push({
        task_name: req.body.task_name,
        task_description: req.body.task_description,
        assigned_to: req.body.user_id,
        isDone: 0,
        start_time: Date.now(),
        end_time: req.body.end_time
      });
      var secret = process.env.email_secret;
      //checking for existing mail in database
      User.findOne({
        _id: req.body.user_id
      }, function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result == null) {
          res.send('Email not found');
        } else {
          const emailAddress = result.Email;
          let content = `Hello ${result.FirstName} ${result.LastName}!
          You have been assigned a task in ${project.project_name}.
          The Details of the task are as follows:-
              Task Name: ${req.body.task_name},
              Task Description: ${req.body.task_description},
              Assigned: Today,
              Due date: ${req.body.end_time}`
          mail(emailAddress, 'Task Assignment', content);
        }
      });
      project.save();
      res.redirect('/dashboard')
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
    res.redirect('/dashboard');
  } else {
    res.send('You are not team leader');
  }
});

router.post('/showproject', isLoggedIn, (req, res) => {
  var managing = req.app.locals.managing;
  var asmember = req.app.locals.asmember;
  console.log("inside showproject");
  Project.findOne({
    _id: req.body.projectId
  }, async (err, project) => {
    var tasks = [];
    var task_user_ids = [];
    var members=[];
    var members_ids=[];
    var lead;
    project.tasks.forEach(task => {
      task_user_ids.push(task.assigned_to);
    });
    project.teammates.forEach(teammate=>{
      members_ids.push(teammate.user_id);
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
      var pendingtasks = tasks.filter(pending => {
        return pending.isDone == 0
      })
      console.log("leader:"+project.leader);
      User.findOne({_id:project.leader}, (err,leader)=>{
        lead=leader.FirstName+" "+leader.LastName;
        console.log("leader found="+leader);
        console.log("inside leader find");
      });
      console.log(lead);
      User.find({
        _id:{
          $in: members_ids
        }
      },(err,membersList)=>{
        console.log("inside member find");
        membersList.forEach(member=>{
          members.push({
            name: member.FirstName+" "+member.LastName
          })
          console.log("members="+member);
        })
      });

      res.render('project_page', {
        lead:lead,
        members:members,
        project: project,
        pendingtasks: pendingtasks,
        managing: managing,
        asmember: asmember,
        tasks: tasks,
        user: req.user
      });
    });
  });
});

router.get('/viewinvite', isLoggedIn, (req, res) => {
  var managing = req.app.locals.managing;
  var asmember = req.app.locals.asmember;
  var invites = req.user.asmember.filter(invite => {
    return invite.status == false;
  });
  var invitearray = [];
  invites.forEach(i => {
    invitearray.push(String(i.project_id));
  });
  Project.find({
    _id: {
      $in: invitearray
    }
  }, (err, invitations) => {
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
  var opt = req.body.opt;
  var user_id = req.user._id;
  // var user_id = req.body.user_id;
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    project.teammates.forEach(teammate => {
      if (String(user_id) == String(teammate.user_id)) {
        if (opt == 'accept') {
          teammate.status = true;
        } else if (opt == 'reject') {
          var afterrejected;
          afterrejected = project.teammates.filter(m => {
            return String(teammate._id) != String(m._id)
          });
          project.teammates = afterrejected;
        }
        project.save();
      }
    });
    User.findOne({
      _id: user_id
    }, (err, user) => {
      user.asmember.forEach((member) => {
        if (String(member.project_id) == projectId) {
          if (opt == 'accept') {
            member.status = true;
          } else if (opt == 'reject') {
            var afterrejected;
            afterrejected = user.asmember.filter(m => {
              return String(member._id) != String(m._id)
            });
            user.asmember = afterrejected;
          }
          user.save();
          req.user = user;
        }
      });
      res.redirect('/dashboard');
    });
  });
});

router.post('/submittask', isLoggedIn, uploads.array('uploadedImages', 10), (req, res) => {
  var projectId = req.body.projectId;
  var task_id = req.body.task_id;
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    project.tasks.forEach(task => {
      if (String(task._id) == task_id) {
        if (Date.now() <= Date.parse(task.end_time)) {
          task.isDone = 1;
        } else {
          task.isDone = 2;
        }
        if (req.body.review) {
          task.review = req.body.review;
        }
        if (req.files.length != 0) {
          project.uploads.push({
            uploaded_by: req.user.FirstName + ' ' + req.user.LastName,
            images: req.files,
            upload_description: req.body.upload_description
          });
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
      project.uploads.push({
        uploaded_by: req.user.FirstName + ' ' + req.user.LastName,
        images: req.files,
        upload_description: req.body.upload_description
      });
    }
    project.save();
  });
  res.redirect('/dashboard');
});

router.post('/viewuploads', isLoggedIn, (req, res) => {
  var projectId = req.body.projectId;
  var managing = req.app.locals.managing;
  var asmember = req.app.locals.asmember;
  Project.findOne({
    _id: projectId
  }, (err, project) => {
    res.render('uploads', {
      project: project,
      user: req.user,
      asmember: asmember,
      managing: managing
    })
  });
});

router.post('/randomassignment', (req, res) => {
  console.log(req.body.projectId);
  console.log(req.body.assigntasks);
  if (req.user.managing.includes(String(req.body.projectId))) {
    Project.findOne({
      _id: req.body.projectId
    }, (err, project) => {
      req.body.assigntasks.forEach(assignedtask => {
        var useridarray = []
        project.teammates.forEach(mate => {
          useridarray.push(String(mate.user_id))
        })
        useridarray.push(String(project.leader))
        project.tasks.forEach(task => {
          if (task.isDone == 0)
            useridarray.push(String(task.assigned_to));
          }
        );
        function Counter(array) {
          var count = {};
          array.forEach(val => count[val] = (count[val] || 0) + 1);
          return count;
        }
        a = Counter(useridarray);
        var min = Object.keys(a)[0]
        for (var key in a) {
          if (a[min] > a[key]) {
            min = key
          }
        }
        project.tasks.push({
          task_name: assignedtask.task_name,
          task_description: assignedtask.task_description,
          assigned_to: min,
          isDone: 0,
          start_time: Date.now(),
          end_time: assignedtask.end_time
        });
        var secret = process.env.email_secret;
        //checking for existing mail in database
        User.findOne({
          _id: min
        }, function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result == null) {
            res.send('Email not found');
          } else {
            const emailAddress = result.Email;
            let content = `Hello ${result.FirstName} ${result.LastName}!
          You have been assigned a task in ${project.project_name}.
          The Details of the task are as follows:-
              Task Name: ${assignedtask.task_name},
              Task Description: ${assignedtask.task_description},
              Assigned: Today,
              Due date: ${assignedtask.end_time}`
            mail(emailAddress, 'Task Assignment', content);
          }
        });

      });
      project.save();
      res.redirect('/dashboard');
    });
  } else {
    res.send('You are not team leader');
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    req.isLogged = true;
    return next();
  }
  res.redirect('/');
}

module.exports = router;
