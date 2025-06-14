import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User } from "../shared/schema.js";
import MemoryStore from "memorystore";
import { activeCampaignService } from "./activecampaign-service.js";

declare global {
  namespace Express {
    // Use User type from schema but without circular reference
    interface User {
      id: number;
      name: string;
      username: string | null;
      password: string;
      email: string;
      freeCreditsUsed: boolean;
      lastFreeCredit: Date | null;
      paidCredits: number;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      subscriptionTier: string | null;
      subscriptionStatus: string | null;
      createdAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  if (!stored || typeof stored !== 'string') {
    return false;
  }
  
  const parts = stored.split(".");
  if (parts.length !== 2) {
    return false;
  }
  
  const [hashed, salt] = parts;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create memory store for sessions
  const MemStore = MemoryStore(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        console.log("Login attempt for:", username);
        
        // First try to find user by email (check if input looks like email)
        let user = null;
        if (username.includes('@')) {
          console.log("Attempting email login");
          user = await storage.getUserByEmail(username);
        } else {
          console.log("Attempting username login");
          user = await storage.getUserByUsername(username);
        }
        
        // If not found by the primary method, try the other
        if (!user) {
          console.log("User not found, trying alternative lookup");
          if (username.includes('@')) {
            user = await storage.getUserByUsername(username);
          } else {
            user = await storage.getUserByEmail(username);
          }
        }
        
        if (!user) {
          console.log("User not found:", username);
          return done(null, false);
        }
        
        console.log("User found, checking password");
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          console.log("Password mismatch");
          return done(null, false);
        } else {
          console.log("Login successful for user:", user.id);
          return done(null, user);
        }
      } catch (err: any) {
        console.error("Login error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done: any) => done(null, user.id));
  passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err: any) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, name } = req.body;
      
      // Email is now required
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if email already exists
      const existingEmailUser = await storage.getUserByEmail(email);
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Check if username already exists (only if username is provided)
      if (username) {
        const existingUsernameUser = await storage.getUserByUsername(username);
        if (existingUsernameUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // Name is now required
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      // Create the user with hashed password
      // All users should start with freeCreditsUsed = false (they get 1 free credit)
      // and paidCredits = 0 (no paid credits)
      const hashedPassword = await hashPassword(password);
      const insertUser = {
        name: name || "User", // Set default name if not provided
        username: username || null, // Username is now optional
        password: hashedPassword,
        email,
        freeCreditsUsed: false, // All users get 1 free credit per month
        paidCredits: 0 // Start with 0 paid credits
      };
      
      const user = await storage.createUser(insertUser);

      // Add user to ActiveCampaign
      try {
        if (activeCampaignService.isConfigured()) {
          // First add/update the contact
          const contactSuccess = await activeCampaignService.addOrUpdateContact(user);
          
          if (contactSuccess) {
            // Then add appropriate tag based on user tier (#free is default for new registrations)
            await activeCampaignService.updateMembershipStatus(user);
            console.log(`User ${user.id} (${user.email}) added to ActiveCampaign with appropriate tags`);
          }
        }
      } catch (acError) {
        // Log but don't fail registration if ActiveCampaign fails
        console.error("ActiveCampaign integration error:", acError);
      }

      // Log the user in
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received:", { username: req.body.username, hasPassword: !!req.body.password });
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed for:", req.body.username);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.login(user, (err: any) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }
        console.log("Login successful for user:", user.id);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}