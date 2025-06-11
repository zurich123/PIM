import { pgTable, text, serial, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  // Base Product (SKU-Level) Attributes
  productName: text("product_name").notNull(),
  productId: text("product_id").notNull().unique(), // SKU
  productType: text("product_type").notNull(), // course, book, bundle, membership
  format: text("format").notNull(), // digital, physical
  lifecycleStatus: text("lifecycle_status").notNull().default("draft"), // draft, active, retired
  membershipFlag: boolean("membership_flag").notNull().default(false),
  membershipEntitlements: text("membership_entitlements"),
  bundleEntitlements: text("bundle_entitlements"),
  revenueRecognitionCode: text("revenue_recognition_code"),
  reportingTags: text("reporting_tags").array(),
});

export const productOfferings = pgTable("product_offerings", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  // Offering-Level Attributes
  brand: text("brand"),
  professions: text("professions").array(),
  deliveryMethod: text("delivery_method"), // online, livestream, hybrid
  accessPeriod: integer("access_period"), // duration number
  accessPeriodType: text("access_period_type"), // days, months, years, lifetime
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  pricingModel: text("pricing_model"), // one-time, subscription, usage-based
  commercialAvailability: boolean("commercial_availability").notNull().default(true),
  channelVisibility: text("channel_visibility").array(), // retail, partner, direct
  approvedJurisdictions: text("approved_jurisdictions").array(),
  creditEligibility: boolean("credit_eligibility").default(false),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertProductOfferingSchema = createInsertSchema(productOfferings).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProductOffering = z.infer<typeof insertProductOfferingSchema>;
export type ProductOffering = typeof productOfferings.$inferSelect;

// Combined product with offerings for frontend display
export type ProductWithOfferings = Product & {
  offerings: ProductOffering[];
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
