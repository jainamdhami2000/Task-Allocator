//jshint esversion:6

const mongoose = require('mongoose');
const findOrCreate = require ('mongoose-findorcreate');
const bcrypt = require('bcrypt-nodejs');
const userSchema = new mongoose.Schema({
  local: {
    password: String,
  },
  google: {
    id: String,
    token: String,
  },
  username: String,
  FirstName: String,
  LastName: String,
  image: String,
  Email: String,
  loginType: {
    type: String
  },
  isVerified: {
    default: false,
    type: Boolean
  },
});

userSchema.plugin(findOrCreate);

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
