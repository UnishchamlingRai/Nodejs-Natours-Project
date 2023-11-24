const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //Or const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

const Booking = require('./../models/bookingModel');
const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsyncError');
const AppError = require('../utils/AppError');
const haldlerFactory = require('./handlerFactory');

exports.bookingSessionStorage = catchAsync(async (req, res, next) => {
  console.log(req.params.tourId);
  //1) Get the currency booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tourId=${
      req.params.tourId
    }&price=${tour.price}&user=${req.user._id}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour._id}`,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, // Multiply by 100 to convert to cents
        },
        quantity: 1,
      },
    ],
  });

  //Create a session as response
  res.status(200).json({
    status: 'Success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  console.log('hello Booking...');
  // This is only TEMPORARY, because it is UNSECURE: everyone can make booking without paying
  if (!req.query.tourId && !req.query.price && !req.query.user) {
    return next();
  }
  const bookingTour = await Booking.create({
    tour: req.query.tourId,
    user: req.query.user,
    price: req.query.price,
  });
  console.log(bookingTour);
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = haldlerFactory.getAll(Booking);
exports.getOneBooking = haldlerFactory.getOne(Booking);
exports.updateBooking = haldlerFactory.updatedOne(Booking);
exports.deleteBooking = haldlerFactory.deleteOne(Booking);
exports.createBooking = haldlerFactory.createOne(Booking);
