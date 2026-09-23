import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';

const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

export const uploadAttachmentMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

export default uploadAttachmentMiddleware;
