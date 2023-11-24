const express = require('express');

const bookingController = require('./../controllers/bookingController');
const authControllers = require('./../controllers/authControllers');
const router = express.Router();
router.use(authControllers.protect);
router.get(
  '/checkout-session/:tourId',
  authControllers.protect,
  bookingController.bookingSessionStorage
);

router.use(authControllers.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
