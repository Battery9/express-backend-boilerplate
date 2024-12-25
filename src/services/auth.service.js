import * as tokenService from './token.service.js';
import * as userService from './user.service.js';
import { Token } from '../models/token.model.js';
import { ApiError } from '../utils/responseHandler.js';
import tokenTypes from '../config/tokens.js';
import { User } from '../models/user.model.js';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
export const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  user.password = undefined;
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(404, 'Not found');
  }
  await Token.findByIdAndDelete(refreshTokenDoc._id);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(401, 'Token refresh failed! Please login again.', error);
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
export const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await User.findById(resetPasswordTokenDoc.user).select('+password');
    if (!user) {
      throw new ApiError(400, 'Token is invalid');
    }
    user.password = newPassword;
    user.markModified('password');
    await user.save();
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    if (error.message === 'Token not found') {
      throw new ApiError(400, 'Invalid token', [
        {
          source: 'query',
          field: 'token',
          message: 'Invalid Password Reset token.',
        },
      ]);
    }
    throw new ApiError(401, 'Password reset failed', error?.message);
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
export const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user._id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(401, 'Email verification failed');
  }
};
