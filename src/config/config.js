import 'dotenv/config';
import * as yup from 'yup';

// Define environment variable validation schema using yup
const envVarsSchema = yup.object({
  NODE_ENV: yup.string().oneOf(['production', 'development', 'test']).required(),
  PORT: yup.number().default(3000),
  MONGODB_URL: yup.string().required('MongoDB URL is required'),
  JWT_SECRET: yup.string().required('JWT secret key is required'),
  JWT_ACCESS_EXPIRATION: yup.string().default('30m'),
  JWT_REFRESH_EXPIRATION: yup.string().default('30d'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: yup.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: yup.number().default(10),
  SMTP_HOST: yup.string().nullable(),
  SMTP_PORT: yup.number().nullable(),
  SMTP_USERNAME: yup.string().nullable(),
  SMTP_PASSWORD: yup.string().nullable(),
  EMAIL_FROM: yup.string().nullable(),
});

// Validate environment variables
const validateEnv = (schema, env) => {
  try {
    return schema.validateSync(env, { abortEarly: false });
  } catch (error) {
    const errorMessages = error.errors.join(', ');
    throw new Error(`Config validation error: ${errorMessages}`);
  }
};

// Parse and validate environment variables
const envVars = validateEnv(envVarsSchema, process.env);

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: `${envVars.MONGODB_URL}${envVars.NODE_ENV === 'test' ? '-test' : ''}`,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};

export default config;
