import expressAsyncHandler from 'express-async-handler';
import { ApiResponse, ApiError } from '../utils/responseHandler.js';
import * as userService from '../services/user.service.js';
import pick from '../utils/pick.js';

export const createUser = expressAsyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return new ApiResponse(201, user, 'User Created.').send(res);
});

export const getUsers = expressAsyncHandler(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  return new ApiResponse(200, result, 'User data fetched.').send(res);
});

export const getUser = expressAsyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return new ApiResponse(200, user, 'User fetched.').send(res);
});

export const updateUser = expressAsyncHandler(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  return new ApiResponse(200, user, 'User data updated.').send(res);
});

export const deleteUser = expressAsyncHandler(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  return new ApiResponse(200, null, 'User Deleted.').send(res);
});
