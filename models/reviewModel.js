const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
//review / rating /createdAt / ref to tour / ref to user
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review Cannot be Empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 4.5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to User'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // .populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

//for calculating ratingsAverage and ratingsQuantity
reviewSchema.statics.calcAverageRating = async function (tourId) {
  // console.log('Statics This:', this);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
  console.log('Stats:', stats);
};

reviewSchema.post('save', function (doc, next) {
  this.constructor.calcAverageRating(this.tour);
  next();
});

//findbyIdAndUpdate
//findbyIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
