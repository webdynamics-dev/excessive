const catchAsync = require('../utils/catchErrors');

const { Newsletter } = require('../models/newsletterModel');

exports.subscribe = catchAsync(async (req, res) => {
  const existingEmail = await Newsletter.findOne({
    email: req.body.email,
  });

  console.log(existingEmail);

  if (!existingEmail) {
    try {
      const newEmail = await Newsletter.create(req.body);

      if (newEmail) {
        // await new Email(undefined, newEmail._id).sendConfirmNewsletter();

        res.status(200).json({
          status: 'success',
          message:
            'Your email has been successfully added to our mailing list.',
        });
      } else {
        res.status(500).json({
          status: 'fail',
          message: 'Something went wrong. Please try again later.',
        });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'Your address is already registered for this newsletter.',
    });
  }
});

exports.unsubscribe = catchAsync(async (req, res) => {
  const removedMail = await Newsletter.findByIdAndDelete(req.params.emailId);

  if (removedMail) {
    res.status(200).render('randommessages', {
      status: 'Success',
      message:
        'Your email has been successfully removed from the newsletter list.',
    });
  } else {
    res.status(400).render('randommessages', {
      status: 'Failed!',
      message:
        'Your email could not be found in the list or you have already unsubscribed.',
    });
  }
});
