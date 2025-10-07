import { Request, Response } from 'express';
import * as fileService from '../services/file.service';
import fs from 'fs';

/**
 * Get all folders
 * GET /api/files/folders
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const folders = await fileService.getFolders();

    res.status(200).json({
      message: 'Folders retrieved successfully',
      data: folders,
    });
  } catch (error: any) {
    console.error('Get folders error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve folders',
    });
  }
};

/**
 * Get files in a folder
 * GET /api/files/folders/:folderName
 */
export const getFilesInFolder = async (req: Request, res: Response) => {
  try {
    const { folderName } = req.params;
    const files = await fileService.getFilesInFolder(folderName);

    res.status(200).json({
      message: 'Files retrieved successfully',
      data: files,
    });
  } catch (error: any) {
    console.error('Get files error:', error);
    res.status(error.message === 'Folder not found' ? 404 : 500).json({
      error: error.message || 'Failed to retrieve files',
    });
  }
};

/**
 * Download a file
 * GET /api/files/download/:folderName/:fileName
 */
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { folderName, fileName } = req.params;
    const filePath = await fileService.getFilePath(folderName, fileName);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Download file error:', error);
    res.status(error.message === 'File not found' ? 404 : 500).json({
      error: error.message || 'Failed to download file',
    });
  }
};

/**
 * Upload a file (admin only)
 * POST /api/files/upload
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { folderName, fileName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!fileName || !folderName) {
      return res.status(400).json({ error: 'Folder name and file name are required' });
    }

    await fileService.uploadFile(folderName, fileName, file.buffer);

    res.status(201).json({
      message: 'File uploaded successfully',
      data: {
        folderName,
        fileName,
      },
    });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({
      error: error.message || 'Failed to upload file',
    });
  }
};

/**
 * Delete a file (admin only)
 * DELETE /api/files/:folderName/:fileName
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { folderName, fileName } = req.params;
    await fileService.deleteFile(folderName, fileName);

    res.status(200).json({
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(error.message === 'File not found' ? 404 : 500).json({
      error: error.message || 'Failed to delete file',
    });
  }
};

/**
 * Search files
 * GET /api/files/search?q=query
 */
export const searchFiles = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const files = await fileService.searchFiles(query);

    res.status(200).json({
      message: 'Search completed successfully',
      data: files,
    });
  } catch (error: any) {
    console.error('Search files error:', error);
    res.status(500).json({
      error: error.message || 'Failed to search files',
    });
  }
};
