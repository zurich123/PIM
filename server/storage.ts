import { 
  users, 
  products, 
  productOfferings,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type ProductOffering,
  type InsertProductOffering,
  type ProductWithOfferings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(filters?: {
    productType?: string;
    lifecycleStatus?: string;
    format?: string;
    search?: string;
  }): Promise<ProductWithOfferings[]>;
  getProduct(id: number): Promise<ProductWithOfferings | undefined>;
  getProductBySku(sku: string): Promise<ProductWithOfferings | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product offering methods
  getProductOfferings(productId: number): Promise<ProductOffering[]>;
  createProductOffering(offering: InsertProductOffering): Promise<ProductOffering>;
  updateProductOffering(id: number, offering: Partial<InsertProductOffering>): Promise<ProductOffering | undefined>;
  deleteProductOffering(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(filters?: {
    productType?: string;
    lifecycleStatus?: string;
    format?: string;
    search?: string;
  }): Promise<ProductWithOfferings[]> {
    const productList = await db.select().from(products);
    
    const productsWithOfferings: ProductWithOfferings[] = [];
    for (const product of productList) {
      const offerings = await this.getProductOfferings(product.id);
      productsWithOfferings.push({ ...product, offerings });
    }

    // Apply search filter in memory for now
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      return productsWithOfferings.filter(p => 
        p.productName.toLowerCase().includes(search) ||
        p.productId.toLowerCase().includes(search)
      );
    }

    return productsWithOfferings;
  }

  async getProduct(id: number): Promise<ProductWithOfferings | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    
    const offerings = await this.getProductOfferings(id);
    return { ...product, offerings };
  }

  async getProductBySku(sku: string): Promise<ProductWithOfferings | undefined> {
    const [product] = await db.select().from(products).where(eq(products.productId, sku));
    if (!product) return undefined;
    
    const offerings = await this.getProductOfferings(product.id);
    return { ...product, offerings };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Delete associated offerings first
    await db.delete(productOfferings).where(eq(productOfferings.productId, id));
    
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getProductOfferings(productId: number): Promise<ProductOffering[]> {
    return await db.select().from(productOfferings).where(eq(productOfferings.productId, productId));
  }

  async createProductOffering(insertOffering: InsertProductOffering): Promise<ProductOffering> {
    const [offering] = await db
      .insert(productOfferings)
      .values(insertOffering)
      .returning();
    return offering;
  }

  async updateProductOffering(id: number, updateData: Partial<InsertProductOffering>): Promise<ProductOffering | undefined> {
    const [offering] = await db
      .update(productOfferings)
      .set(updateData)
      .where(eq(productOfferings.id, id))
      .returning();
    return offering || undefined;
  }

  async deleteProductOffering(id: number): Promise<boolean> {
    const result = await db.delete(productOfferings).where(eq(productOfferings.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
