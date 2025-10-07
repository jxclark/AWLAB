import { Router } from 'express';
import multer from 'multer';
import * as fileController from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// All file routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/files/folders
 * @desc    Get all folders
 * @access  Private
 */
router.get('/folders', fileController.getFolders);

/**
 * @route   GET /api/files/folders/:folderName
 * @desc    Get files in a folder
 * @access  Private
 */
router.get('/folders/:folderName', fileController.getFilesInFolder);

/**
 * @route   GET /api/files/download/:folderName/:fileName
 * @desc    Download a file
 * @access  Private
 */
router.get('/download/:folderName/:fileName', fileController.downloadFile);

/**
 * @route   GET /api/files/search
 * @desc    Search files
 * @access  Private
 */
router.get('/search', fileController.searchFiles);

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file
 * @access  Private (Admin+)
 */
router.post('/upload', requireAdmin, upload.single('file'), fileController.uploadFile);

/**
 * @route   DELETE /api/files/:folderName/:fileName
 * @desc    Delete a file
 * @access  Private (Admin+)
 */
router.delete('/:folderName/:fileName', requireAdmin, fileController.deleteFile);

export default router;
