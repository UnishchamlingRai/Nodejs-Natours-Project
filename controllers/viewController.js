const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsyncError');
const AppError = require('./../utils/AppError');

exports.getOverview = catchAsync(async (req, res) => {
  //1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template
  //3) Render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)
  console.log(req.params);
  const tour = await Tour.findById(req.params.id).populate({ path: 'reviews' });
  if (!tour) {
    return next(new AppError('There is no Tour with that ID:', 404));
  }
  //   console.log(tour);
  //2) Build template
  //3) Render template using data from 1
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour: tour,
  });
});

exports.login = (req, res) => {
  // const user=
  res.status(200).render('login', {
    title: 'login',
  });
};

exports.myAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My Account',
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  console.log('body Data:', req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'My Account',
    user: updatedUser,
  });
});

exports.myBookingTours = catchAsync(async (req, res, next) => {
  console.log('userId:', req.user._id);
  const bookings = await Booking.find({ user: req.user._id });
  console.log('booking:', bookings);
  const toursId = bookings.map((el) => el.tour);
  console.log('TourId:', toursId);
  const tours = await Tour.find({ _id: { $in: toursId } });
  res.status(200).render('overview', {
    title: 'My Booking Tours',
    tours: tours,
  });
});
