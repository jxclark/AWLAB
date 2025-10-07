import fs from 'fs/promises';
import path from 'path';
import { stat } from 'fs/promises';

// Network share path
const BASE_PATH = process.env.FILES_BASE_PATH!;

export interface FileInfo {
  name: string;
  size: number;
  modifiedDate: Date;
  type: 'file' | 'folder';
  path: string;
}

export interface FolderInfo {
  name: string;
  modifiedDate: Date;
  fileCount: number;
}

/**
 * Get all date folders from the network share
 */
export const getFolders = async (): Promise<FolderInfo[]> => {
  try {
    const entries = await fs.readdir(BASE_PATH, { withFileTypes: true });
    
    const folders = await Promise.all(
      entries
        .filter(entry => entry.isDirectory())
        .map(async (entry) => {
          const folderPath = path.join(BASE_PATH, entry.name);
          const stats = await stat(folderPath);
          
          // Count PDF files in folder
          const files = await fs.readdir(folderPath);
          const pdfCount = files.filter(f => f.toLowerCase().endsWith('.pdf')).length;
          
          return {
            name: entry.name,
            modifiedDate: stats.mtime,
            fileCount: pdfCount,
          };
        })
    );

    // Sort by date (newest first)
    return folders.sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime());
  } catch (error: any) {
    console.error('Error reading folders:', error);
    throw new Error(`Failed to read folders: ${error.message}`);
  }
};

/**
 * Get all PDF files in a specific folder
 */
export const getFilesInFolder = async (folderName: string): Promise<FileInfo[]> => {
  try {
    const folderPath = path.join(BASE_PATH, folderName);
    
    // Check if folder exists
    try {
      await stat(folderPath);
    } catch {
      throw new Error('Folder not found');
    }

    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
        .map(async (entry) => {
          const filePath = path.join(folderPath, entry.name);
          const stats = await stat(filePath);
          
          return {
            name: entry.name,
            size: stats.size,
            modifiedDate: stats.mtime,
            type: 'file' as const,
            path: `${folderName}/${entry.name}`,
          };
        })
    );

    // Sort by name
    return files.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error: any) {
    console.error('Error reading files:', error);
    throw new Error(`Failed to read files: ${error.message}`);
  }
};

/**
 * Get file path for download
 */
export const getFilePath = async (folderName: string, fileName: string): Promise<string> => {
  const filePath = path.join(BASE_PATH, folderName, fileName);
  
  // Verify file exists
  try {
    await stat(filePath);
  } catch {
    throw new Error('File not found');
  }

  return filePath;
};

/**
 * Upload a file (admin only)
 */
export const uploadFile = async (
  folderName: string,
  fileName: string,
  fileBuffer: Buffer
): Promise<void> => {
  try {
    const folderPath = path.join(BASE_PATH, folderName);
    
    // Create folder if it doesn't exist
    try {
      await fs.mkdir(folderPath, { recursive: true });
    } catch (error) {
      // Folder might already exist
    }

    const filePath = path.join(folderPath, fileName);
    await fs.writeFile(filePath, fileBuffer);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete a file (admin only)
 */
export const deleteFile = async (folderName: string, fileName: string): Promise<void> => {
  try {
    const filePath = path.join(BASE_PATH, folderName, fileName);
    
    // Verify file exists
    try {
      await stat(filePath);
    } catch {
      throw new Error('File not found');
    }

    await fs.unlink(filePath);
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Search files across all folders
 */
export const searchFiles = async (query: string): Promise<FileInfo[]> => {
  try {
    const folders = await getFolders();
    const allFiles: FileInfo[] = [];

    for (const folder of folders) {
      const files = await getFilesInFolder(folder.name);
      const matchingFiles = files.filter(file =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      allFiles.push(...matchingFiles);
    }

    return allFiles;
  } catch (error: any) {
    console.error('Error searching files:', error);
    throw new Error(`Failed to search files: ${error.message}`);
  }
};
