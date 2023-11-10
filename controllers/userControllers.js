const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsyncError');
const AppError = require('../utils/AppError');

const filterField = (obj, ...updateFields) => {
  let newObject = {};

  Object.keys(obj).forEach((el) => {
    if (updateFields.includes(el)) {
      newObject[el] = obj[el]; //newObject['email']=obj['email'] #={email:"example@gmail.com"}
    }
  });
  // console.log('new Obj:', newObject);
  return newObject;
};
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    total: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Create error if user POSTs password update data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'YOu cannot change password with this routes! please use /updateMypassword routes to Update your Password'
      )
    );
  }
  //2)Filtered out unwanted fields names that are not allowed to be updated
  const filteredFields = filterField(req.body, 'name', 'email');
  //3)Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredFields,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: 'Success',
    data: null,
  });
});

exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This routes is not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This routes is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This routes is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This routes is not yet defined',
  });
};
