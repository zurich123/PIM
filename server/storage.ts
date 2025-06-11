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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private productOfferings: Map<number, ProductOffering>;
  private currentUserId: number;
  private currentProductId: number;
  private currentOfferingId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.productOfferings = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOfferingId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(filters?: {
    productType?: string;
    lifecycleStatus?: string;
    format?: string;
    search?: string;
  }): Promise<ProductWithOfferings[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.productType) {
        products = products.filter(p => p.productType === filters.productType);
      }
      if (filters.lifecycleStatus) {
        products = products.filter(p => p.lifecycleStatus === filters.lifecycleStatus);
      }
      if (filters.format) {
        products = products.filter(p => p.format === filters.format);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p => 
          p.productName.toLowerCase().includes(search) ||
          p.productId.toLowerCase().includes(search)
        );
      }
    }

    const productsWithOfferings: ProductWithOfferings[] = [];
    for (const product of products) {
      const offerings = await this.getProductOfferings(product.id);
      productsWithOfferings.push({ ...product, offerings });
    }

    return productsWithOfferings;
  }

  async getProduct(id: number): Promise<ProductWithOfferings | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const offerings = await this.getProductOfferings(id);
    return { ...product, offerings };
  }

  async getProductBySku(sku: string): Promise<ProductWithOfferings | undefined> {
    const product = Array.from(this.products.values()).find(p => p.productId === sku);
    if (!product) return undefined;
    
    const offerings = await this.getProductOfferings(product.id);
    return { ...product, offerings };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Delete associated offerings first
    const offerings = Array.from(this.productOfferings.values()).filter(o => o.productId === id);
    offerings.forEach(o => this.productOfferings.delete(o.id));
    
    return this.products.delete(id);
  }

  // Product offering methods
  async getProductOfferings(productId: number): Promise<ProductOffering[]> {
    return Array.from(this.productOfferings.values()).filter(o => o.productId === productId);
  }

  async createProductOffering(insertOffering: InsertProductOffering): Promise<ProductOffering> {
    const id = this.currentOfferingId++;
    const offering: ProductOffering = { ...insertOffering, id };
    this.productOfferings.set(id, offering);
    return offering;
  }

  async updateProductOffering(id: number, updateData: Partial<InsertProductOffering>): Promise<ProductOffering | undefined> {
    const offering = this.productOfferings.get(id);
    if (!offering) return undefined;
    
    const updatedOffering = { ...offering, ...updateData };
    this.productOfferings.set(id, updatedOffering);
    return updatedOffering;
  }

  async deleteProductOffering(id: number): Promise<boolean> {
    return this.productOfferings.delete(id);
  }
}

export const storage = new MemStorage();
