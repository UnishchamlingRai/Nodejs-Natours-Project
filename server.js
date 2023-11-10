const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaughtException Shuting down..........');
  process.exit(1);
});

const app = require('./app');
const mongoose = require('mongoose');

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

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listing Port:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled Rejection Shuting down..........');
  server.close(() => {
    process.exit(1);
  });
});
