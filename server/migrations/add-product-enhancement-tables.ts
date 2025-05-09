import { db } from "../db.js";
import { sql } from "drizzle-orm";

// Function to run the migrations
export async function runMigration() {
  try {
    console.log("Running migration to add product enhancement tables...");

    // Create product_enhancements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_enhancements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        industry TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        webhook_request_id TEXT,
        credits_used INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        error TEXT
      );
    `);

    // Create product_enhancement_images table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_enhancement_images (
        id SERIAL PRIMARY KEY,
        enhancement_id INTEGER NOT NULL REFERENCES product_enhancements(id),
        original_image_path TEXT NOT NULL,
        options_json JSONB,
        selected_options TEXT[],
        result_image_paths TEXT[],
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}