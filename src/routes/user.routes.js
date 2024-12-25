import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import validate from '../middlewares/validate.middleware.js';
import * as userValidation from '../validations/user.validation.js';
import passport from 'passport';

const router = Router();

router
  .route('/')
  .post(
    passport.authenticate('jwt', { session: false }),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(passport.authenticate('jwt', { session: false }), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(passport.authenticate('jwt', { session: false }), validate(userValidation.getUser), userController.getUser)
  .patch(
    passport.authenticate('jwt', { session: false }),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

export default router;
