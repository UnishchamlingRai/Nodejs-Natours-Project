const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Enter Valid Email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Your Password'],
    validate: {
      //this only work on create or on save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not Same',
    },
  },
});

userSchema.pre('save', function (next) {
  //only this function is run when password is modified
  if (!this.isModified('password')) return next();
  this.password = next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
