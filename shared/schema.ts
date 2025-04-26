import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  freeCreditsUsed: boolean("free_credits_used").default(false).notNull(),
  paidCredits: integer("paid_credits").default(0).notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  userId: true,
  originalImagePath: true,
  prompt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
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
