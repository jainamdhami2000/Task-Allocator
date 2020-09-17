//jshint esversion:6

const mongoose = require('mongoose');
const findOrCreate = require ('mongoose-findorcreate');
const bcrypt = require('bcrypt-nodejs');
const userSchema = new mongoose.Schema({
  username:{
    type:String,
    //required:true
  },

  emailId:{
    type:String,
    //required:true
  },

  password:{
    type:String,
    //required:true
  }
});

userSchema.plugin(findOrCreate);

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
