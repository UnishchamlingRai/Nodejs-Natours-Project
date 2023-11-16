const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
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
      set: (val) => Math.round(val * 10) / 10, //4.6666, 46.666,  47, 4.7
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      //GeoJSON
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slugName: 1 });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
//Virtural Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLWARE: run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slugName = slugify(this.name, { lower: true });
  next();
});

//005 Modelling Tour Guides Embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => {
//     // console.log('Id:', id);
//     return await User.findById(id);
//   });
//   // console.log('userPromise:', guidesPromise);
//   this.guides = await Promise.all(guidesPromise);
//   // console.log('guides All:', this.guides);
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
//to populate the reference user or guide or data
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`The Query take ${Date.now() - this.start}`);
  // console.log(docs);
  next();
});

//AGGREATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   console.log(this.pipeline()[0]);

//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
