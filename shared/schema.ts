import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").default("User"),
  email: text("email").notNull(),  // Remove unique constraint temporarily
  password: text("password").notNull(),
  username: text("username"),  // Remove unique constraint temporarily
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

// Create the schema and extend it to increase prompt length limit
const baseInsertTransformationSchema = createInsertSchema(transformations).pick({
  userId: true,
  originalImagePath: true,
  prompt: true,
});

// Export the schema with modified validation for the prompt field
export const insertTransformationSchema = baseInsertTransformationSchema.extend({
  prompt: z.string().max(10000), // Increased length limit for prompts
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

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

// New types for product enhancement webhook feature
export const productEnhancements = pgTable("product_enhancements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  industry: text("industry").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  webhookId: text("webhook_id"), // ID returned from webhook
  createdAt: timestamp("created_at").defaultNow().notNull(),
  error: text("error"),
});

export const productEnhancementImages = pgTable("product_enhancement_images", {
  id: serial("id").primaryKey(),
  enhancementId: integer("enhancement_id").references(() => productEnhancements.id).notNull(),
  originalImagePath: text("original_image_path").notNull(),
  options: jsonb("options"), // Stores the enhancement options returned from the webhook
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productEnhancementSelections = pgTable("product_enhancement_selections", {
  id: serial("id").primaryKey(),
  enhancementId: integer("enhancement_id").references(() => productEnhancements.id).notNull(),
  imageId: integer("image_id").references(() => productEnhancementImages.id).notNull(),
  optionKey: text("option_key").notNull(), // Key of the selected option
  resultImage1Path: text("result_image1_path"), // First result image
  resultImage2Path: text("result_image2_path"), // Second result image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
});

export const insertProductEnhancementSchema = createInsertSchema(productEnhancements).pick({
  userId: true,
  industry: true,
});

export const insertProductEnhancementImageSchema = createInsertSchema(productEnhancementImages).pick({
  enhancementId: true,
  originalImagePath: true,
});

export const insertProductEnhancementSelectionSchema = createInsertSchema(productEnhancementSelections).pick({
  enhancementId: true,
  imageId: true,
  optionKey: true,
});

export type InsertProductEnhancement = z.infer<typeof insertProductEnhancementSchema>;
export type ProductEnhancement = typeof productEnhancements.$inferSelect;
export type InsertProductEnhancementImage = z.infer<typeof insertProductEnhancementImageSchema>;
export type ProductEnhancementImage = typeof productEnhancementImages.$inferSelect;
export type InsertProductEnhancementSelection = z.infer<typeof insertProductEnhancementSelectionSchema>;
export type ProductEnhancementSelection = typeof productEnhancementSelections.$inferSelect;

// Type definitions for webhook requests and responses
export type ProductEnhancementWebhookRequest = {
  industry: string;
  images: string[]; // Base64 encoded images
};

export type ProductEnhancementWebhookResponse = {
  id: string;
  images: {
    originalIndex: number;
    options: {
      [key: string]: {
        name: string;
        description: string;
      }
    }
  }[];
};

export type ProductEnhancementSelectionRequest = {
  id: string; // Webhook ID
  selections: {
    imageIndex: number;
    options: string[]; // Array of option keys selected
  }[];
};

export type ProductEnhancementSelectionResponse = {
  id: string;
  results: {
    imageIndex: number;
    option: string;
    resultImages: string[]; // Base64 encoded result images
  }[];
};
