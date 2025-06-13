import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertProductOfferingSchema, insertCategorySchema } from "@shared/schema";
import { setupAuth, requireAuth } from "./auth";
import { sendNewProductNotification } from "./emailService";
import { setupSwagger } from "./swagger";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Setup Swagger UI for interactive API documentation
  setupSwagger(app);

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

  // API Documentation Portal
  app.get("/api/docs", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProductFlow API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 3rem; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 700; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .version { background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; display: inline-block; margin-top: 1rem; font-size: 0.9rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e9ecef; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .card-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
        .interactive-icon { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; }
        .docs-icon { background: linear-gradient(135deg, #2196F3, #1976D2); color: white; }
        .card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #2c3e50; }
        .card p { color: #666; margin-bottom: 1.5rem; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.3s ease; }
        .btn:hover { background: #5a6fd8; transform: translateY(-1px); }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #5a6268; }
        .auth-section { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
        .auth-section h3 { color: #856404; margin-bottom: 1rem; }
        .auth-section p { color: #856404; margin-bottom: 1rem; }
        .auth-code { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 0.75rem; font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9rem; color: #495057; }
        .features { background: white; border-radius: 12px; padding: 2rem; margin-bottom: 3rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .features h2 { margin-bottom: 1.5rem; color: #2c3e50; }
        .feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .feature-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: #f8f9fa; }
        .feature-check { background: #28a745; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
        @media (max-width: 768px) { .container { padding: 1rem; } .header h1 { font-size: 2rem; } .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ProductFlow API Documentation</h1>
            <p>Comprehensive API for managing products and categories</p>
            <div class="version">Version 1.0.0</div>
        </div>
        
        <div class="auth-section">
            <h3>🔐 Authentication Required</h3>
            <p>All API endpoints require authentication using an API key. Include your API key in the request header:</p>
            <div class="auth-code">x-api-key: YOUR_API_KEY</div>
        </div>
        
        <div class="grid">
            <div class="card">
                <div class="card-icon interactive-icon">🚀</div>
                <h3>Interactive API Explorer</h3>
                <p>Test all API endpoints directly in your browser with Swagger UI. No coding required - just enter your API key and start exploring!</p>
                <a href="/api/docs/swagger/" class="btn">Launch Swagger UI</a>
            </div>
            
            <div class="card">
                <div class="card-icon docs-icon">📖</div>
                <h3>JSON API Reference</h3>
                <p>Machine-readable API specification in JSON format for automated tools and integration.</p>
                <a href="/api/docs/json" class="btn btn-secondary">View JSON API</a>
            </div>
        </div>
        
        <div class="features">
            <h2>API Features</h2>
            <div class="feature-list">
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>Complete CRUD operations for Products</span>
                </div>
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>Complete CRUD operations for Categories</span>
                </div>
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>Advanced filtering and search</span>
                </div>
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>RESTful API design</span>
                </div>
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>Comprehensive error handling</span>
                </div>
                <div class="feature-item">
                    <div class="feature-check">✓</div>
                    <span>API key authentication</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `);
  });

  // Legacy JSON API Documentation endpoint
  app.get("/api/docs/json", (req, res) => {
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
