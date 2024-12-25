import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { Token } from '../models/token.model.js';
import tokenTypes from '../config/tokens.js';
import ms from 'ms';
import { getUserByEmail } from './user.service.js';
import { ApiError } from '../utils/responseHandler.js';

/**
 * Generate token
 * @param {string} userId - The ID of the user
 * @param {number|string} expiresIn - Token expiration time in seconds or string (e.g., 60, '2 days')
 * @param {string} type - Type of the token (e.g., 'access', 'refresh')
 * @param {string} [secret=config.jwt.secret] - Secret key for signing the token
 * @returns {string} - Signed JWT
 */
export const generateToken = (userId, expiresIn, type, secret = config.jwt.secret) => {
  return jwt.sign({ sub: userId, type }, secret, { expiresIn });
};

/**
 * Save a token
 * @param {string} token - The token to save
 * @param {ObjectId} user - The ID of the user
 * @param {Date} expires - Token expiration date-time
 * @param {string} type - Type of the token (e.g., 'access', 'refresh')
 * @param {boolean} [blacklisted] - Whether the token is blacklisted
 * @returns {Promise<Token>} - The saved token document
 */
export const saveToken = async (token, user, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user,
    expires,
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token - The token to verify
 * @param {string} type - Type of the token (e.g., 'access', 'refresh')
 * @returns {Promise<Token>} - The token document
 */
export const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user - The user object
 * @returns {Promise<Object>} - Object containing the access and refresh tokens
 */
export const generateAuthTokens = async (user) => {
  const accessToken = generateToken(user._id, config.jwt.accessExpiration, tokenTypes.ACCESS);

  const refreshToken = generateToken(user._id, config.jwt.refreshExpiration, tokenTypes.REFRESH);
  await saveToken(refreshToken, user._id, new Date(Date.now() + ms(config.jwt.refreshExpiration)), tokenTypes.REFRESH);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
export const generateResetPasswordToken = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(404, 'No users found with this email');
  }
  const expires = new Date(Date.now() + ms(config.jwt.resetPasswordExpirationMinutes + 'm'));
  const resetPasswordToken = generateToken(
    user._id,
    config.jwt.resetPasswordExpirationMinutes * 60 * 1000,
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(resetPasswordToken, user._id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
export const generateVerifyEmailToken = async (user) => {
  const expires = new Date(Date.now() + ms(config.jwt.verifyEmailExpirationMinutes + 'm'));
  const verifyEmailToken = generateToken(
    user._id,
    config.jwt.resetPasswordExpirationMinutes * 60 * 1000,
    tokenTypes.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
