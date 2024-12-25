// Custom ObjectId validation function
export const objectId = (value, helpers) => {
  if (!/^[0-9a-fA-F]{24}$/.test(value)) {
    return helpers.message('"{{#label}}" must be a valid Mongo ID');
  }
  return value;
};

// Custom Password validation function
export const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('Password must be at least 8 characters long');
  }
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return helpers.message('Password must contain at least one letter and one number');
  }
  return value;
};
