const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email), (this.from = '"Unish Rai" <kirantunish@gmail.com>');
    (this.url = url), (this.firstName = user.name.split(' ')[0]);
  }

  //1) Create A transporter
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    console.log('hello from nodimaile Email');
    //1) Create A transporter
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_EMAIL_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  async send(templates, subject) {
    //1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${templates}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // console.log('user:', this.email);
    console.log('To:', this.to);
    // const text = htmlToText.fromString(html); //htmlToText

    //2) Define the email options
    const mailOptions = {
      from: this.from, // sender address
      to: this.to, // list of receivers
      subject: subject, // Subject line
      // plain text body
      html: html,
      // text: text, // html body
    };

    //create a transport and send email
    await this.newTransport().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natour Family !');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your Reste Password (Expires in 10 minutes) !'
    );
  }
};

// const sendEmail = async (options) => {
//   console.log('hello from nodimaile Email');
//   //1) Create A transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.MAILTRAP_HOST,
//     port: process.env.MAILTRAP_EMAIL_PORT,
//     auth: {
//       user: process.env.MAILTRAP_USERNAME,
//       pass: process.env.MAILTRAP_PASSWORD,
//     },
//   });

//   //2) Define the email options
//   const emailOptions = {
//     from: '"Unish Rai" <kirantunish@gmail.com>', // sender address
//     to: options.email, // list of receivers
//     subject: options.subject, // Subject line
//     text: options.message, // plain text body
//     // html: `<p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`, // html body
//   };

//   //3) Actually send the email
//   transporter.sendMail(emailOptions, (error, info) => {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// };

// module.exports = sendEmail;
