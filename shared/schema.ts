import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  editsUsed: integer("edits_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  error: text("error"),
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
