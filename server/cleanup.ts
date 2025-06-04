import fs from 'fs';
import path from 'path';
import db from './db.js';
import { transformations } from '../shared/schema.js';
import { lt, sql, or, isNull } from 'drizzle-orm';

const RETENTION_DAYS = 60;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Deletes images and database records for transformations older than the retention period
 */
export async function cleanupOldTransformations() {
  try {
    console.log(`Starting cleanup of transformations older than ${RETENTION_DAYS} days...`);
    
    // Calculate the cutoff date (current date minus retention period)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    // Find transformations older than the cutoff date
    const oldTransformations = await db
      .select()
      .from(transformations)
      .where(lt(transformations.createdAt, cutoffDate));
    
    console.log(`Found ${oldTransformations.length} transformations older than ${RETENTION_DAYS} days`);
    
    for (const transformation of oldTransformations) {
      // Delete the original image if it exists
      if (transformation.originalImagePath) {
        const originalImagePath = path.join(process.cwd(), transformation.originalImagePath);
        if (fs.existsSync(originalImagePath)) {
          fs.unlinkSync(originalImagePath);
          console.log(`Deleted original image: ${transformation.originalImagePath}`);
        }
      }
      
      // Delete the transformed image if it exists
      if (transformation.transformedImagePath) {
        const transformedImagePath = path.join(process.cwd(), transformation.transformedImagePath);
        if (fs.existsSync(transformedImagePath)) {
          fs.unlinkSync(transformedImagePath);
          console.log(`Deleted transformed image: ${transformation.transformedImagePath}`);
        }
      }
      
      // Delete the transformation record from the database
      await db
        .delete(transformations)
        .where(sql`${transformations.id} = ${transformation.id}`);
      
      console.log(`Deleted transformation record with ID ${transformation.id}`);
    }
    
    console.log(`Cleanup complete. Removed ${oldTransformations.length} transformations older than ${RETENTION_DAYS} days.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

/**
 * Cleans up orphaned image files in the uploads directory that don't have a corresponding transformation record
 */
export async function cleanupOrphanedFiles() {
  try {
    console.log('Starting cleanup of orphaned image files...');
    
    // Get all files in the uploads directory
    const files = fs.readdirSync(UPLOADS_DIR);
    
    // Get all image paths from the database
    const transformationRecords = await db
      .select({
        originalImagePath: transformations.originalImagePath,
        transformedImagePath: transformations.transformedImagePath
      })
      .from(transformations);
    
    // Create a set of all known image filenames from the database
    const knownFiles = new Set<string>();
    transformationRecords.forEach(record => {
      if (record.originalImagePath) {
        knownFiles.add(path.basename(record.originalImagePath));
      }
      if (record.transformedImagePath) {
        knownFiles.add(path.basename(record.transformedImagePath));
      }
    });
    
    // Delete files that don't exist in the database
    let orphanedCount = 0;
    for (const file of files) {
      // Skip directories and non-image files
      if (fs.statSync(path.join(UPLOADS_DIR, file)).isDirectory()) {
        continue;
      }
      
      // Skip files that are referenced in the database
      if (knownFiles.has(file)) {
        continue;
      }
      
      // Skip files that are less than 1 day old (to avoid race conditions with recent uploads)
      const filePath = path.join(UPLOADS_DIR, file);
      const fileStats = fs.statSync(filePath);
      const fileAge = (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60 * 24); // Age in days
      if (fileAge < 1) {
        continue;
      }
      
      // Delete the orphaned file
      fs.unlinkSync(filePath);
      orphanedCount++;
      console.log(`Deleted orphaned file: ${file}`);
    }
    
    console.log(`Orphaned file cleanup complete. Removed ${orphanedCount} orphaned files.`);
  } catch (error) {
    console.error('Error during orphaned file cleanup:', error);
  }
}

// This function can be called from a scheduled task or cron job
export async function runCleanupTasks() {
  await cleanupOldTransformations();
  await cleanupOrphanedFiles();
}

// Manual testing can be done through the admin API endpoint
// ESM modules don't have the require.main === module pattern