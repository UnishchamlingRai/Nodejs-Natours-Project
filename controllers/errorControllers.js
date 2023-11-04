const AppError = require('../utils/AppError');
const handelCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 404);
};

const handelDuplicateErrorDB = (error) => {
  const message = `Duplicate Field Value: (${error.keyValue.name}) . Please use another Value`;
  return new AppError(message, 404);
};

const handelValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  console.log('message:', message);
  return new AppError(message, 404);
};

const sendErrorForDevlopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorForProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //1) Log error
    console.log('ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went Very wrong!',
    });
  }
};

///Global Error Handler// catch All Errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err };
    console.log('error.name:', err.name);
    sendErrorForDevlopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log(err);
    let error = { ...err };

    if (err.name === 'CastError') {
      error = handelCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handelDuplicateErrorDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handelValidationErrorDB(error);
    }

    sendErrorForProduction(error, res);
  }
};
