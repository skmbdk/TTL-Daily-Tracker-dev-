import logger from '../config/logger.js';

export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userId = req.user?.user_id || req.user?.id || 'anonymous';
    const statusCode = res.statusCode;

    const message = `[HTTP] ${req.method} ${req.originalUrl || req.url} - Status: ${statusCode} - Duration: ${duration}ms - IP: ${ip} - User: ${userId}`;

    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

export default loggerMiddleware;
