const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
  role: {
    type: String,
    enum: ['admin', 'user', 'main-guide', 'normal-guide'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    minlength: 8,
    select: false, //it very to import to do not show passwor to client so we should hide it by adding this code
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
  passwordChangeAt: {
    type: Date,
  },
  forgetPasswordToken: String,
  expiresDateOfForgetPassword: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only this function is run when password is modified
  if (!this.isModified('password')) return next();
  //Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});
// update changedPassowrdAt propery for the user
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
//hide the user who Delete the his account or do not show the user which active status is false
//using query Middleware
userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

//Compare passwod if the password is match or not
userSchema.methods.comparePassword = async function (
  catididatePassword,
  userPassword
) {
  return await bcrypt.compare(catididatePassword, userPassword);
};

userSchema.methods.changePasswordAfterTokenIssued = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000, //change the date into millisecond
      10
    );
    // console.log(new Date(JWTTimeStamp * 1000), this.passwordChangeAt);
    return JWTTimeStamp < changeTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  let resetToken = crypto.randomBytes(32).toString('hex');

  this.forgetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.expiresDateOfForgetPassword = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
