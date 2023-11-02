const tourControllers = require('./../controllers/tourControllers');
const express = require('express');

const router = express.Router();

// router.param('id', tourControllers.checkId);
router
  .route('/top-5-cheap')
  .get(
    tourControllers.topFiveCheapestTourMiddlware,
    tourControllers.getAllTours
  );
router.route('/Tour-Statistics').get(tourControllers.getTourStatistics);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(tourControllers.createTour);

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(tourControllers.updateTour)
  .delete(tourControllers.deleteTour);

module.exports = router;
