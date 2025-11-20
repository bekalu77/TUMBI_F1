import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createUserSchema, insertUserSchema, insertItemCategorySchema, createCompanySchema, insertItemSchema, Company, InsertCompany, createItemSchema, CreateItem, ItemWithRelations, InsertJob, createJobSchema, insertJobSchema, Job } from "@shared/schema";
import path from "path";
import fs from "fs";
import multer from "multer";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { randomUUID } from "crypto";
import matter from "gray-matter";
import yaml from "js-yaml";

// Define interfaces for data types used in search (Tender is not in shared/schema.ts)
interface Tender {
  id: string;
  tenderNo: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedOn: string;
  bidClosingDate: string;
  bidOpeningDate: string;
  region: string;
  featured?: boolean;
}

interface SearchProduct {
  id: string;
  name: string;
  company: string | null; // This will be the company name (string)
  category: string; // This is now a string
  price: number;
  unit: string | null;
  imageUrls: string[];
  companyPhone?: string;
  companyEmail?: string;
  description?: string | null;
  isOwner?: boolean;
  userId: string | null;
  companyId: string | null;
  categoryId: string | null;
  createdAt: Date | null;
}

interface SearchJob {
  id: string;
  title: string;
  category: string | null;
  description: string;
  companyId: string | null;
  userId: string | null;
  location: string | null;
  salary: string | null;
  type: string | null;
  position: string | null;
  experience: string | null;
  requiredSkills: string | null;
  qualifications: string | null;
  howToApply: string | null;
  additionalNotes: string | null;
  applicationLink: string | null;
  deadline: Date | null;
  createdAt: Date | null;
}

const MemoryStoreSession = MemoryStore(session);

async function requireAuth(req: Request, res: Response, next: () => void) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  (req as any).userId = userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ethio-build-mart-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  // Create uploads directory
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Different filenames for products vs companies
      if (file.fieldname === 'productImages') {
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
      } else if (file.fieldname === 'profilePicture') {
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
      } else {
        cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
      }
    },
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

  const articleStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "data", "articles"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const uploadArticle = multer({
    storage: articleStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(md)$/)) {
        return cb(new Error('Please upload a Markdown file'));
      }
      cb(null, true);
    },
  });

  const adStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const adBannerDir = path.join(process.cwd(), "data", "ad", "banner");
      if (!fs.existsSync(adBannerDir)) {
        fs.mkdirSync(adBannerDir, { recursive: true });
      }
      cb(null, adBannerDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const uploadAd = multer({
    storage: adStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        return cb(new Error('Please upload a valid image file (jpg, jpeg, png, gif, svg, webp)'));
      }
      cb(null, true);
    },
  });

  // Serve uploaded files
  app.use("/api/uploads", express.static(uploadsDir));
  app.use("/api/ad/banner", express.static(path.join(process.cwd(), "data", "ad", "banner")));

  // ========== AUTH ROUTES ==========
  app.post("/api/register", upload.single("profilePicture"), async (req: Request, res: Response) => {
    try {
      const parsed = createUserSchema.parse({
        ...req.body,
        profilePictureUrl: req.file ? `/api/uploads/${req.file.filename}` : undefined,
      });
      const existing = await storage.getUserByUsername(parsed.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({ ...parsed, id: randomUUID() });
      return res.json({ id: user.id, username: user.username });
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid payload" });
    }
  });

  app.put("/api/users/:id", requireAuth, upload.single("profilePicture"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const parsed = insertUserSchema.partial().parse({
        ...req.body,
        profilePictureUrl: req.file ? `/api/uploads/${req.file.filename}` : undefined,
      });

      const updatedUser = await storage.updateUser(id, parsed);
      return res.json(updatedUser);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid payload" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Store user ID in session
    (req.session as any).userId = user.id;
    
    return res.json({ token: "demo-token", user: { id: user.id, username: user.username } });
  });

  app.post("/api/logout", async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.json({ authenticated: false });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.json({ authenticated: false });
    }
    
    return res.json({ 
      authenticated: true, 
      user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, phone: user.phone, company: user.company, bio: user.bio, location: user.location, profilePictureUrl: user.profilePictureUrl, role: user.role } 
    });
  });

  app.put("/api/users/:id", requireAuth, upload.single("profilePicture"), async (req, res) => {
    try {
      const { id } = req.params;
      if (id !== (req as any).userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const parsed = insertUserSchema.partial().parse({
        ...req.body,
        profilePictureUrl: req.file ? `/api/uploads/${req.file.filename}` : undefined,
      });
      const user = await storage.updateUser(id, parsed);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid payload" });
    }
  });

  // ========== CATEGORY ROUTES ==========
  app.get("/api/categories", async (_req, res) => {
    try {
      const rows = await storage.listCategories();
      // Filter for both product and service categories
      const categories = rows.filter((c) => !c.parentId && (c.type === "product" || c.type === "service"));
      const subcategories = rows.filter((c) => c.parentId);
      const nestedCategories = categories.map((c) => ({
        ...c,
        subcategories: subcategories.filter((s) => s.parentId === c.id),
      }));
      res.json(nestedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // The /api/categories/products-services endpoint is no longer needed as /api/categories now handles both.
  // Removing it to avoid redundancy.

  // New endpoint for tender categories
  app.get("/api/tender-categories", async (_req, res) => {
    try {
      const rows = await storage.listCategories();
      const tenderCategories = rows.filter((c) => c.type === "tender"); // Filter for tender categories
      res.json(tenderCategories);
    } catch (error) {
      console.error("Error fetching tender categories:", error);
      res.status(500).json({ message: "Failed to fetch tender categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const payload = insertItemCategorySchema.parse({
        ...req.body,
        userId: (req as any).userId,
      });
      const row = await storage.createCategory(payload);
      res.json(row);
    } catch (e: any) {
      res.status(400).json({ message: e?.message || "Invalid category" });
    }
  });

  // ========== CITY ROUTES ==========
  app.get("/api/cities", async (_req, res) => {
    try {
      const rows = await storage.listCities();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // ========== COMPANY TYPES ==========
  app.get("/api/company-types", async (_req, res) => {
    try {
      const rows = await storage.listCompanyTypes();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching company types:", error);
      res.status(500).json({ message: "Failed to fetch company types" });
    }
  });


  // ========== PRODUCT ROUTES ==========
  app.get("/api/products", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      let items;

      if (userId) {
        items = await storage.listItemsByUserId(userId);
      } else {
        items = await storage.listItems();
      }

      const response = items.map((item: ItemWithRelations) => ({
        ...item,
        companyName: item.company?.name || 'N/A',
        categoryName: item.category?.category || 'Uncategorized',
        companyPhone: item.company?.phone || '',
        companyEmail: item.company?.email || '',
      }));
      res.json(response);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Create product with image upload
  app.post("/api/products", requireAuth, upload.array("productImages", 3), async (req, res) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "At least one product image is required" });
      }

      const parsedPrice = parseFloat(req.body.price || '0');
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ message: "Invalid price format" });
      }

      const imageUrls = (req.files as Express.Multer.File[]).map(file => `/api/uploads/${file.filename}`);

      const itemPayload = {
        name: req.body.name,
        companyId: req.body.companyId,
        userId: (req as any).userId,
        categoryId: req.body.categoryId,
        price: parsedPrice,
        unit: req.body.unit,
        description: req.body.description,
        imageUrls: imageUrls, // Pass as array, storage.createItem will stringify
      };

      console.log("=== PRODUCT CREATION ===");
      console.log("Authenticated userId:", (req as any).userId);
      console.log("Item Payload before schema parse:", itemPayload);
      const payload = createItemSchema.parse(itemPayload); // Use createItemSchema
      console.log("Payload after schema parse:", payload);

      const product = await storage.createItem({ ...payload, id: randomUUID() }); // Add ID here
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error); // More specific error logging
      res.status(400).json({ message: error?.message || "Failed to create product" });
    }
  });

  // Update product with image upload
  app.put("/api/products/:id", requireAuth, upload.array("productImages", 3), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const existingProduct = await storage.getItem(id); // Use getItem to fetch the product
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const user = await storage.getUser(userId);
      if (existingProduct.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only update your own products" });
      }

      // Parse existing image URLs from the request body
      let imageUrlsToRetain: string[] = [];
      if (req.body.existingImageUrls) {
        try {
          imageUrlsToRetain = JSON.parse(req.body.existingImageUrls);
          if (!Array.isArray(imageUrlsToRetain)) {
            throw new Error("existingImageUrls must be a JSON array string.");
          }
        } catch (e) {
          return res.status(400).json({ message: "Invalid format for existingImageUrls" });
        }
      }

      // Get new image URLs from uploaded files
      const newImageUrls = (req.files as Express.Multer.File[]).map(file => `/api/uploads/${file.filename}`);

      // Combine existing and new image URLs
      const combinedImageUrls = [...imageUrlsToRetain, ...newImageUrls];

      if (combinedImageUrls.length === 0) {
        return res.status(400).json({ message: "At least one product image is required" });
      }
      if (combinedImageUrls.length > 3) {
        return res.status(400).json({ message: "You can upload a maximum of 3 images (including existing ones)." });
      }

      const parsedPrice = parseFloat(req.body.price || '0');
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ message: "Invalid price format" });
      }

      const itemPayload = {
        name: req.body.name,
        companyId: req.body.companyId,
        userId: userId, // Ensure userId is from auth
        categoryId: req.body.categoryId,
        price: parsedPrice,
        unit: req.body.unit,
        description: req.body.description,
        imageUrls: combinedImageUrls, // Pass as array
      };

      const payload = insertItemSchema.partial().parse(itemPayload); // Use partial for updates
      const updatedProduct = await storage.updateItem(id, payload);
      res.json(updatedProduct);
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const existingProduct = await storage.getItem(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const user = await storage.getUser(userId);
      if (existingProduct.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only delete your own products" });
      }

      await storage.deleteItem(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to delete product" });
    }
  });

  // ========== COMPANY ROUTES ==========
  // Get all companies
  app.get("/api/companies", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      if (userId) {
        const rows = await storage.listCompaniesByUserId(userId);
        return res.json(rows);
      }
      const rows = await storage.listCompanies();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get single company
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Get products by company
  app.get("/api/companies/:id/products", async (req, res) => {
    try {
      const { id } = req.params;
      const products = await storage.listItemsByCompany(id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products for company:", error);
      res.status(500).json({ message: "Failed to fetch products for company" });
    }
  });

  // Create company with logo upload - SIMPLIFIED VERSION
// Create company with logo upload - FIXED VERSION
app.post("/api/companies", requireAuth, upload.single("companyLogo"), async (req, res) => {
  try {
    console.log("=== COMPANY CREATION ===");
    console.log("Authenticated userId:", (req as any).userId);
    console.log("Request body:", req.body);

    const payload = createCompanySchema.parse({
      ...req.body,
      userId: (req as any).userId,
      logoUrl: req.file ? `/api/uploads/${req.file.filename}` : undefined,
      typeId: req.body.typeId, // Include typeId
      companyType: req.body.companyType, // Include companyType
    });

    console.log("Company payload after schema parse:", payload);

    const company = await storage.createCompany({ ...payload, id: randomUUID() });
    res.status(201).json(company);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || "Failed to create company" });
  }
});

  // Update company with optional logo upload
  app.put("/api/companies/:id", requireAuth, upload.single("companyLogo"), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      
      console.log("=== COMPANY UPDATE REQUEST ===");
      console.log("Company ID:", id);
      console.log("Uploaded file:", req.file);
      console.log("Request body:", req.body);

      // Check if company exists
      const existingCompany = await storage.getCompany(id);
      if (!existingCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      const user = await storage.getUser(userId);
      if (existingCompany.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only update your own companies" });
      }

      // Prepare update payload
      const updatePayload: Partial<InsertCompany> = { // Use Partial<InsertCompany> for type safety
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        description: req.body.description,
        location: req.body.location,
        typeId: req.body.typeId, // Include typeId
        companyType: req.body.companyType, // Also include companyType
      };

      // Remove undefined values from payload to avoid overwriting with null
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key as keyof typeof updatePayload] === undefined) {
          delete updatePayload[key as keyof typeof updatePayload];
        }
      });

      // Add logo URL if new logo was uploaded
      if (req.file) {
        updatePayload.logoUrl = `/api/uploads/${req.file.filename}`;
      }

      console.log("Company update payload:", updatePayload);

      // Update company
      const updatedCompany = await storage.updateCompany(id, updatePayload as any); // Cast to any to satisfy storage.updateCompany signature if it's not typed to accept Partial<Company>
      console.log("✅ Company updated successfully:", id);
      
      res.json(updatedCompany);

    } catch (error: any) {
      console.error("Error updating company:", error);
      res.status(400).json({ 
        message: error?.message || "Failed to update company" 
      });
    }
  });

  // Delete company
  app.delete("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const existingCompany = await storage.getCompany(id);
      if (!existingCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      const user = await storage.getUser(userId);
      if (existingCompany.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only delete your own companies" });
      }

      await storage.deleteCompany(id);
      console.log("✅ Company deleted successfully:", id);

      res.json({ message: "Company deleted successfully" });

    } catch (error: any) {
      console.error("Error deleting company:", error);
      res.status(500).json({
        message: error?.message || "Failed to delete company"
      });
    }
  });

  // ========== JOB ROUTES ==========
  app.get("/api/jobs", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      let jobs;

      if (userId) {
        jobs = await storage.listJobsByUserId(userId);
      } else {
        jobs = await storage.listJobs();
      }
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", requireAuth, async (req, res) => {
    try {
      console.log("=== JOB CREATION ===");
      console.log("Authenticated userId:", (req as any).userId);
      console.log("Request body:", req.body);

      const payload = createJobSchema.parse({
        ...req.body,
        userId: (req as any).userId,
      });
      const job = await storage.createJob({ ...payload, id: randomUUID() });
      res.status(201).json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: error?.message || "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      console.log("=== JOB UPDATE ===");
      console.log("Authenticated userId:", userId);
      console.log("Job ID:", id);
      console.log("Request body:", req.body);

      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      const user = await storage.getUser(userId);
      if (existingJob.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only update your own jobs" });
      }

      const payload = insertJobSchema.partial().parse(req.body);
      const updatedJob = await storage.updateJob(id, payload);
      res.json(updatedJob);
    } catch (error: any) {
      console.error("Error updating job:", error);
      res.status(400).json({ message: error?.message || "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      const user = await storage.getUser(userId);
      if (existingJob.userId !== userId && user?.username !== "admin77") {
        return res.status(403).json({ message: "Forbidden: You can only delete your own jobs" });
      }

      await storage.deleteJob(id);
      res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: error?.message || "Failed to delete job" });
    }
  });

  // ========== ARTICLE ROUTES ==========
  app.get("/api/articles/filenames", async (_req, res) => {
    try {
      const articlesDir = path.join(process.cwd(), "data", "articles");
      const files = fs.readdirSync(articlesDir).filter(file => file.endsWith(".md") && !file.startsWith('~$'));
      res.json(files);
    } catch (error) {
      console.error("Error fetching article filenames:", error);
      res.status(500).json({ message: "Failed to fetch article filenames" });
    }
  });

  // New endpoint to get raw content of a specific article markdown file
  app.get("/api/articles/content/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const articlesDir = path.join(process.cwd(), "data", "articles");
      const filePath = path.join(articlesDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Article file not found" });
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(fileContent);
    } catch (error) {
      console.error(`Error fetching article content for ${req.params.filename}:`, error);
      res.status(500).json({ message: "Failed to fetch article content" });
    }
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const { filename, content } = req.body;

      if (!filename || !content) {
        return res.status(400).json({ message: "Filename and content are required" });
      }

      const articlesDir = path.join(process.cwd(), "data", "articles");
      if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
      }

      const filePath = path.join(articlesDir, filename);
      fs.writeFileSync(filePath, content, 'utf-8');

      res.status(201).json({ message: "Article created successfully" });
    } catch (error: any) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: error?.message || "Failed to create article" });
    }
  });

  app.post("/api/articles/upload", requireAuth, uploadArticle.single("article"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      res.status(200).json({ message: "Article uploaded successfully." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== AD ROUTES ==========
  app.get("/api/ads/markdown", async (req, res) => {
    try {
      const adFilePath = path.join(process.cwd(), "data", "ad", "ads.md");
      if (!fs.existsSync(adFilePath)) {
        return res.json([]);
      }
      const fileContent = fs.readFileSync(adFilePath, 'utf-8');
      const ads = yaml.load(fileContent) as any[];
      res.json(ads || []);
    } catch (error) {
      console.error("Error fetching ads from markdown:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.post("/api/ads", requireAuth, uploadAd.single("banner"), async (req, res) => {
    try {
      const { title, link } = req.body;
      const banner = req.file;

      if (!title || !link || !banner) {
        return res.status(400).json({ error: "Title, link, and banner are required." });
      }

      const adFilePath = path.join(process.cwd(), "data", "ad", "ads.md");
      const bannerPath = `/api/ad/banner/${banner.filename}`;

      const newAd = {
        id: randomUUID(),
        title,
        link,
        banner: bannerPath,
        status: 'on' // Default status
      };

      let ads = [];
      if (fs.existsSync(adFilePath)) {
        const fileContent = fs.readFileSync(adFilePath, 'utf-8');
        ads = yaml.load(fileContent) as any[] || [];
      }
      
      ads.push(newAd);
      fs.writeFileSync(adFilePath, yaml.dump(ads));

      res.status(201).json({ message: "Ad created successfully." });
    } catch (error: any) {
      console.error("Error creating ad:", error);
      res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
  });

  app.put("/api/ads/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || (status !== "on" && status !== "off")) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const adFilePath = path.join(process.cwd(), "data", "ad", "ads.md");
      const fileContent = fs.readFileSync(adFilePath, 'utf-8');
      const ads = yaml.load(fileContent) as any[];

      const adIndex = ads.findIndex(ad => ad.id === id);
      if (adIndex === -1) {
        return res.status(404).json({ error: "Ad not found." });
      }

      ads[adIndex].status = status;

      fs.writeFileSync(adFilePath, yaml.dump(ads));
      res.json(ads[adIndex]);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Failed to update ad status" });
    }
  });

  app.put("/api/ads/:id", requireAuth, uploadAd.single("banner"), async (req, res) => {
    try {
      const { id } = req.params;
      const { title, link } = req.body;
      const banner = req.file;

      const adFilePath = path.join(process.cwd(), "data", "ad", "ads.md");
      const fileContent = fs.readFileSync(adFilePath, 'utf-8');
      const ads = yaml.load(fileContent) as any[];

      const adIndex = ads.findIndex(ad => ad.id === id);
      if (adIndex === -1) {
        return res.status(404).json({ error: "Ad not found." });
      }

      ads[adIndex].title = title;
      ads[adIndex].link = link;
      if (banner) {
        ads[adIndex].banner = `/api/ad/banner/${banner.filename}`;
      }

      fs.writeFileSync(adFilePath, yaml.dump(ads));
      res.status(200).json({ message: "Ad updated successfully." });
    } catch (error: any) {
      console.error("Error updating ad:", error);
      res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
  });

  app.delete("/api/ads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Ad ID is required." });
      }

      const adFilePath = path.join(process.cwd(), "data", "ad", "ads.md");
      const fileContent = fs.readFileSync(adFilePath, 'utf-8');
      const ads = yaml.load(fileContent) as any[];

      const updatedAds = ads.filter(ad => ad.id !== id);

      if (ads.length === updatedAds.length) {
        return res.status(404).json({ error: "Ad not found." });
      }

      fs.writeFileSync(adFilePath, yaml.dump(updatedAds));
      res.status(200).json({ message: "Ad deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting ad:", error);
      res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
  });

  // ========== SEARCH ROUTE ==========
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.query as string || "").toLowerCase();
      const typesParam = (req.query.types as string || "products,companies,tenders,jobs,articles").toLowerCase(); // Added jobs and articles to default search types
      const requestedTypes = typesParam.split(',').map(type => type.trim());
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "16");
      const offset = (page - 1) * limit;

      const results: { products?: SearchProduct[]; companies?: Company[]; tenders?: Tender[]; jobs?: SearchJob[]; articles?: any[] } = {}; // Added jobs and articles to results type

      if (requestedTypes.includes("products")) {
        const productsData = await storage.searchItems(query, limit, offset);
        const filteredProducts = productsData.map((p: ItemWithRelations) => ({
          id: p.id,
          name: p.name,
          company: p.company?.name || null, // Mapped to company name (string)
          category: p.category?.category || 'Uncategorized',
          price: Number(p.price),
          unit: p.unit,
          imageUrls: p.imageUrls || [],
          companyPhone: p.company?.phone || '',
          companyEmail: p.company?.email || '',
          description: p.description,
          isOwner: false,
          userId: p.userId,
          companyId: p.companyId,
          categoryId: p.categoryId,
          createdAt: p.createdAt,
        }));
        results.products = filteredProducts;
      }

      if (requestedTypes.includes("companies")) {
        const companiesData = await storage.searchCompanies(query);
        const filteredCompanies = companiesData.map((c: Company) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          location: c.location || "",
          companyType: c.companyType || "General",
          logoUrl: c.logoUrl,
          isVerified: c.isVerified || false,
          email: c.email,
          phone: c.phone,
          userId: c.userId,
          typeId: c.typeId,
          address: c.address,
          website: c.website,
          createdAt: c.createdAt,
        }));
        results.companies = filteredCompanies;
      }

      if (requestedTypes.includes("tenders")) {
        const tendersDir = path.join(process.cwd(), "data", "tender");
        const files = fs.readdirSync(tendersDir).filter(file => file.endsWith(".md") && !file.startsWith('~$'));
        const tenderFilenames = await Promise.all(files.map(async (filename) => {
          const filePath = path.join(tendersDir, filename);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data, content } = matter(fileContent);

          const firstParagraphMatch = content.match(/\n\n([^\n]+)/);
          const excerpt = firstParagraphMatch && firstParagraphMatch[1].trim() ? firstParagraphMatch[1].trim().substring(0, 150) + '...' : 'Click to view full tender document.';

          return {
            id: filename.replace(/\.md$/, ''),
            tenderNo: data.tender_no || 0,
            title: data.closing || 'Untitled Tender',
            slug: data.opening || filename.replace(/\.md$/, ''),
            excerpt: excerpt,
            content: content,
            category: data.category || 'General',
            publishedOn: data.published || 'N/A',
            bidClosingDate: data.closing || 'N/A',
            bidOpeningDate: data.opening || 'N/A',
            region: data.region || 'N/A',
            featured: data.featured || false,
          } as Tender;
        }));

        const filteredTenders = tenderFilenames.filter((t: any) => {
          const searchableText = `${t.title} ${t.category || ''} ${t.excerpt || ''} ${t.content || ''} ${t.region || ''} ${t.bidClosingDate || ''} ${t.bidOpeningDate || ''}`.toLowerCase();
          return searchableText.includes(query);
        });
        results.tenders = filteredTenders;
      }

      if (requestedTypes.includes("jobs")) {
        const jobsData = await storage.searchJobs(query);
        const filteredJobs = jobsData.map((j: Job) => ({
          id: j.id,
          title: j.title,
          category: j.category || null,
          description: j.description,
          companyId: j.companyId || null,
          userId: j.userId || null,
          location: j.location || null,
          salary: j.salary || null,
          type: j.type || null,
          position: j.position || null,
          experience: j.experience || null,
          requiredSkills: j.requiredSkills || null,
          qualifications: j.qualifications || null,
          howToApply: j.howToApply || null,
          additionalNotes: j.additionalNotes || null,
          applicationLink: j.applicationLink || null,
          deadline: j.deadline || null,
          createdAt: j.createdAt || null,
        }));
        results.jobs = filteredJobs;
      }

      if (requestedTypes.includes("articles")) {
        const articlesDir = path.join(process.cwd(), "data", "articles");
        const files = fs.readdirSync(articlesDir).filter(file => file.endsWith(".md") && !file.startsWith('~$'));
        const articleData = await Promise.all(files.map(async (filename) => {
          const filePath = path.join(articlesDir, filename);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data, content } = matter(fileContent);
          const firstParagraphMatch = content.match(/\n\n([^\n]+)/);
          const excerpt = firstParagraphMatch && firstParagraphMatch[1].trim() ? firstParagraphMatch[1].trim().substring(0, 150) + '...' : 'Click to view full article.';
          return {
            id: filename.replace(/\.md$/, ''),
            title: data.title || 'Untitled Article',
            slug: data.slug || filename.replace(/\.md$/, ''),
            excerpt: excerpt,
            content: content,
            category: data.category || 'General',
            published_date: data.published_date || 'N/A',
            author: data.author || 'Admin',
            fileType: 'md',
            image: data.image || undefined,
            read_time: data.read_time || undefined,
            featured: data.featured || false,
            views: data.views || 0,
          };
        }));

        const filteredArticles = articleData.filter((a: any) => {
          const searchableText = `${a.title} ${a.category || ''} ${a.excerpt || ''} ${a.content || ''} ${a.author || ''}`.toLowerCase();
          return searchableText.includes(query);
        });
        results.articles = filteredArticles;
      }

      res.json(results);

    } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).json({ message: "Failed to fetch search results" });
    }
  });

  // New endpoint to list tender markdown filenames
  app.get("/api/tenders/filenames", async (_req, res) => {
    try {
      const tendersDir = path.join(process.cwd(), "data", "tender");
      const files = fs.readdirSync(tendersDir).filter(file => file.endsWith(".md") && !file.startsWith('~$'));
      res.json(files);
    } catch (error) {
      console.error("Error fetching tender filenames:", error);
      res.status(500).json({ message: "Failed to fetch tender filenames" });
    }
  });

  // New endpoint to get raw content of a specific tender markdown file
  app.get("/api/tenders/content/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const tendersDir = path.join(process.cwd(), "data", "tender");
      const filePath = path.join(tendersDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Tender file not found" });
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(fileContent);
    } catch (error) {
      console.error(`Error fetching tender content for ${req.params.filename}:`, error);
      res.status(500).json({ message: "Failed to fetch tender content" });
    }
  });

  app.post("/api/tenders", requireAuth, async (req, res) => {
    try {
      const { filename, content } = req.body;

      if (!filename || !content) {
        return res.status(400).json({ message: "Filename and content are required" });
      }

      const tendersDir = path.join(process.cwd(), "data", "tender");
      if (!fs.existsSync(tendersDir)) {
        fs.mkdirSync(tendersDir, { recursive: true });
      }

      const filePath = path.join(tendersDir, filename);
      fs.writeFileSync(filePath, content, 'utf-8');

      res.status(201).json({ message: "Tender created successfully" });
    } catch (error: any) {
      console.error("Error creating tender:", error);
      res.status(500).json({ message: error?.message || "Failed to create tender" });
    }
  });

  // ========== SEED ROUTE ==========
  app.post("/api/seed", async (_req, res) => {
    try {
      // Simple seed function
      const existingProducts = await storage.listItems();
      if (existingProducts.length > 0) {
        return res.json({ message: "Already seeded" });
      }

      // Create a demo user for seeding
      let demoUser = await storage.getUserByUsername("demo");
      if (!demoUser) {
        demoUser = await storage.createUser({ id: "demo-user-id", username: "demo", password: "demo123" });
      }

      // Create categories
      const productCategories = ["Cement", "Steel", "Wood", "Tiles", "Paint", "Other"];
      for (const name of productCategories) {
        await storage.createCategory({ id: `category-${name.toLowerCase()}`, category: name, type: "product" });
      }

      // Create company types
      const companyTypes = ["Supplier", "Manufacturer", "Wholesaler", "Renter", "Service Provider"];
      const createdCompanyTypes = [];
      for (const name of companyTypes) {
        const newType = await storage.createCompanyType({ id: `company-type-${name.toLowerCase().replace(/\s/g, '-')}`, name: name });
        createdCompanyTypes.push(newType);
      }

      // Create companies linked to demo user
      const companies = [
        { name: "Derba Midroc Cement", email: "contact@derba.com", phone: "+251 11 123 4567", location: "Addis Ababa", description: "Leading cement producer in Ethiopia.", logoUrl: "/api/uploads/company-placeholder-1.jpg", userId: demoUser.id, typeId: createdCompanyTypes[0].id, companyType: createdCompanyTypes[0].name },
        { name: "Ethiopian Steel", email: "info@ethsteel.com", phone: "+251 25 111 2233", location: "Adama", description: "Major steel manufacturer.", logoUrl: "/api/uploads/company-placeholder-2.jpg", userId: demoUser.id, typeId: createdCompanyTypes[1].id, companyType: createdCompanyTypes[1].name },
        { name: "Addis Tiles", email: "sales@addistiles.com", phone: "+251 11 555 6677", location: "Addis Ababa", description: "High-quality ceramic tiles.", logoUrl: "/api/uploads/company-placeholder-3.jpg", userId: demoUser.id, typeId: createdCompanyTypes[0].id, companyType: createdCompanyTypes[0].name },
        { name: "Forest Products", email: "info@forestproducts.com", phone: "+251 11 888 9900", location: "Oromia", description: "Supplier of wood and related products.", logoUrl: "/api/uploads/company-placeholder-4.jpg", userId: demoUser.id, typeId: createdCompanyTypes[0].id, companyType: createdCompanyTypes[0].name },
      ];
      for (const company of companies) {
        await storage.createCompany(company as any);
      }

      res.json({ ok: true, message: "Database seeded successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Seed failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
