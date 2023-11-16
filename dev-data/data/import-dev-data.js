const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const { argv } = require('process');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log('connection:', con.connection);
    console.log('Connection Successfully');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// console.log(tours);

const importData = async () => {
  try {
    const createdTours = await Tour.create(tours, {
      validateBeforeSave: false,
    });
    const createdUsers = await User.create(users, {
      validateBeforeSave: false,
    });
    const createdReviews = await Review.create(reviews, {
      validateBeforeSave: false,
    });

    console.log('All Data is imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    const deletedTour = await Tour.deleteMany().maxTimeMS(30000);
    const deletedUser = await User.deleteMany().maxTimeMS(30000);
    const deletedReview = await Review.deleteMany().maxTimeMS(30000);

    console.log('All Data is Deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
if (argv[2] === '--importData') {
  importData();
} else if (argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Invalid Command');
}
console.log(argv);
