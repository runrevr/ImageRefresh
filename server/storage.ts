import {
  transformations,
  users,
  memberships,
  payments,
  productEnhancements,
  productEnhancementImages,
  productEnhancementSelections,
  type User,
  type InsertUser,
  type Transformation,
  type InsertTransformation,
  type Membership,
  type InsertMembership,
  type Payment,
  type InsertPayment,
  type ProductEnhancement,
  type InsertProductEnhancement,
  type ProductEnhancementImage,
  type InsertProductEnhancementImage,
  type ProductEnhancementSelection,
  type InsertProductEnhancementSelection,
  type ProductEnhancementResult,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, not, isNull } from "drizzle-orm";

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

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByIntentId(paymentIntentId: string): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;

  // Transformation operations
  createTransformation(
    transformation: InsertTransformation,
  ): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformationStatus(
    id: number,
    status: string,
    transformedImagePath?: string,
    error?: string,
    secondTransformedImagePath?: string,
    selectedImagePath?: string,
  ): Promise<Transformation>;
  incrementEditsUsed(id: number): Promise<Transformation>;
  getUserTransformations(userId: number): Promise<Transformation[]>;
  
  // Product Enhancement operations
  createProductEnhancement(enhancement: InsertProductEnhancement): Promise<ProductEnhancement>;
  getProductEnhancement(id: number): Promise<ProductEnhancement | undefined>;
  getProductEnhancementByWebhookId(webhookId: string): Promise<ProductEnhancement | undefined>;
  updateProductEnhancementStatus(
    id: number,
    status: string,
    webhookId?: string,
    error?: string
  ): Promise<ProductEnhancement>;
  getUserProductEnhancements(userId: number): Promise<ProductEnhancement[]>;
  
  // Product Enhancement Image operations
  createProductEnhancementImage(image: InsertProductEnhancementImage): Promise<ProductEnhancementImage>;
  getProductEnhancementImage(id: number): Promise<ProductEnhancementImage | undefined>;
  updateProductEnhancementImageOptions(
    id: number,
    options: any
  ): Promise<ProductEnhancementImage>;
  getProductEnhancementImages(enhancementId: number): Promise<ProductEnhancementImage[]>;
  
  // Product Enhancement Selection operations
  createProductEnhancementSelection(selection: InsertProductEnhancementSelection): Promise<ProductEnhancementSelection>;
  getProductEnhancementSelection(id: number): Promise<ProductEnhancementSelection | undefined>;
  updateProductEnhancementSelectionStatus(
    id: number,
    status: string,
    resultImage1Path?: string,
    resultImage2Path?: string
  ): Promise<ProductEnhancementSelection>;
  updateProductEnhancementSelectionResults(
    id: number,
    resultImage1Path: string,
    resultImage2Path: string
  ): Promise<ProductEnhancementSelection>;
  getProductEnhancementSelections(enhancementId: number): Promise<ProductEnhancementSelection[]>;
}

export class DatabaseStorage implements IStorage {
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Storage getUserByUsername called with username: ${username}`);
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      console.log(`User lookup by username result:`, user ? {
        id: user.id,
        typeOfId: typeof user.id,
        username: user.username
      } : 'Not found');
      return user;
    } catch (error) {
      console.error(`Error in getUserByUsername(${username}):`, error);
      return undefined;
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

  // Membership operations
  async createMembership(
    insertMembership: InsertMembership,
  ): Promise<Membership> {
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
        editsUsed: (transformation.editsUsed || 0) + 1,
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

  async getPaymentByIntentId(paymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentIntentId, paymentIntentId));

    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    const paymentResults = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));

    return paymentResults;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();

    return payment;
  }

  // Product Enhancement Operations
  async createProductEnhancement(enhancement: InsertProductEnhancement): Promise<ProductEnhancement> {
    const [result] = await db
      .insert(productEnhancements)
      .values(enhancement)
      .returning();

    return result;
  }

  async getProductEnhancement(id: number): Promise<ProductEnhancement | undefined> {
    const [enhancement] = await db
      .select()
      .from(productEnhancements)
      .where(eq(productEnhancements.id, id));

    return enhancement;
  }

  // Get product enhancement by webhook request ID
  // Uses the webhook_request_id column as defined in schema.ts
  async getProductEnhancementByWebhookId(webhookRequestId: string): Promise<ProductEnhancement | undefined> {
    try {
      const results = await db
        .select()
        .from(productEnhancements)
        .where(eq(productEnhancements.webhookId, webhookRequestId))
        .limit(1);
        
      if (results && results.length > 0) {
        return results[0];
      }
      return undefined;
    } catch (error) {
      console.error("Error getting enhancement by webhook ID:", error);
      return undefined;
    }
  }

  async updateProductEnhancementStatus(
    id: number,
    status: string,
    webhookId?: string,
    error?: string
  ): Promise<ProductEnhancement> {
    const updateData: any = { status };

    if (webhookId !== undefined) {
      updateData.webhookId = webhookId; // This maps to webhook_request_id in the database
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    const [updatedEnhancement] = await db
      .update(productEnhancements)
      .set(updateData)
      .where(eq(productEnhancements.id, id))
      .returning();

    if (!updatedEnhancement) {
      throw new Error("Product enhancement not found");
    }

    return updatedEnhancement;
  }

  async getUserProductEnhancements(userId: number): Promise<ProductEnhancement[]> {
    return await db
      .select()
      .from(productEnhancements)
      .where(eq(productEnhancements.userId, userId))
      .orderBy(desc(productEnhancements.id));
  }

  // Product Enhancement Image Operations
  async createProductEnhancementImage(image: InsertProductEnhancementImage): Promise<ProductEnhancementImage> {
    const [result] = await db
      .insert(productEnhancementImages)
      .values(image)
      .returning();

    return result;
  }

  async getProductEnhancementImage(id: number): Promise<ProductEnhancementImage | undefined> {
    const [image] = await db
      .select()
      .from(productEnhancementImages)
      .where(eq(productEnhancementImages.id, id));

    return image;
  }

  async updateProductEnhancementImageOptions(
    id: number,
    options: any
  ): Promise<ProductEnhancementImage> {
    const [updatedImage] = await db
      .update(productEnhancementImages)
      .set({ options }) // This maps to options_json in the database
      .where(eq(productEnhancementImages.id, id))
      .returning();

    if (!updatedImage) {
      throw new Error("Product enhancement image not found");
    }

    return updatedImage;
  }

  async getProductEnhancementImages(enhancementId: number): Promise<ProductEnhancementImage[]> {
    return await db
      .select()
      .from(productEnhancementImages)
      .where(eq(productEnhancementImages.enhancementId, enhancementId))
      .orderBy(desc(productEnhancementImages.id));
  }

  // Product Enhancement Selection Operations
  async createProductEnhancementSelection(selection: InsertProductEnhancementSelection): Promise<ProductEnhancementSelection> {
    const [result] = await db
      .insert(productEnhancementSelections)
      .values(selection)
      .returning();

    return result;
  }

  async getProductEnhancementSelection(id: number): Promise<ProductEnhancementSelection | undefined> {
    const [selection] = await db
      .select()
      .from(productEnhancementSelections)
      .where(eq(productEnhancementSelections.id, id));

    return selection;
  }

  async updateProductEnhancementSelectionStatus(
    id: number,
    status: string,
    resultImage1Path?: string,
    resultImage2Path?: string
  ): Promise<ProductEnhancementSelection> {
    const updateData: any = { status };

    if (resultImage1Path !== undefined) {
      updateData.resultImage1Path = resultImage1Path;
    }

    if (resultImage2Path !== undefined) {
      updateData.resultImage2Path = resultImage2Path;
    }

    const [updatedSelection] = await db
      .update(productEnhancementSelections)
      .set(updateData)
      .where(eq(productEnhancementSelections.id, id))
      .returning();

    if (!updatedSelection) {
      throw new Error("Product enhancement selection not found");
    }

    return updatedSelection;
  }
  
  async updateProductEnhancementSelectionResults(
    id: number,
    resultImage1Path: string,
    resultImage2Path: string
  ): Promise<ProductEnhancementSelection> {
    const [updatedSelection] = await db
      .update(productEnhancementSelections)
      .set({
        resultImage1Path,
        resultImage2Path,
        status: "completed"
      })
      .where(eq(productEnhancementSelections.id, id))
      .returning();

    if (!updatedSelection) {
      throw new Error("Product enhancement selection not found");
    }

    return updatedSelection;
  }

  async getProductEnhancementSelections(enhancementId: number): Promise<ProductEnhancementSelection[]> {
    return await db
      .select()
      .from(productEnhancementSelections)
      .where(eq(productEnhancementSelections.enhancementId, enhancementId))
      .orderBy(desc(productEnhancementSelections.id));
  }
  
  /**
   * Updates a product enhancement with results from the webhook
   * 
   * @param enhancementId The ID of the product enhancement
   * @param results An array of results with imageId, optionId, and resultImages
   * @returns true if successful
   */
  async updateProductEnhancementResults(
    enhancementId: number, 
    results: Array<{
      selectionId?: number,
      imageId: string | number,
      optionId: string | number,
      resultImage1Path?: string,
      resultImage2Path?: string,
      resultImages?: string[] | { resultImage1Path: string, resultImage2Path: string }
    }>
  ): Promise<boolean> {
    try {
      // For each result, update the corresponding selection
      for (const result of results) {
        let selectionId: number;
        
        // If selectionId is directly provided, use it
        if (result.selectionId) {
          selectionId = result.selectionId;
          console.log(`Using provided selection ID: ${selectionId}`);
        } else {
          // Otherwise, find the selection by enhancementId, imageId, and optionId
          const imageIdNumber = typeof result.imageId === 'string' ? parseInt(result.imageId) : result.imageId;
          
          const selections = await db
            .select()
            .from(productEnhancementSelections)
            .where(
              and(
                eq(productEnhancementSelections.enhancementId, enhancementId),
                eq(productEnhancementSelections.imageId, imageIdNumber),
                eq(productEnhancementSelections.optionKey, String(result.optionId))
              )
            );
          
          if (selections.length === 0) {
            console.error(`No selection found for enhancementId: ${enhancementId}, imageId: ${imageIdNumber}, optionId: ${result.optionId}`);
            continue;
          }
          
          selectionId = selections[0].id;
          console.log(`Found selection ID: ${selectionId} for imageId: ${imageIdNumber}, optionId: ${result.optionId}`);
        }
        
        // Handle the different ways image paths can be provided
        if (result.resultImage1Path && result.resultImage2Path) {
          // Direct paths provided
          await this.updateProductEnhancementSelectionResults(
            selectionId,
            result.resultImage1Path,
            result.resultImage2Path
          );
          console.log(`Updated selection ${selectionId} with direct paths`);
        } else if (result.resultImages) {
          // Handle the resultImages property
          if (Array.isArray(result.resultImages)) {
            // Array format [image1, image2, ...] 
            const images = result.resultImages as string[];
            if (images.length >= 2) {
              await this.updateProductEnhancementSelectionResults(
                selectionId,
                images[0],
                images[1]
              );
            } else if (images.length === 1) {
              // If only one result image is available
              await this.updateProductEnhancementSelectionResults(
                selectionId,
                images[0],
                images[0] // Use the same image for both slots
              );
            }
            console.log(`Updated selection ${selectionId} with array paths`);
          } else if (typeof result.resultImages === 'object') {
            // Object format { resultImage1Path, resultImage2Path }
            const resultObj = result.resultImages as { resultImage1Path: string, resultImage2Path: string };
            await this.updateProductEnhancementSelectionResults(
              selectionId,
              resultObj.resultImage1Path,
              resultObj.resultImage2Path
            );
            console.log(`Updated selection ${selectionId} with object paths`);
          }
        } else {
          console.error(`No result images provided for selection ${selectionId}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating product enhancement results:", error);
      return false;
    }
  }

  // Create a product enhancement result from a selection
  async createProductEnhancementResult(resultData: {
    enhancementId: number;
    selectionId: number;
    imageId: number;
    optionKey: string;
    optionName: string;
    resultImage1Path: string;
    resultImage2Path: string;
    description?: string;
  }): Promise<ProductEnhancementResult> {
    // Update the selection with result image paths
    const selection = await this.updateProductEnhancementSelectionResults(
      resultData.selectionId,
      resultData.resultImage1Path,
      resultData.resultImage2Path
    );

    // Return a result object that maps to the expected ProductEnhancementResult type
    return {
      id: selection.id, // Using selection ID as the result ID
      enhancementId: resultData.enhancementId,
      selectionId: resultData.selectionId,
      imageId: resultData.imageId,
      optionKey: resultData.optionKey,
      optionName: resultData.optionName || selection.optionName || '',
      resultImage1Path: resultData.resultImage1Path,
      resultImage2Path: resultData.resultImage2Path,
      description: resultData.description
    };
  }

  // Get all product enhancement results for an enhancement
  async getProductEnhancementResults(enhancementId: number): Promise<ProductEnhancementResult[]> {
    // Fetch all selections for this enhancement that have result images
    const selections = await db
      .select()
      .from(productEnhancementSelections)
      .where(
        and(
          eq(productEnhancementSelections.enhancementId, enhancementId),
          not(isNull(productEnhancementSelections.resultImage1Path))
        )
      );

    // Convert selections to result objects
    return selections.map(selection => ({
      id: selection.id,
      enhancementId: selection.enhancementId,
      selectionId: selection.id,
      imageId: selection.imageId,
      optionKey: selection.optionKey,
      optionName: selection.optionName || '',
      resultImage1Path: selection.resultImage1Path || '',
      resultImage2Path: selection.resultImage2Path || '',
      description: undefined // No description stored in selections table
    }));
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
      const user = await storage.createUser({
        name: "Demo User",
        username: defaultUsername,
        password: "password",
        email: "demo@example.com",
      });

      // Create a free membership for the demo user
      await storage.createMembership({
        userId: user.id,
        planType: "free",
        status: "active",
        startDate: new Date(),
      });

      console.log(
        "Created default user 'demo' with free membership for development",
      );
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize the database (async but don't wait)
initializeDatabase();

export const storage = new DatabaseStorage();
