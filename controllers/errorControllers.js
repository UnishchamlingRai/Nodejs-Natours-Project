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

  return new AppError(message, 404);
};

const haldelJWTError = () => {
  return new AppError('Invalid Token ! Please Log in Again', 401);
};
const haldelJWTExpiresError = () => {
  return new AppError('Your Token has Expired! please Log in Again', 401);
};

const sendErrorForDevlopment = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).render('error', {
    title: 'Error something went wrong',
    msg: err.message,
  });
};

const sendErrorForProduction = (err, req, res) => {
  //Operational Error
  if (err.isOperational) {
    // console.log(err);
    //API
    if (req.originalUrl.startsWith('/api')) {
      console.log('ERROR:', err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // RENDER
    return res.status(err.statusCode).render('error', {
      title: 'Error something went wrong',
      msg: err.message,
    });
  }

  //1) Log error
  // API
  if (req.originalUrl.startsWith('/api')) {
    console.log('ERROR:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went Very wrong!',
    });
  }
  //RENDER
  return res.status(err.statusCode).render('error', {
    title: 'Error something went wrong',
    msg: 'SOMETHING WENT WORNG PLEASE TRY AGAIN LEATER !',
  });
};

///Global Error Handler// catch All Errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // let error = { ...err };
    // console.log('error.name:', err.name);
    sendErrorForDevlopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('Pro:', err.message);
    let error = { ...err };
    error.message = err.message;
    // console.log('next:', error.message);

    if (err.name === 'CastError') {
      error = handelCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handelDuplicateErrorDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handelValidationErrorDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = haldelJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = haldelJWTExpiresError();
    }

    sendErrorForProduction(error, req, res);
  }
};
