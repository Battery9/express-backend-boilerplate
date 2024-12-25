import express from 'express';
import helmet from 'helmet';
import expressSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import { jwtStrategy } from './config/passport.js';
import { authLimiter } from './middlewares/rateLimiter.js';
import { errorConverter, errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/responseHandler.js';

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// set static files
app.use(express.static('public'));

// sanitize request data
app.use(expressSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (config.env === "production") {
//   app.use("/v1/auth", authLimiter);
// }

// API routes
import authRoutes from './routes/auth.routes.js';
app.use('/auth', authRoutes);
import userRoutes from './routes/user.routes.js';
app.use('/user', userRoutes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
