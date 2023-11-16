const express = require('express');

const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authControllers');

//Protect all the routes After this Middleware
router.use(authController.protect);
router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourIdAndUserId,
    reviewController.createReview
  )
  .get(reviewController.getAllReview);

router
  .route('/:id')
  .get(reviewController.getOneReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
