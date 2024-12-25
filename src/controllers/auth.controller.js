import expressAsyncHandler from 'express-async-handler';
import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import * as tokenService from '../services/token.service.js';
import * as emailService from '../services/email.service.js';
import { ApiError, ApiResponse } from '../utils/responseHandler.js';

export const register = expressAsyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  user.password = undefined;
  return new ApiResponse(201, { user, tokens }, 'User registered successfully.').send(res);
});

export const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  return new ApiResponse(200, { user, tokens }, 'User logged in successfully.').send(res);
});

export const logout = expressAsyncHandler(async (req, res) => {
  if (!req.body.refreshToken) {
    return new ApiResponse(400, null, 'Refresh token is required').send(res);
  }
  await authService.logout(req.body.refreshToken);
  return new ApiResponse(200, null, 'User logged out successfully.').send(res);
});

export const refreshTokens = expressAsyncHandler(async (req, res) => {
  if (!req.body.refreshToken) {
    return new ApiError(400, 'Refresh token is required', {
      feild: 'refreshToken',
      message: 'Refresh token is required',
    }).send(res);
  }
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  return new ApiResponse(200, tokens, 'Tokens refreshed successfully').send(res);
});

export const forgotPassword = expressAsyncHandler(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  return new ApiResponse(201, null, 'Reset password token genarated').send(res);
});

export const resetPassword = expressAsyncHandler(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  return new ApiResponse(200, null, 'Password reset successfully').send(res);
});

export const sendVerificationEmail = expressAsyncHandler(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  return new ApiResponse(200, null, 'Verification Mail Sent.').send(res);
});

export const verifyEmail = expressAsyncHandler(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  return new ApiResponse(200, null, 'Email Verified').send(res);
});
