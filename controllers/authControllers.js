const util = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsyncError');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
// const catchAsyncError = require('../utils/catchAsyncError');

const generateJWTToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

const createSendToken = (user, satutsCode, res) => {
  const payload = {
    id: user._id,
    name: user.name,
  };

  const jwtToken = generateJWTToken(payload);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', jwtToken, cookieOption);
  //Remove the password from the output
  // user.password=undefined
  res.status(satutsCode).json({
    status: 'Success',
    token: jwtToken,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  //1) check if email and password exit
  if (!password || !email) {
    return next(new AppError('Please Enter Password or Email', 404));
  }

  const user = await User.findOne({ email }).select('+password');

  //2)check if user exists && password is correct
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Email or Password is Incorrect', 401));
  }

  //3)if everything is ok,sent token to client
  createSendToken(user, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and chek of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not login! Please Login to get Access', 401)
    );
  }
  //2) Verification token
  const verify = util.promisify(jwt.verify);
  const decode = await verify(token, process.env.JWT_SECRET);

  //3) check If user still exitsts
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError('The User blongs to this token no longer Exist', 401)
    );
  }
  //4) Check if user changed password after the token was issued

  if (currentUser.changePasswordAfterTokenIssued(decode.iat)) {
    return next(
      new AppError('The User change Password Recently! Please Login Again', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'you do not have promission to Perform to this Actioin',
          403
        )
      );
    }
    next();
  };
};

//Fordget Password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //Get a User based on Posted email
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('There is no Email Address With this email', 404));
  }

  //Generate the ramdom reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to User email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetUrl}.\n If you didn't forget your password, Please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password rest token (Valid for 10 min)',
      message,
    });
    res.status(200).json({
      satus: 'Success',
      message: 'Token is Created',
    });
  } catch (error) {
    user.forgetPasswordToken = undefined;
    user.expiresDateOfForgetPassword = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There is a Error in Sending the email! Plase Try again later',
        500
      )
    );
  }
});

//Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.id)
    .digest('hex');

  const user = await User.findOne({
    forgetPasswordToken: hashToken,
    expiresDateOfForgetPassword: { $gt: Date.now() },
  });

  //2) if token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Invali Token or Token is Expired', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.forgetPasswordToken = undefined;
  user.expiresDateOfForgetPassword = undefined;
  await user.save();

  //3) update changedPassowrdAt propery for the user

  //4) Log the user in,send Jwt

  createSendToken(user, 201, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //1)Get user from collection

  const user = await User.findById(req.user._id).select('+password');

  //2) check if POSTED current password is correct
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }

  //3) if So, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 201, res);
});
