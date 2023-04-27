module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.log(error.message);
      res.status(500).json({
        status: 'fail',
        error: [error.name, error.message],
      });
      next(error);
    });
  };
};
