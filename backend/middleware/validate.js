export const validate = (requiredFields = []) => (req, res, next) => {
  const missing = requiredFields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return res.status(422).json({
      message: 'Validation failed.',
      missingFields: missing
    });
  }

  return next();
};
