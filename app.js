const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();
const tourRouter = require('./Routes/tourRoutes');
const userRoutes = require('./Routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorControllers');

//Development loggin
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  console.log('hello development');
} else if (process.env.NODE_ENV === 'production') {
  console.log('hello production');
}
// 1)GLOBAL MIDDLEWARE

//Set Security HTTP headers
app.use(helmet());
app.use(morgan('dev'));
//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQL query injectoin
app.use(mongoSanitize());
//Data sanitiztion against XSS
app.use(xss());
//prevents parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Test Middleware
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

//2) HANDLING ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3)ROUTES

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

app.use(globalErrorHandler);
//4) START SEREVER
module.exports = app;
