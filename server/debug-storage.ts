import { storage } from './storage';
import { Request, Response, NextFunction } from 'express';

export function debugStorageFunctions(req: Request, res: Response, next: NextFunction) {
  // Only run for specific routes
  if (req.path.includes('/api/product-enhancement')) {
    console.log('DEBUG STORAGE CHECK:');
    console.log('- Storage type:', typeof storage);
    console.log('- Storage constructor:', storage.constructor?.name);
    
    // Check if the required methods exist
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(storage));
    console.log('- Available methods:', methods);
    
    console.log('- Has createProductEnhancement:', methods.includes('createProductEnhancement'));
    console.log('- Is createProductEnhancement a function:', typeof storage.createProductEnhancement === 'function');
    
    // Check if storage2 is defined in global scope
    console.log('- Global objects:', Object.keys(global));
    // @ts-ignore
    console.log('- storage2 exists globally:', typeof global.storage2 !== 'undefined');
  }
  
  next();
}