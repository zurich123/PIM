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
import { eq, count, isNotNull, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  
  // Analytics methods
  getAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
    
    let filteredProducts = productList;

    // Apply filters
    if (filters) {
      if (filters.productType) {
        filteredProducts = filteredProducts.filter(p => p.productType === filters.productType);
      }
      if (filters.lifecycleStatus) {
        filteredProducts = filteredProducts.filter(p => p.lifecycleStatus === filters.lifecycleStatus);
      }
      if (filters.format) {
        filteredProducts = filteredProducts.filter(p => p.format === filters.format);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.productName.toLowerCase().includes(search) ||
          p.productId.toLowerCase().includes(search)
        );
      }
    }
    
    const productsWithOfferings: ProductWithOfferings[] = [];
    for (const product of filteredProducts) {
      const offerings = await this.getProductOfferings(product.id);
      productsWithOfferings.push({ ...product, offerings });
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
    return (result.rowCount || 0) > 0;
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
    return (result.rowCount || 0) > 0;
  }

  async getAnalytics(): Promise<any> {
    try {
      // Get total counts from both tables
      const [totalProductsResult] = await db.select({ count: count() }).from(products);
      const [totalOfferingsResult] = await db.select({ count: count() }).from(productOfferings);

      // Products analytics - group by different attributes
      const productsByType = await db
        .select({
          name: products.productType,
          value: count()
        })
        .from(products)
        .groupBy(products.productType)
        .orderBy(count());

      const productsByStatus = await db
        .select({
          name: products.lifecycleStatus,
          value: count()
        })
        .from(products)
        .groupBy(products.lifecycleStatus)
        .orderBy(count());

      const productsByFormat = await db
        .select({
          name: products.format,
          value: count()
        })
        .from(products)
        .groupBy(products.format)
        .orderBy(count());

      // Product offerings analytics - group by brand
      const offeringsByBrand = await db
        .select({
          name: productOfferings.brand,
          value: count()
        })
        .from(productOfferings)
        .where(isNotNull(productOfferings.brand))
        .groupBy(productOfferings.brand)
        .orderBy(count());

      // Price analysis from offerings table
      const allPrices = await db
        .select({
          price: productOfferings.price
        })
        .from(productOfferings)
        .where(isNotNull(productOfferings.price));

      const prices = allPrices.map(p => parseFloat(p.price || '0')).filter(p => p > 0);
      const priceDistribution = this.calculatePriceDistribution(prices);

      return {
        totalProducts: totalProductsResult.count,
        totalOfferings: totalOfferingsResult.count,
        productsByType: productsByType.map(item => ({
          name: item.name || 'Unknown',
          value: item.value
        })),
        productsByStatus: productsByStatus.map(item => ({
          name: item.name || 'Unknown',
          value: item.value
        })),
        productsByFormat: productsByFormat.map(item => ({
          name: item.name || 'Unknown',
          value: item.value
        })),
        offeringsByBrand: offeringsByBrand.map(item => ({
          name: item.name || 'Unknown',
          value: item.value
        })),
        priceDistribution,
        recentActivity: []
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  }

  private calculatePriceDistribution(prices: number[]) {
    const ranges = [
      { range: '$0-$50', min: 0, max: 50 },
      { range: '$51-$100', min: 51, max: 100 },
      { range: '$101-$250', min: 101, max: 250 },
      { range: '$251-$500', min: 251, max: 500 },
      { range: '$501+', min: 501, max: Infinity }
    ];

    return ranges.map(range => ({
      range: range.range,
      count: prices.filter(price => price >= range.min && price <= range.max).length
    }));
  }
}

export const storage = new DatabaseStorage();
