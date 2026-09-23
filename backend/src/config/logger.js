import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import 'winston-daily-rotate-file';

// Ensure logs directory exists
const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format for readable timestamped text logs
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let metaString = '';
  if (Object.keys(metadata).length > 0) {
    metaString = ` ${JSON.stringify(metadata)}`;
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
});

// Daily Rotate Transport for combined application logs
const dailyAppRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info'
});

// Daily Rotate Transport for error logs only
const dailyErrorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS Z' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    dailyAppRotateTransport,
    dailyErrorRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    })
  ]
});

export default logger;
