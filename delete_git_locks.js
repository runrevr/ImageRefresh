import { promises as fs, existsSync } from 'fs';

try {
  // Check if files exist before trying to delete
  if (existsSync('.git/index.lock')) {
    await fs.unlink('.git/index.lock');
    console.log('Successfully deleted .git/index.lock');
  } else {
    console.log('.git/index.lock does not exist');
  }
  
  if (existsSync('.git/config.lock')) {
    await fs.unlink('.git/config.lock');
    console.log('Successfully deleted .git/config.lock');
  } else {
    console.log('.git/config.lock does not exist');
  }
} catch (err) {
  console.error('Error deleting lock files:', err);
}