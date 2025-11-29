import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  bio: text("bio"),
  location: text("location"),
  profilePictureUrl: text("profile_picture_url"),
  role: text("role"),
});

export const insertUserSchema = createInsertSchema(users);
export const createUserSchema = insertUserSchema.omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Company Types
export const companyTypes = sqliteTable("company_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export type CompanyType = typeof companyTypes.$inferSelect;

// Companies
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  typeId: text("type_id").references(() => companyTypes.id), // Re-adding typeId
  address: text("address"),
  userId: text("user_id").references(() => users.id),
  logoUrl: text("logo_url"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  description: text("description"),
  website: text("website"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  companyType: text("company_type"), // Keeping this for now, as it might be used for display or custom types
});

export const insertCompanySchema = createInsertSchema(companies);
export const createCompanySchema = insertCompanySchema.omit({ id: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Item Categories
export const itemCategories = sqliteTable("item_category", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  parentId: text("parent_id").references((): any => itemCategories.id),
});

export type ItemCategory = typeof itemCategories.$inferSelect;

export const insertItemCategorySchema = createInsertSchema(itemCategories);
export type InsertItemCategory = z.infer<typeof insertItemCategorySchema>;

// Items (formerly Products)
export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  companyId: text("company_id").references(() => companies.id),
  userId: text("user_id").references(() => users.id),
  categoryId: text("category_id").references(() => itemCategories.id),
  price: real("price"),
  unit: text("unit"),
  description: text("description"),
  imageUrls: text("image_urls"), // Storing as JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const insertItemSchema = createInsertSchema(items, {
  imageUrls: z.array(z.string()).optional(),
  companyId: z.string().min(1, "Company is required"),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.enum([
    "m²", "m³", "kg", "ton", "liter", "gallon", "bag", "quintal",
    "piece", "roll", "sheet", "bundle", "foot (ft)", "inch (in)", "lm", "Per Point",
    "Per hour", "Per day", "Per week", "Per month", "Per shift", "Per project (lumpsum)"
  ]),
});
export const createItemSchema = insertItemSchema.omit({ id: true }); // New schema for creation
export type InsertItem = z.infer<typeof insertItemSchema>;
export type CreateItem = z.infer<typeof createItemSchema>; // New type

// Define a custom Item type to correctly represent imageUrls as string[] after parsing
export type Item = Omit<typeof items.$inferSelect, 'imageUrls'> & {
  imageUrls: string[] | null;
};

// Define a type for Item with its relations
export type ItemWithRelations = Item & {
  company: Company | null;
  category: ItemCategory | null;
};

export type Product = Item;

// Locations
export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  city: text("city").notNull(),
  region: text("region"),
});

export type Location = typeof locations.$inferSelect;

// RFQ (Request for Quotation)
export const rfq = sqliteTable("rfq", {
  id: text("id").primaryKey(),
  itemName: text("item_name").notNull(),
  companyId: text("company_id").references(() => companies.id),
  userId: text("user_id").references(() => users.id),
  quantity: integer("quantity"),
  unit: text("unit"),
  description: text("description"),
});

export type Rfq = typeof rfq.$inferSelect;

// Jobs
export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  description: text("description").notNull(),
  companyId: text("company_id").references(() => companies.id),
  userId: text("user_id").references(() => users.id),
  location: text("location"),
  salary: text("salary"), // e.g., "Negotiable", "50k-70k"
  type: text("type"), // e.g., "Full-time", "Part-time", "Contract", "Remote"
  position: text("position"),
  experience: text("experience"),
  requiredSkills: text("required_skills"), // Storing as JSON string or comma-separated
  qualifications: text("qualifications"),
  howToApply: text("how_to_apply"),
  additionalNotes: text("additional_notes"),
  applicationLink: text("application_link"),
  deadline: integer("deadline", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const insertJobSchema = createInsertSchema(jobs, {
  deadline: z.preprocess((arg) => {
    if (typeof arg === "string" && arg.trim() === "") return undefined;
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional().nullable()),
  createdAt: z.preprocess((arg) => {
    if (typeof arg === "string" && arg.trim() === "") return undefined;
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional().nullable()),
});
export const createJobSchema = insertJobSchema.omit({ id: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect; // Revert to Drizzle's inferred type

// Units
export const units = sqliteTable("units", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export type Unit = typeof units.$inferSelect;

// Relations
export const companiesRelations = relations(companies, ({ one }) => ({
  companyType: one(companyTypes, { // Re-adding relation to companyTypes
    fields: [companies.typeId],
    references: [companyTypes.id],
  }),
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  company: one(companies, {
    fields: [items.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  category: one(itemCategories, {
    fields: [items.categoryId],
    references: [itemCategories.id],
  }),
}));

export const itemCategoriesRelations = relations(itemCategories, ({ one, many }) => ({
  parent: one(itemCategories, {
    fields: [itemCategories.parentId],
    references: [itemCategories.id],
    relationName: "parent_category",
  }),
  subcategories: many(itemCategories, {
    relationName: "parent_category",
  }),
}));

export const rfqRelations = relations(rfq, ({ one }) => ({
  company: one(companies, {
    fields: [rfq.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [rfq.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
}));
