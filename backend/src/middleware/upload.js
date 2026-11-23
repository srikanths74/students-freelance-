import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// Dangerous extensions that must never be uploaded (executables, scripts, HTML for XSS prevention)
const dangerousExtensions = [
  '.exe', '.bat', '.cmd', '.sh', '.msi', '.vbs', '.ps1',
  '.html', '.htm', '.xhtml', '.php', '.phtml', '.shtml', '.cgi', '.pl', '.jsp', '.asp', '.aspx', '.htaccess'
];

// Allow all safe standard file extensions for student work (PDF, DOCX, Code, Media, Archives, Design)
const allowedExtensions = [
  // Documents & Resumes
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.csv',
  // Images & Design
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.fig', '.psd', '.ai', '.xd',
  // Archives & Projects
  '.zip', '.rar', '.7z', '.tar', '.gz',
  // Code (Non-executing static formats)
  '.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.java', '.cpp', '.c', '.cs', '.sql',
  // Audio & Video
  '.mp4', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.ogg'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Explicit block for dangerous and script extensions
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error(`Security Alert: File type ${ext} is strictly prohibited to prevent script execution.`));
  }

  // Allow standard safe extensions
  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  }

  return cb(new Error(`File extension ${ext} is not supported. Please upload standard project documents or archives.`));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB max limit
  }
});
