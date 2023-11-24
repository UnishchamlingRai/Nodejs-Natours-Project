const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsyncError');
const AppError = require('../utils/AppError');
const haldlerFactory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const fileNameAndExtention = `${req.user._id}-${Date.now()}.${
//       file.mimetype.split('/')[1]
//     }`;
//     cb(null, fileNameAndExtention);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a image! Please upload only Images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

//upload photo with multer middleware
exports.uploadUserPhoto = upload.single('photo');

//resizeing Image with sharp middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
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
  if (req.file) {
    filteredFields.photo = req.file.filename;
  }
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
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getAllUsers = haldlerFactory.getAll(User);
exports.getOneUser = haldlerFactory.getOne(User);
exports.updateUser = haldlerFactory.updatedOne(User);
exports.deleteUser = haldlerFactory.deleteOne(User);
