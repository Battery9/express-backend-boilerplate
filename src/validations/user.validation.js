import yup from 'yup';
import { objectId } from './custom.validation.js';

export const createUser = {
  body: yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required().min(4).max(20),
    name: yup.string().required(),
  }),
};

export const getUsers = {
  query: yup.object().shape({
    name: yup.string(),
    email: yup.string().email(),
    limit: yup.number().integer(),
    page: yup.number().integer(),
  }),
};

export const getUser = {
  params: yup.object().shape({
    userId: yup.string().required().test('is-object-id', 'Invalid User ID', objectId),
  }),
};

export const updateUser = {
  params: yup.object().shape({
    userId: yup.string().required().test('is-object-id', 'Invalid User ID', objectId),
  }),
  body: yup
    .object()
    .shape({
      email: yup.string().email(),
      password: yup.string().min(4).max(20),
      name: yup.string(),
    })
    .required()
    .test('not-empty', 'Body cannot be empty', (value) => {
      return Object.keys(value || {}).length > 0;
    }),
};

export const deleteUser = {
  params: yup.object().shape({
    userId: yup.string().required().test('is-object-id', 'Invalid User ID', objectId),
  }),
};
