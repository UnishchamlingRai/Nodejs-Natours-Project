const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');

exports.topFiveCheapestTourMiddlware = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty,duration';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filtering()
      .sort()
      .fieldsLimit()
      .pagination();

    // console.log('Features:', features);
    const tourDetails = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      total: tourDetails.length,
      data: {
        tours: tourDetails,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fails',
      errorMsg: error,
    });
  }
};

exports.getTour = async (req, res) => {
  // const id = req.params.id * 1;
  // const tour = tourDetails.find((tour) => tour.id === id);

  try {
    const tour = await Tour.findById(req.params.id); //Tour.findOne({_id:req.params.id})
    res.status(200).json({
      status: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(200).json({
      status: 'Fails',
      errorMsg: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour=new Tour({})
    // Tour.save()
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        tourDetails: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fails',
      errorMsg: error,
    });
  }

  // console.log(req.body);

  // const newId = tourDetails.length - 1 + 1;
  // const newtour = Object.assign(req.body, { id: newId });
  // tourDetails.push(newtour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tourDetails),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'Success',
  //       data: {
  //         tourDetails: newtour,
  //       },
  //     });
  //   }
  // );
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      stattus: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      stattus: 'Fails',
      data: {
        tour: error,
      },
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Success',
      DeletedTour: tour,
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fails',
      errorMsg: error,
    });
  }
};

exports.getTourStatistics = async (req, res) => {
  try {
    const tourStatistic = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numOfTours: { $sum: 1 },
          numOfRatings: { $sum: '$ratingsQuantity' },
          avgPrice: { $avg: '$price' },
          avgRatings: { $avg: '$ratingsAverage' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { numOfTours: 1 },
      },
      // { $match: { _id: { $ne: 'EASY' } } },
    ]);
    console.log('hello');

    res.status(200).json({
      stattus: 'Success',
      data: {
        statistic: tourStatistic,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fails',
      errorMsg: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log('year: ', year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStart: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStart: -1 },
      },
      {
        $limit: 6,
      },
    ]);
    res.status(200).json({
      stattus: 'Success',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fails',
      errorMsg: error,
    });
  }
};
