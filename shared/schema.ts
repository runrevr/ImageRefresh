import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").default("User"),
  email: text("email").notNull().unique(),  // Email should be unique since it's primary login
  password: text("password").notNull(),
  username: text("username"),  // Username is now optional
  freeCreditsUsed: boolean("free_credits_used").default(false).notNull(),
  lastFreeCredit: timestamp("last_free_credit"), // When the free credit was last used
  paidCredits: integer("paid_credits").default(0).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"), // 'basic', 'premium', or null
  subscriptionStatus: text("subscription_status"), // 'active', 'inactive', 'canceled', or null
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planType: text("plan_type").notNull(), // 'free', 'basic', 'premium', etc.
  status: text("status").notNull().default("active"), // 'active', 'inactive', 'canceled', 'expired'
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalImagePath: text("original_image_path").notNull(),
  transformedImagePath: text("transformed_image_path"),
  secondTransformedImagePath: text("second_transformed_image_path"), // Added second transformed image path
  selectedImagePath: text("selected_image_path"), // Track which image was selected for edits
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  editsUsed: integer("edits_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  error: text("error"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  credits: integer("credits").notNull(), // Number of credits purchased
  description: text("description").notNull(), // e.g., "12 Credit Pack", "30 Credit Subscription"
  status: text("status").notNull().default("pending"), // pending, succeeded, failed
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  paymentMethod: text("payment_method").default("stripe"), // Payment method used
  metadata: jsonb("metadata"), // Additional payment data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userImages = pgTable("user_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  imagePath: text("image_path").notNull(), // Path to the transformed/enhanced image
  imageUrl: text("image_url").notNull(), // Full URL to access the image
  originalPrompt: text("original_prompt"), // The prompt used to create this image
  imageType: text("image_type").notNull(), // 'enhancement', 'transformation', 'text-to-image'
  category: text("category").notNull().default("personal"), // 'personal' or 'product'
  transformationId: integer("transformation_id").references(() => transformations.id), // Link to transformation if applicable
  originalImagePath: text("original_image_path"), // Path to the original uploaded image
  fileSize: integer("file_size"), // File size in bytes
  dimensions: text("dimensions"), // Image dimensions like "1024x1024"
  isVariant: boolean("is_variant").default(false), // True if this is a second/variant image
  parentImageId: integer("parent_image_id"), // Link to parent image for variants (self-reference)
  expiresAt: timestamp("expires_at").notNull(), // When this image should be deleted (45 days from creation)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations are defined through foreign keys in the tables above
// userId in memberships references users.id
// userId in transformations references users.id

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  username: true,
  password: true,
  email: true,
  freeCreditsUsed: true,
  paidCredits: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).pick({
  userId: true,
  planType: true,
  status: true,
  startDate: true,
  endDate: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  amount: true,
  credits: true,
  description: true,
  status: true,
  paymentIntentId: true,
  paymentMethod: true,
  metadata: true,
});

export const insertUserImageSchema = createInsertSchema(userImages).pick({
  userId: true,
  imagePath: true,
  imageUrl: true,
  originalPrompt: true,
  imageType: true,
  category: true,
  transformationId: true,
  originalImagePath: true,
  fileSize: true,
  dimensions: true,
  isVariant: true,
  parentImageId: true,
  expiresAt: true,
});

// Create the schema and extend it to increase prompt length limit
const baseInsertTransformationSchema = createInsertSchema(transformations).pick({
  userId: true,
  originalImagePath: true,
  prompt: true,
  status: true,
  editsUsed: true
});

// Export the schema with modified validation for the prompt field
export const insertTransformationSchema = baseInsertTransformationSchema.extend({
  prompt: z.string().max(10000), // Increased length limit for prompts
  status: z.string().default("pending"),
  editsUsed: z.number().default(0)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertUserImage = z.infer<typeof insertUserImageSchema>;
export type UserImage = typeof userImages.$inferSelect;

// Custom types for frontend
export type ImageUploadResponse = {
  imagePath: string;
  imageUrl: string;
};

export type TransformationRequest = {
  originalImagePath: string;
  prompt?: string;
  preset?: string;
  imageSize?: string;
  isEdit?: boolean;
  previousTransformation?: string;
};

export type PromptExample = {
  category: string;
  title: string;
  prompt: string;
  originalImageUrl: string;
  transformedImageUrl: string;
};

export type PricingTier = {
  name: string;
  price: string;
  features: { available: boolean; text: string }[];
  popular?: boolean;
  buttonText: string;
  buttonClass: string;
  borderClass: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

// Product enhancement types have been removed to revert to working version
