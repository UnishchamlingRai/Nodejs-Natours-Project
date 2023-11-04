const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsyncError');
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  res.status(201).json({
    status: 'Success',
    data: {
      user: newUser,
    },
  });
});
