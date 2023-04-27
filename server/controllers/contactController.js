const catchAsync = require('../utils/catchErrors');

const nodemailer = require('nodemailer');

exports.submitQuestion = catchAsync(async (req, res, next) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: req.body.email, // sender address
      to: 'vladomkd@gmail.com', // list of receivers
      subject: `Excessive - ${req.body.type}`, // Subject line
      // text: req.body.question, // plain text body
      html: `<p><b>Sender:</b> ${req.body.name}</p>
    <p><b>Question:</b> ${req.body.question}</p>`, // html body
    });

    console.log('Message sent: %s', info.messageId);

    res.status(200).json({
      status: 'success',
      message: 'Your message has been successfully sent!',
    });
  } catch (err) {
    console.log(err);
  }

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  //   console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
});
