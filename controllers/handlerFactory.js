const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsyncError');
const APIFeatures = require('../utils/APIFeatures');
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'Success',
      DeletedDoc: doc,
    });
  });
};

exports.updatedOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      stattus: 'Success',
      data: {
        data: doc,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'Success',
      data: {
        data: newDoc,
      },
    });
  });
};

exports.getOne = (Model, populateOption) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) {
      query = Model.findById(req.params.id).populate(populateOption);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    //for getting a All Review of Single Tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filtering()
      .sort()
      .fieldsLimit()
      .pagination();

    // console.log('Features:', features);
    const doc = await features.query;
    // const doc = await features.query.explain();

    //SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      total: doc.length,
      data: {
        data: doc,
      },
    });
  });
};
