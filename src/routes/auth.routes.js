import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
const router = Router();
import passport from 'passport';
import validate from '../middlewares/validate.middleware.js';
import * as authSchema from '../validations/auth.validation.js';

router.post('/register', validate(authSchema.register), authController.register);
router.post('/login', validate(authSchema.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-tokens', authController.refreshTokens);
router.post('/forgot-password', validate(authSchema.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authSchema.resetPassword), authController.resetPassword);
router.post(
  '/send-verification-email',
  passport.authenticate('jwt', { session: false }),
  authController.sendVerificationEmail
);
router.post('/verify-email', authController.verifyEmail);

export default router;
