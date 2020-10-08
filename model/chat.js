//jshint esversion:6

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const chatSchema = new mongoose.Schema({
  name: String,
  message: String,
  project: mongoose.Schema.ObjectId
});

module.exports = mongoose.model("Chat", chatSchema);
