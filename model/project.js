//jshint esversion:6

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const projectSchema = new mongoose.Schema({
  project_name: String,
  leader: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  teammates: {
    type: [mongoose.Types.ObjectId],
    ref: 'User'
  },
  chat_room: {
    type: mongoose.Types.ObjectId,
    ref: 'Chat'
  },
  task: [{
    task_name: String,
    assigned_to: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    isDone: {
      type: Number,
      enum: [0, 1, 2]
    },
    start_time: Date,
    end_time: Date
  }]
});

module.exports = mongoose.model("Project", projectSchema);
