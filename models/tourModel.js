const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      // validate: [validator.isAlpha, 'Tour Name should only contain String'],
      maxlength: [
        40,
        'A toure name must have less or equal then 40 characters',
      ],
      minlength: [
        10,
        'A toure name must have more or equal then 10 characters',
      ],
    },
    slugName: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Diffulty is either: easy, medium,difficult', //built validaters
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'The Discount price ({VALUE}) should be less than or equall to Price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLWARE: run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slugName = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Calling Doc Middlewar');
//   next();
// });

// //DOCUMENT MIDDLWARE: run after .save() and .create()
// tourSchema.post('save', function (doc, next) {
//   console.log('doc:', doc);
//   next();
// });

//QUERY MDDDLWARE
tourSchema.pre(/^find/, function (next) {
  // console.log(this);
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`The Query take ${Date.now() - this.start}`);
  // console.log(docs);
  next();
});

//AGGREATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
