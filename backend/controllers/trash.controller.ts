import { Request, Response } from 'express';
import * as fileService from '../services/file.service';

/**
 * Get all files in trash
 * GET /api/trash
 */
export const getTrashFiles = async (req: Request, res: Response) => {
  try {
    const files = await fileService.getTrashFiles();

    res.status(200).json({
      message: 'Trash files retrieved successfully',
      data: files,
    });
  } catch (error: any) {
    console.error('Get trash files error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve trash files',
    });
  }
};

/**
 * Restore file from trash
 * POST /api/trash/restore
 */
export const restoreFile = async (req: Request, res: Response) => {
  try {
    const { timestamp, originalFolder, originalFileName } = req.body;

    if (!timestamp || !originalFolder || !originalFileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await fileService.restoreFile(timestamp, originalFolder, originalFileName);

    res.status(200).json({
      message: 'File restored successfully',
    });
  } catch (error: any) {
    console.error('Restore file error:', error);
    res.status(500).json({
      error: error.message || 'Failed to restore file',
    });
  }
};

/**
 * Permanently delete file from trash
 * DELETE /api/trash/:timestamp/:originalFolder/:originalFileName
 */
export const permanentlyDeleteFile = async (req: Request, res: Response) => {
  try {
    const { timestamp, originalFolder, originalFileName } = req.params;

    await fileService.permanentlyDeleteFile(
      parseInt(timestamp),
      originalFolder,
      originalFileName
    );

    res.status(200).json({
      message: 'File permanently deleted',
    });
  } catch (error: any) {
    console.error('Permanently delete file error:', error);
    res.status(500).json({
      error: error.message || 'Failed to permanently delete file',
    });
  }
};
