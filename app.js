const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
// const multer=require('multer')

const viewRouter = require('./Routes/viewsRoutes');
const tourRouter = require('./Routes/tourRoutes');
const userRoutes = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorControllers');

const app = express();
// const upload=multer({dest:'/public/img/users'})

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://js.stripe.com/; other-directives-here"
  );
  next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Development loggin
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  console.log('hello development');
} else if (process.env.NODE_ENV === 'production') {
  console.log('hello production');
}
// 1)GLOBAL MIDDLEWARE
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(`${__dirname}/public`));
//Set Security HTTP headers
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));
//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
// app.use(bodyParser.urle)

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

//Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);
app.use(compression());
//Test Middleware
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//2) HANDLING ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3)ROUTES

app.use('/', viewRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

app.use(globalErrorHandler);
//4) START SEREVER
module.exports = app;
