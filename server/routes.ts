import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertProductOfferingSchema, insertCategorySchema } from "@shared/schema";
import { setupAuth, requireAuth } from "./auth";
import { sendNewProductNotification } from "./emailService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API Key middleware for external clients
  const apiKeyAuth = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    next();
  };

  // Analytics endpoint (internal only)
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // External API Documentation endpoint
  app.get("/api/docs", (req, res) => {
    res.json({
      title: "ProductFlow API Documentation",
      version: "1.0.0",
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      authentication: {
        type: "API Key",
        header: "x-api-key",
        description: "Include your API key in the x-api-key header for all requests"
      },
      endpoints: {
        products: {
          "GET /api/external/products": {
            description: "Get all products with optional filtering",
            parameters: {
              productType: "Filter by product type (course, book, bundle, membership)",
              lifecycleStatus: "Filter by lifecycle status (active, retired, development)",
              format: "Filter by format (digital, physical, hybrid)",
              search: "Search products by name"
            },
            example: "/api/external/products?productType=course&format=digital"
          },
          "GET /api/external/products/:id": {
            description: "Get a specific product by ID",
            parameters: {
              id: "Product ID (integer)"
            },
            example: "/api/external/products/1"
          },
          "POST /api/external/products": {
            description: "Create a new product",
            body: {
              productName: "string (required)",
              productId: "string (required, unique SKU)",
              productType: "string (required: course, book, bundle, membership)",
              format: "string (required: digital, physical, hybrid)",
              lifecycleStatus: "string (required: active, retired, development)",
              membershipFlag: "boolean (required)",
              membershipEntitlements: "string (optional)",
              bundleEntitlements: "string (optional)",
              revenueRecognitionCode: "string (optional)",
              reportingTags: "array of strings (optional)"
            }
          },
          "PUT /api/external/products/:id": {
            description: "Update an existing product",
            parameters: {
              id: "Product ID (integer)"
            },
            body: "Same as POST, all fields optional"
          },
          "DELETE /api/external/products/:id": {
            description: "Delete a product",
            parameters: {
              id: "Product ID (integer)"
            }
          }
        },
        categories: {
          "GET /api/external/categories": {
            description: "Get all product categories"
          },
          "GET /api/external/categories/:id": {
            description: "Get a specific category by ID",
            parameters: {
              id: "Category ID (integer)"
            }
          },
          "POST /api/external/categories": {
            description: "Create a new category",
            body: {
              categoryName: "string (required)",
              description: "string (optional)"
            }
          },
          "PUT /api/external/categories/:id": {
            description: "Update an existing category",
            parameters: {
              id: "Category ID (integer)"
            },
            body: "Same as POST, all fields optional"
          },
          "DELETE /api/external/categories/:id": {
            description: "Delete a category",
            parameters: {
              id: "Category ID (integer)"
            }
          }
        }
      },
      responseFormats: {
        success: {
          products: {
            id: "number",
            productName: "string",
            productId: "string",
            productType: "string",
            format: "string",
            lifecycleStatus: "string",
            membershipFlag: "boolean",
            membershipEntitlements: "string|null",
            bundleEntitlements: "string|null",
            revenueRecognitionCode: "string|null",
            reportingTags: "string[]|null",
            offerings: "array of product offerings"
          },
          categories: {
            id: "number",
            categoryName: "string",
            description: "string|null"
          }
        },
        error: {
          error: "string",
          details: "string (optional)"
        }
      },
      examples: {
        createProduct: {
          url: "POST /api/external/products",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "your-api-key"
          },
          body: {
            productName: "Advanced JavaScript Course",
            productId: "JS-ADV-001",
            productType: "course",
            format: "digital",
            lifecycleStatus: "active",
            membershipFlag: false,
            reportingTags: ["programming", "javascript"]
          }
        },
        createCategory: {
          url: "POST /api/external/categories",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "your-api-key"
          },
          body: {
            categoryName: "Programming Courses",
            description: "Courses related to software development and programming"
          }
        }
      }
    });
  });

  // ========== EXTERNAL API ENDPOINTS ==========
  
  // External Products API - CRUD Operations
  
  // GET /api/external/products - Get all products with filtering
  app.get("/api/external/products", apiKeyAuth, async (req, res) => {
    try {
      const filters = {
        productType: req.query.productType as string,
        lifecycleStatus: req.query.lifecycleStatus as string,
        format: req.query.format as string,
        search: req.query.search as string,
      };
      
      const products = await storage.getProducts(Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? filters : undefined);
      res.json({ success: true, data: products, count: products.length });
    } catch (error) {
      console.error("External API - Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // GET /api/external/products/:id - Get product by ID
  app.get("/api/external/products/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json({ success: true, data: product });
    } catch (error) {
      console.error("External API - Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // POST /api/external/products - Create new product
  app.post("/api/external/products", apiKeyAuth, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Check if product ID already exists
      const existingProduct = await storage.getProductBySku(validatedData.productId);
      if (existingProduct) {
        return res.status(409).json({ error: "Product with this ID already exists" });
      }
      
      const product = await storage.createProduct(validatedData);
      
      // Send email notification asynchronously
      sendNewProductNotification(product).catch((error) => {
        console.error("Email notification error:", error);
      });
      
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("External API - Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // PUT /api/external/products/:id - Update product
  app.put("/api/external/products/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Validate partial update data
      const partialSchema = insertProductSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, validatedData);
      if (!updatedProduct) {
        return res.status(500).json({ error: "Failed to update product" });
      }
      
      res.json({ success: true, data: updatedProduct });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("External API - Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // DELETE /api/external/products/:id - Delete product
  app.delete("/api/external/products/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete product" });
      }
      
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("External API - Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // External Categories API - CRUD Operations
  
  // GET /api/external/categories - Get all categories
  app.get("/api/external/categories", apiKeyAuth, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json({ success: true, data: categories, count: categories.length });
    } catch (error) {
      console.error("External API - Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // GET /api/external/categories/:id - Get category by ID
  app.get("/api/external/categories/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json({ success: true, data: category });
    } catch (error) {
      console.error("External API - Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // POST /api/external/categories - Create new category
  app.post("/api/external/categories", apiKeyAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("External API - Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // PUT /api/external/categories/:id - Update category
  app.put("/api/external/categories/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      // Check if category exists
      const existingCategory = await storage.getCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Validate partial update data
      const partialSchema = insertCategorySchema.partial();
      const validatedData = partialSchema.parse(req.body);
      
      const updatedCategory = await storage.updateCategory(id, validatedData);
      if (!updatedCategory) {
        return res.status(500).json({ error: "Failed to update category" });
      }
      
      res.json({ success: true, data: updatedCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("External API - Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // DELETE /api/external/categories/:id - Delete category
  app.delete("/api/external/categories/:id", apiKeyAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }

      // Check if category exists
      const existingCategory = await storage.getCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete category" });
      }
      
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      console.error("External API - Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ========== INTERNAL WEB APP ENDPOINTS ==========
  
  // Get all products with optional filtering
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        productType: req.query.productType as string,
        lifecycleStatus: req.query.lifecycleStatus as string,
        format: req.query.format as string,
        search: req.query.search as string,
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });
      
      const products = await storage.getProducts(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create new product
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      
      // Check if SKU already exists
      const existingProduct = await storage.getProductBySku(validatedData.productId);
      if (existingProduct) {
        return res.status(409).json({ message: "Product with this SKU already exists" });
      }
      
      const product = await storage.createProduct(validatedData);
      
      // Send email notification asynchronously (don't block the response)
      sendNewProductNotification(product).then((result) => {
        if (result.success) {
          console.log(`Email notification sent for product: ${product.productName}`);
          if (result.previewUrl) {
            console.log(`Email preview available at: ${result.previewUrl}`);
          }
        } else {
          console.error(`Failed to send email for product: ${product.productName}`, result.error);
        }
      }).catch((error) => {
        console.error("Email notification error:", error);
      });
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      // If updating SKU, check it doesn't already exist
      if (validatedData.productId) {
        const existingProduct = await storage.getProductBySku(validatedData.productId);
        if (existingProduct && existingProduct.id !== id) {
          return res.status(409).json({ message: "Product with this SKU already exists" });
        }
      }
      
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Create product offering
  app.post("/api/products/:productId/offerings", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const validatedData = insertProductOfferingSchema.parse({
        ...req.body,
        productId
      });
      
      const offering = await storage.createProductOffering(validatedData);
      res.status(201).json(offering);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create offering" });
    }
  });

  // Update product offering
  app.patch("/api/offerings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid offering ID" });
      }
      
      const validatedData = insertProductOfferingSchema.omit({ productId: true }).partial().parse(req.body);
      
      const offering = await storage.updateProductOffering(id, validatedData);
      if (!offering) {
        return res.status(404).json({ message: "Offering not found" });
      }
      
      res.json(offering);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update offering" });
    }
  });

  // Delete product offering
  app.delete("/api/offerings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid offering ID" });
      }
      
      const success = await storage.deleteProductOffering(id);
      if (!success) {
        return res.status(404).json({ message: "Offering not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete offering" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
