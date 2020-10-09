//jshint esversion:6

require("dotenv").config();
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
const chat = require('./routes/chat');
const path = require('path');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(path.join(__dirname, 'public')));

var Chat = require('./model/chat');
var dbUrl = process.env.ATLAS_URL;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/chat/:project_id', (req, res) => {
  console.log(req.params.project_id);
  Chat.find({
    project_id: req.params.project_id
  }, (err, messages) => {
    res.send(messages);
  });
});

app.get('/messages/:user', (req, res) => {
  var user = req.params.user;
  Message.find({
    name: user
  }, (err, messages) => {
    res.send(messages);
  });
});

app.post('/messages/:type_of_ministry', async (req, res) => {
  console.log(typeof(req.params.type_of_ministry));
  try {
    var newmessage = new Message();
    newmessage.name = req.body.name;
    newmessage.message = req.body.message;
    newmessage.type_of_ministry = req.params.type_of_ministry;

    var savedMessage = await newmessage.save();
    console.log('saved');

    var censored = await Message.findOne({
      message: 'badword'
    });
    if (censored)
      await Message.remove({
        _id: censored.id
      });
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  } finally {
    console.log('Message Posted');
  }
});
const chatrooms = require('./routes/chatrooms');
app.use('/chatrooms', chatrooms);
app.use('/chat', chat);
io.on('connection', () => {
  console.log('a user is connected');
});

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  promiseLibrary: global.Promise
}, (err) => {
  console.log('mongodb connected', err);
});

var server = http.listen(3001, () => {
  console.log('server is running on port', server.address().port);
});
