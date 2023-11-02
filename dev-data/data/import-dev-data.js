const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
// console.log(tours);

const importData = async () => {
  try {
    const createdTours = await Tour.create(tours);
    // console.log(createdTours);
    console.log('All Data is imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    const deletedTour = await Tour.deleteMany();

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
