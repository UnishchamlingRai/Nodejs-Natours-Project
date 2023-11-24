const tourControllers = require('./../controllers/tourControllers');
const express = require('express');
const router = express.Router();
const authControllers = require('./../controllers/authControllers');

const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');
// router.param('id', tourControllers.checkId);
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(
    tourControllers.topFiveCheapestTourMiddlware,
    tourControllers.getAllTours
  );
router.route('/Tour-Statistics').get(tourControllers.getTourStatistics);
router
  .route('/monthly-plan/:year')
  .get(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan
  );

router
  .route('/')
  .get( tourControllers.getAllTours)
  .post(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour
  );

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour
  )
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.toursWithIn);

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);
///tours-within/:distance/center/:latlan/unit/:

// router
//   .route('/:tourId/reviews')
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo('user'),
//     reviewController.createReview
//   );
// /tour/456878/review
// /tour/456878/review/78787876

module.exports = router;
//router.use('/:tourId/reviews',reviewRouter)
