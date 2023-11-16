const Review = require('../models/reviewModel');
// const AppError = require('../utils/AppError');
// const catchAsync = require('../utils/catchAsyncError');
const haldlerFactory = require('./handlerFactory');

exports.setTourIdAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReview = haldlerFactory.getAll(Review);
exports.getOneReview = haldlerFactory.getOne(Review);
exports.createReview = haldlerFactory.createOne(Review);
exports.deleteReview = haldlerFactory.deleteOne(Review);
exports.updateReview = haldlerFactory.updatedOne(Review);
