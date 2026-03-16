import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const businessStatusEnum = pgEnum("business_status", ["pending", "approved", "rejected"]);

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  website: text("website"),
  googleMapsUrl: text("google_maps_url"),
  schedule: text("schedule"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id),
  status: businessStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const businessImagesTable = pgTable("business_images", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  isPrimary: integer("is_primary").notNull().default(0),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, rejectionReason: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
export type BusinessImage = typeof businessImagesTable.$inferSelect;
