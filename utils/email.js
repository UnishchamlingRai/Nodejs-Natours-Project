const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('hello from nodimaile Email');
  //1) Create A transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_EMAIL_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  //2) Define the email options
  const emailOptions = {
    from: '"Unish Rai" <kirantunish@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: `<p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`, // html body
  };

  //3) Actually send the email
  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendEmail;
