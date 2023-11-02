const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
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
app.listen(port, () => {
  console.log(`Listing Port:${port}`);
});
