import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { sql } from 'drizzle-orm';

// Cookie name for demo access
const DEMO_COOKIE_NAME = 'image_refresh_demo_access';
// Demo cookie duration (7 days)
const DEMO_COOKIE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a unique demo access token
 */
function generateDemoToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if the demo cookie is valid
 */
function hasValidDemoCookie(req: Request): boolean {
  const demoCookie = req.cookies[DEMO_COOKIE_NAME];
  if (!demoCookie) return false;
  
  try {
    // Parse the cookie value (format: token:expirationTimestamp)
    const [token, expirationStr] = demoCookie.split(':');
    const expiration = parseInt(expirationStr);
    
    // Check if the cookie has expired
    if (isNaN(expiration) || Date.now() > expiration) {
      return false;
    }
    
    // Verify the token exists in our database
    // This is a placeholder - you would typically check against your database
    return true;
  } catch (error) {
    console.error('Error parsing demo cookie:', error);
    return false;
  }
}

/**
 * Check if the IP address has already used the demo
 */
async function ipHasUsedDemo(ip: string | undefined): Promise<boolean> {
  if (!ip) return false;
  
  // Remove potential IPv6 prefix from IPv4 addresses
  const cleanIp = ip.replace(/^::ffff:/, '');
  
  try {
    // Check if this IP has been recorded
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM demo_usage WHERE ip_address = ${cleanIp}`
    );
    
    // Safely handle the result which could have different format based on database driver
    const count = result[0] ? parseInt(String(result[0].count)) : 0;
    return count > 0;
  } catch (error) {
    console.error('Error checking IP demo usage:', error);
    // In case of error, default to false to avoid blocking legitimate users
    return false;
  }
}

/**
 * Check if the device fingerprint has already used the demo
 */
async function deviceFingerprintUsedBefore(fingerprint: string | undefined): Promise<boolean> {
  if (!fingerprint) return false;
  
  try {
    // Check if this fingerprint has been recorded
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM demo_usage WHERE device_fingerprint = ${fingerprint}`
    );
    
    // Safely handle the result which could have different format based on database driver
    const count = result[0] ? parseInt(String(result[0].count)) : 0;
    return count > 0;
  } catch (error) {
    console.error('Error checking fingerprint demo usage:', error);
    // In case of error, default to false to avoid blocking legitimate users
    return false;
  }
}

/**
 * Issue a new demo access token and set the cookie
 */
async function issueDemoAndSetCookie(req: Request, res: Response): Promise<void> {
  const token = generateDemoToken();
  const expiration = Date.now() + DEMO_COOKIE_DURATION_MS;
  
  // Set the cookie in the response
  res.cookie(DEMO_COOKIE_NAME, `${token}:${expiration}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: DEMO_COOKIE_DURATION_MS,
    sameSite: 'lax'
  });
  
  // Store IP and optional fingerprint in the database
  try {
    const ip = (req.ip || '').replace(/^::ffff:/, '');
    const fingerprint = req.body.fingerprint || req.query.fingerprint || null;
    const expiresAt = new Date(expiration);
    
    await db.execute(
      sql`INSERT INTO demo_usage (ip_address, device_fingerprint, token, created_at, expires_at) 
          VALUES (${ip}, ${fingerprint}, ${token}, NOW(), ${expiresAt})`
    );
  } catch (error) {
    console.error('Error recording demo usage:', error);
  }
}

/**
 * Decide whether to allow or deny access based on the existing cookie
 */
async function allowOrDenyBasedOnCookie(req: Request): Promise<boolean> {
  const demoCookie = req.cookies[DEMO_COOKIE_NAME];
  if (!demoCookie) return false;
  
  try {
    const [token, expirationStr] = demoCookie.split(':');
    
    // Check if the token is valid in our database
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM demo_usage WHERE token = ${token} AND expires_at > NOW()`
    );
    
    // Safely handle the result which could have different format based on database driver
    const count = result[0] ? parseInt(String(result[0].count)) : 0;
    return count > 0;
  } catch (error) {
    console.error('Error validating demo cookie:', error);
    return false;
  }
}

/**
 * Middleware to check if the user can access demo features
 */
export async function demoAccessMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip middleware for authenticated users
  if (req.session && (req.session as any).userId) {
    return next();
  }
  
  try {
    // Check if the user has a valid demo cookie
    if (hasValidDemoCookie(req)) {
      const allowed = await allowOrDenyBasedOnCookie(req);
      if (allowed) {
        return next();
      }
      return res.status(403).json({ error: 'Demo access expired' });
    } 
    
    // Check if the IP has already used the demo
    if (await ipHasUsedDemo(req.ip)) {
      return res.status(403).json({ error: 'Demo limit reached for this IP address' });
    }
    
    // Check if the device fingerprint has been used before
    const fingerprint = req.body.fingerprint || req.query.fingerprint;
    if (fingerprint && await deviceFingerprintUsedBefore(fingerprint)) {
      return res.status(403).json({ error: 'Demo limit reached for this device' });
    }
    
    // Issue a new demo token and set cookie
    await issueDemoAndSetCookie(req, res);
    next();
  } catch (error) {
    console.error('Error in demo access middleware:', error);
    // In production, you might want to fail closed (deny access on error)
    // For now, we'll continue to avoid blocking legitimate users
    next();
  }
}