const express = require('express');
const viewControllers = require('./../controllers/viewController');
const router = express.Router();
const authControllers = require('./../controllers/authControllers');
const bookingControllers = require('./../controllers/bookingController');
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The hiscker in the forest',
//     name: 'unish',
//   });
// });
// router.use(authControllers.isLogin);
router.get(
  '/',
  bookingControllers.createBookingCheckout,
  authControllers.isLogin,
  viewControllers.getOverview
);
router.get('/tours/:id', authControllers.isLogin, viewControllers.getTour);
router.get('/login', authControllers.isLogin, viewControllers.login);
router.get('/me', authControllers.protect, viewControllers.myAccount);
router.get(
  '/my-booking-tours',
  authControllers.protect,
  viewControllers.myBookingTours
);
router.post(
  '/submit-user-data',
  authControllers.protect,
  viewControllers.updateUserData
);

module.exports = router;
