import pino from 'pino';
import config from './config.js';

const isDevelopment = config.env === 'development';

// Configure Pino with pretty printing in both environments
const logger = pino({
  level: isDevelopment ? 'debug' : 'info', // Log level based on environment
  transport: {
    target: 'pino-pretty', // Use pretty printing in both environments
    options: {
      colorize: true, // Adds colors to logs
      translateTime: 'SYS:standard', // Human-readable timestamps
      ignore: 'pid,hostname', // Ignore pid and hostname for cleaner logs
    },
  },
});

export default logger;
