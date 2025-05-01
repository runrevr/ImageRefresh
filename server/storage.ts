import { transformations, users, type User, type InsertUser, type Transformation, type InsertTransformation } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: number, usedFreeCredit: boolean, paidCredits?: number): Promise<User>;
  updateUserEmail(id: number, email: string): Promise<User>;
  updateUserSubscription(
    id: number, 
    subscriptionTier: string | null, 
    subscriptionStatus: string | null, 
    stripeCustomerId?: string | null, 
    stripeSubscriptionId?: string | null
  ): Promise<User>;
  checkAndResetMonthlyFreeCredit(id: number): Promise<boolean>; // Check if user has free credit this month
  
  // Transformation operations
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformationStatus(id: number, status: string, transformedImagePath?: string, error?: string): Promise<Transformation>;
  incrementEditsUsed(id: number): Promise<Transformation>;
  getUserTransformations(userId: number): Promise<Transformation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCredits(id: number, usedFreeCredit: boolean, paidCredits?: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      paidCredits: paidCredits !== undefined ? paidCredits : user.paidCredits
    };
    
    // If we're using the free credit, update the lastFreeCredit timestamp
    if (usedFreeCredit) {
      updateData.freeCreditsUsed = true;
      updateData.lastFreeCredit = new Date();
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }
  
  async checkAndResetMonthlyFreeCredit(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // If user has never used a free credit (new user) or doesn't have a lastFreeCredit date
    if (!user.freeCreditsUsed || !user.lastFreeCredit) {
      return true; // They have a free credit available
    }
    
    const lastUsed = new Date(user.lastFreeCredit);
    const now = new Date();
    
    // Check if it's been at least one month since the last free credit was used
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    if (lastUsed < oneMonthAgo) {
      // It's been more than a month, reset the freeCreditsUsed flag
      await db
        .update(users)
        .set({ freeCreditsUsed: false })
        .where(eq(users.id, id));
      
      return true; // They have a free credit available
    }
    
    return false; // They've already used their free credit this month
  }
  
  async updateUserEmail(id: number, email: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const [updatedUser] = await db
      .update(users)
      .set({ email })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }
  
  async updateUserSubscription(
    id: number, 
    subscriptionTier: string | null, 
    subscriptionStatus: string | null, 
    stripeCustomerId?: string | null, 
    stripeSubscriptionId?: string | null
  ): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      subscriptionTier,
      subscriptionStatus
    };
    
    if (stripeCustomerId !== undefined) {
      updateData.stripeCustomerId = stripeCustomerId;
    }
    
    if (stripeSubscriptionId !== undefined) {
      updateData.stripeSubscriptionId = stripeSubscriptionId;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  // Transformation operations
  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const [transformation] = await db
      .insert(transformations)
      .values(insertTransformation)
      .returning();
    
    return transformation;
  }

  async getTransformation(id: number): Promise<Transformation | undefined> {
    const [transformation] = await db
      .select()
      .from(transformations)
      .where(eq(transformations.id, id));
    
    return transformation;
  }

  async updateTransformationStatus(
    id: number, 
    status: string, 
    transformedImagePath?: string,
    error?: string
  ): Promise<Transformation> {
    const updateData: any = { status };
    
    if (transformedImagePath !== undefined) {
      updateData.transformedImagePath = transformedImagePath;
    }
    
    if (error !== undefined) {
      updateData.error = error;
    }

    const [updatedTransformation] = await db
      .update(transformations)
      .set(updateData)
      .where(eq(transformations.id, id))
      .returning();

    if (!updatedTransformation) {
      throw new Error("Transformation not found");
    }

    return updatedTransformation;
  }

  async incrementEditsUsed(id: number): Promise<Transformation> {
    const transformation = await this.getTransformation(id);
    if (!transformation) {
      throw new Error("Transformation not found");
    }
    
    // Increment the editsUsed count
    const [updatedTransformation] = await db
      .update(transformations)
      .set({ 
        editsUsed: (transformation.editsUsed || 0) + 1 
      })
      .where(eq(transformations.id, id))
      .returning();
    
    return updatedTransformation;
  }

  async getUserTransformations(userId: number): Promise<Transformation[]> {
    return await db
      .select()
      .from(transformations)
      .where(eq(transformations.userId, userId))
      .orderBy(desc(transformations.id));
  }
}

// Initialize database with a default user if needed
async function initializeDatabase() {
  // Check if the default user exists
  const defaultUsername = "demo";
  const storage = new DatabaseStorage();
  
  try {
    const existingUser = await storage.getUserByUsername(defaultUsername);
    if (!existingUser) {
      // Create default user
      await storage.createUser({
        username: defaultUsername,
        password: "password",
        email: "demo@example.com"
      });
      console.log("Created default user 'demo' for development");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize the database (async but don't wait)
initializeDatabase();

export const storage = new DatabaseStorage();
