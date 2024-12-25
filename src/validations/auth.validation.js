import yup from 'yup';

export const register = {
  body: yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required().min(4).max(20),
    name: yup.string().required(),
  }),
};

export const login = {
  body: yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
  }),
};

export const forgotPassword = {
  body: yup.object().shape({
    email: yup.string().email().required(),
  }),
};

export const resetPassword = {
  query: yup.object().shape({
    token: yup.string().required(),
  }),
  body: yup.object().shape({
    password: yup.string().required().min(4).max(20),
  }),
};
