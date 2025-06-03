import {
  transformations,
  users,
  memberships,
  payments,
  userImages,
  type User,
  type InsertUser,
  type Transformation,
  type InsertTransformation,
  type Membership,
  type InsertMembership,
  type Payment,
  type InsertPayment,
  type UserImage,
  type InsertUserImage,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, not, isNull, lt } from "drizzle-orm";
import { Pool } from '@neondatabase/serverless';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(
    id: number,
    usedFreeCredit: boolean,
    paidCredits?: number,
  ): Promise<User>;
  updateUserEmail(id: number, email: string): Promise<User>;
  updateUserSubscription(
    id: number,
    subscriptionTier: string | null,
    subscriptionStatus: string | null,
    stripeCustomerId?: string | null,
    stripeSubscriptionId?: string | null,
  ): Promise<User>;
  checkAndResetMonthlyFreeCredit(id: number): Promise<boolean>; // Check if user has free credit this month

  // Membership operations
  createMembership(membership: InsertMembership): Promise<Membership>;
  getMembership(id: number): Promise<Membership | undefined>;
  getUserMemberships(userId: number): Promise<Membership[]>;
  getActiveMembership(userId: number): Promise<Membership | undefined>;
  updateMembershipStatus(id: number, status: string): Promise<Membership>;

  // Transformation operations
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformationStatus(
    id: number,
    status: string,
    transformedImagePath?: string,
    error?: string,
    secondTransformedImagePath?: string,
    selectedImagePath?: string,
  ): Promise<Transformation>;
  getUserTransformations(userId: number): Promise<Transformation[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;

  // User Images operations
  saveUserImage(userImage: InsertUserImage): Promise<UserImage>;
  getUserImages(userId: number): Promise<UserImage[]>;
  deleteExpiredImages(): Promise<number>;
  deleteUserImage(imageId: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    // Close existing pool if it exists
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (error) {
        console.log('Error closing existing pool:', error);
      }
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }


  async query(text: string, params?: any[]): Promise<any> {
    let client;
    try {
      client = await this.pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      // If it's a connection error, try to recreate the pool
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
        console.log('Attempting to recreate database connection pool...');
        await this.initializePool();
        // Retry the query once with new pool
        client = await this.pool.connect();
        const result = await client.query(text, params);
        return result;
      }
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Storage getUser called with id: ${id}, type: ${typeof id}`);

    // Enhanced validation - ensure id is a valid positive number
    if (id === undefined || id === null || typeof id !== 'number') {
      console.error(`Invalid user ID type: ${typeof id}`);
      return undefined;
    }

    if (isNaN(id) || !Number.isFinite(id) || id <= 0) {
      console.error(`Invalid user ID value: ${id}`);
      return undefined;
    }

    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log(`User lookup result for id ${id}:`, user ? 'Found' : 'Not found');
      return user;
    } catch (error) {
      console.error(`Error in getUser(${id}):`, error);
      return undefined;
    }
  }

  // Get user by username for login
  async getUserByUsername(username: string): Promise<{ id: number; username: string } | null> {
    console.log(`Storage getUserByUsername called with username: ${username}`);

    try {
      const user = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      const result = user.length > 0 ? user[0] : null;
      console.log(`User lookup by username result:`, result ? { id: result.id, typeOfId: typeof result.id, username: result.username } : 'Not found');

      return result;
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      throw error;
    }
  }

  // Get user by fingerprint
  async getUserByFingerprint(fingerprint: string): Promise<{ id: number; username: string } | null> {
    console.log(`Storage getUserByFingerprint called with fingerprint: ${fingerprint}`);

    try {
      const user = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(eq(users.fingerprint, fingerprint))
        .limit(1);

      const result = user.length > 0 ? user[0] : null;
      console.log(`User lookup by fingerprint result:`, result ? { id: result.id, username: result.username } : 'Not found');

      return result;
    } catch (error) {
      console.error(`Error getting user by fingerprint ${fingerprint}:`, error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCredits(
    id: number,
    usedFreeCredit: boolean,
    paidCredits?: number,
  ): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Ensure paidCredits is a valid number
    let validPaidCredits = user.paidCredits;
    if (paidCredits !== undefined) {
      if (isNaN(paidCredits) || !Number.isFinite(paidCredits)) {
        console.error(`Invalid paidCredits value: ${paidCredits}, using existing value: ${user.paidCredits}`);
      } else {
        validPaidCredits = paidCredits;
      }
    }

    const updateData: any = {
      paidCredits: validPaidCredits,
    };
    console.log("updateData", updateData);

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

  async updateUserEmail(id: number, email: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email,
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async updateUserSubscription(
    id: number,
    subscriptionTier: string | null,
    subscriptionStatus: string | null,
    stripeCustomerId?: string | null,
    stripeSubscriptionId?: string | null,
  ): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      subscriptionTier,
      subscriptionStatus,
    };

    // Only update these fields if they're provided
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

  async checkAndResetMonthlyFreeCredit(id: number): Promise<boolean> {
    try {
      const user = await this.getUser(id);
      if (!user) {
        return false;
      }

      console.log(`Checking monthly free credit for user ${id}:`, {
        freeCreditsUsed: user.freeCreditsUsed,
        lastFreeCredit: user.lastFreeCredit
      });

      // No free credit used yet, user has free credit available
      if (!user.freeCreditsUsed) {
        console.log(`User ${id} has unused free credit available`);
        return true;
      }

      // Check if the last free credit was used in a different month
      if (user.lastFreeCredit) {
        const lastMonth = user.lastFreeCredit.getMonth();
        const lastYear = user.lastFreeCredit.getFullYear();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        console.log(`Credit date comparison:`, {
          lastMonth, lastYear,
          currentMonth, currentYear
        });

        if (lastYear !== currentYear || lastMonth !== currentMonth) {
          // Reset the free credit for new month/year
          console.log(`Resetting free credit for user ${id} - new month/year`);
          const [updatedUser] = await db
            .update(users)
            .set({
              freeCreditsUsed: false,
            })
            .where(eq(users.id, id))
            .returning();

          return true;
        }
      }

      console.log(`User ${id} has already used free credit this month`);
      return false;
    } catch (error) {
      console.error(`Error checking monthly free credit:`, error);
      return false;
    }
  }

  // Membership operations
  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const [membership] = await db
      .insert(memberships)
      .values(insertMembership)
      .returning();

    return membership;
  }

  async getMembership(id: number): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(eq(memberships.id, id));

    return membership;
  }

  async getUserMemberships(userId: number): Promise<Membership[]> {
    return await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId))
      .orderBy(desc(memberships.id));
  }

  async getActiveMembership(userId: number): Promise<Membership | undefined> {
    const membershipsResult = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, userId), eq(memberships.status, "active")),
      )
      .orderBy(desc(memberships.startDate));

    if (membershipsResult.length > 0) {
      return membershipsResult[0];
    }

    return undefined;
  }

  async updateMembershipStatus(
    id: number,
    status: string,
  ): Promise<Membership> {
    const membership = await this.getMembership(id);
    if (!membership) {
      throw new Error("Membership not found");
    }

    const [updatedMembership] = await db
      .update(memberships)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(memberships.id, id))
      .returning();

    return updatedMembership;
  }

  // Transformation operations
  async createTransformation(
    insertTransformation: InsertTransformation,
  ): Promise<Transformation> {
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
    error?: string,
    secondTransformedImagePath?: string,
    selectedImagePath?: string,
  ): Promise<Transformation> {
    const updateData: any = { status };

    if (transformedImagePath !== undefined) {
      updateData.transformedImagePath = transformedImagePath;
    }

    if (secondTransformedImagePath !== undefined) {
      updateData.secondTransformedImagePath = secondTransformedImagePath;
    }

    if (selectedImagePath !== undefined) {
      updateData.selectedImagePath = selectedImagePath;
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    const [updatedTransformation] = await db
      .update(transformations)
      .set(updateData)
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

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.id));
  }

  // User Images operations
  async saveUserImage(insertUserImage: InsertUserImage): Promise<UserImage> {
    console.log(`[STORAGE] saveUserImage called with:`, {
      userId: insertUserImage.userId,
      userIdType: typeof insertUserImage.userId,
      imagePath: insertUserImage.imagePath,
      imageUrl: insertUserImage.imageUrl,
      imageType: insertUserImage.imageType
    });

    // Validate required fields
    if (!insertUserImage.userId || insertUserImage.userId <= 0) {
      throw new Error(`Invalid userId for saveUserImage: ${insertUserImage.userId}`);
    }

    if (!insertUserImage.imagePath) {
      throw new Error(`Missing imagePath for saveUserImage`);
    }

    if (!insertUserImage.imageUrl) {
      throw new Error(`Missing imageUrl for saveUserImage`);
    }

    try {
      const [userImage] = await db
        .insert(userImages)
        .values(insertUserImage)
        .returning();

      console.log(`[STORAGE] Successfully saved userImage with ID: ${userImage.id} for user ${insertUserImage.userId}`);
      return userImage;
    } catch (error) {
      console.error(`[STORAGE] Failed to save userImage:`, error);
      console.error(`[STORAGE] Insert data was:`, insertUserImage);
      throw error;
    }
  }

  async getUserImages(userId: number, category?: string): Promise<UserImage[]> {
    const conditions = [eq(userImages.userId, userId)];

    if (category) {
      conditions.push(eq(userImages.category, category));
    }

    return await db
      .select()
      .from(userImages)
      .where(and(...conditions))
      .orderBy(desc(userImages.createdAt));
  }

  async getUserImagesByCategory(userId: number): Promise<{personal: UserImage[], product: UserImage[]}> {
    const allImages = await this.getUserImages(userId);

    return {
      personal: allImages.filter(img => img.category === 'personal'),
      product: allImages.filter(img => img.category === 'product')
    };
  }

  async deleteExpiredImages(): Promise<number> {
    const result = await db
      .delete(userImages)
      .where(lt(userImages.expiresAt, new Date()));

    return result.rowCount || 0;
  }

  async deleteUserImage(imageId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(userImages)
      .where(and(
        eq(userImages.id, imageId),
        eq(userImages.userId, userId)
      ));

    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();