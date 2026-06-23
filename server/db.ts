import "dotenv/config";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { PRODUCTS, Product } from "../src/data/products";
import { CartItem, ChatMessage } from "../src/types";

// Database config types
const DB_FILE_PATH = path.join(process.cwd(), "nexora_local_db.json");

interface LocalDbSchema {
  products: Product[];
  cart_items: { id: number; user_email: string; product_id: string; quantity: number }[];
  wishlist_items: { id: number; user_email: string; product_id: string }[];
  orders: {
    id: string;
    user_email: string;
    order_date: string;
    total_amount: number;
    shipping_address: string;
    payment_method: string;
  }[];
  order_items: { id: number; order_id: string; product_id: string; quantity: number; unit_price: number }[];
  chat_messages: { id: number; user_email: string; role: string; content: string; timestamp: string }[];
  merchants: { email: string; brand_name: string; description: string; logo_url?: string; created_at: string }[];
  deliveries: {
    order_id: string;
    rider_id: string;
    rider_name: string;
    vehicle_type: string;
    status: string;
    current_lat: number;
    current_lng: number;
    target_lat: number;
    target_lng: number;
    estimated_minutes: number;
    last_update: string;
  }[];
  users: {
    email: string;
    name: string;
    password?: string;
    role: "customer" | "merchant" | "rider";
    locality?: string;
    brand_name?: string;
    created_at: string;
  }[];
}

class DatabaseManager {
  private pool: Pool | null = null;
  private isPostgresActive = false;
  private isNeonActive = false;
  private localDb: LocalDbSchema = {
    products: [],
    cart_items: [],
    wishlist_items: [],
    orders: [],
    order_items: [],
    chat_messages: [],
    merchants: [],
    deliveries: [],
    users: []
  };

  constructor() {
    const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
    const hasPgString = connectionString && connectionString !== "placeholder" && !connectionString.includes("my-postgres-url");
    
    if (hasPgString) {
      try {
        console.log("⚡ Connecting to high-performance active PostgreSQL database server...");
        this.pool = new Pool({
          connectionString,
          ssl: {
            rejectUnauthorized: false
          }
        });
        this.isPostgresActive = true;
        this.isNeonActive = connectionString.includes(".neon.tech") || connectionString.includes("neon.db");
      } catch (err) {
        console.error("❌ Failed to instantiate PostgreSQL pool. Activating local database fallback.", err);
        this.isPostgresActive = false;
        this.isNeonActive = false;
      }
    } else {
      console.log("ℹ️ No active PostgreSQL string configured. Activating Nexora Local File-based Database Persistence.");
      this.isPostgresActive = false;
      this.isNeonActive = false;
    }
    
    this.loadLocalData();
  }

  // Load filesystem database
  private loadLocalData() {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.localDb = JSON.parse(raw);
        console.log("📝 Loaded existing local database records.");
      } catch (err) {
        console.error("Failed to parse local JSON database. Initializing empty tables.", err);
      }
    } else {
      this.saveLocalData();
    }
  }

  // Save changes to disk
  private saveLocalData() {
    try {
      if (this.localDb.products.length === 0) {
        this.localDb.products = [...PRODUCTS];
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.localDb, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist local database output to disk:", err);
    }
  }

  // Live tables initializer
  public async init() {
    if (this.isPostgresActive && this.pool) {
      try {
        const client = await this.pool.connect();
        console.log("🛠️ Initializing tables in PostgreSQL...");
        
        // Execute creation commands sequentially
        await client.query(`
          CREATE TABLE IF NOT EXISTS products (
              id VARCHAR(50) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              category VARCHAR(100) NOT NULL,
              price DECIMAL(10, 2) NOT NULL,
              original_price DECIMAL(10, 2),
              rating DECIMAL(3, 2) DEFAULT 4.5,
              rating_count INT DEFAULT 12,
              description TEXT NOT NULL,
              image TEXT NOT NULL,
              tag VARCHAR(50),
              is_featured BOOLEAN DEFAULT FALSE,
              is_trending BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS cart_items (
              id SERIAL PRIMARY KEY,
              user_email VARCHAR(255) NOT NULL,
              product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
              quantity INT NOT NULL DEFAULT 1,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_product ON cart_items(user_email, product_id);
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS wishlist_items (
              id SERIAL PRIMARY KEY,
              user_email VARCHAR(255) NOT NULL,
              product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist_items(user_email, product_id);
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS orders (
              id VARCHAR(50) PRIMARY KEY,
              user_email VARCHAR(255) NOT NULL,
              order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              total_amount DECIMAL(10, 2) NOT NULL,
              shipping_address TEXT,
              payment_method VARCHAR(100) DEFAULT 'Quantum-Pay',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS order_items (
              id SERIAL PRIMARY KEY,
              order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
              product_id VARCHAR(50) NOT NULL REFERENCES products(id),
              quantity INT NOT NULL DEFAULT 1,
              unit_price DECIMAL(10, 2) NOT NULL
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS chat_messages (
              id SERIAL PRIMARY KEY,
              user_email VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL,
              content TEXT NOT NULL,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Update products schema dynamically to support merchant attributes
        await client.query(`
          ALTER TABLE products ADD COLUMN IF NOT EXISTS merchant_brand VARCHAR(255);
        `);
        await client.query(`
          ALTER TABLE products ADD COLUMN IF NOT EXISTS merchant_email VARCHAR(255);
        `);
        await client.query(`
          ALTER TABLE products ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT FALSE;
        `);

        // Create merchants table
        await client.query(`
          CREATE TABLE IF NOT EXISTS merchants (
              email VARCHAR(255) PRIMARY KEY,
              brand_name VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              logo_url VARCHAR(500),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create deliveries table
        await client.query(`
          CREATE TABLE IF NOT EXISTS deliveries (
              order_id VARCHAR(50) PRIMARY KEY,
              rider_id VARCHAR(50) NOT NULL,
              rider_name VARCHAR(100) NOT NULL,
              vehicle_type VARCHAR(100) NOT NULL,
              status VARCHAR(50) NOT NULL,
              current_lat DOUBLE PRECISION NOT NULL,
              current_lng DOUBLE PRECISION NOT NULL,
              target_lat DOUBLE PRECISION NOT NULL,
              target_lng DOUBLE PRECISION NOT NULL,
              estimated_minutes INT NOT NULL,
              last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
              email VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              password VARCHAR(255) NOT NULL,
              role VARCHAR(50) NOT NULL,
              locality VARCHAR(255),
              brand_name VARCHAR(255),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Check if products catalog needs to be populated
        const prodCheck = await client.query("SELECT COUNT(*) FROM products");
        const count = parseInt(prodCheck.rows[0].count, 10);
        
        if (count === 0) {
          console.log("📊 Seeding products into PostgreSQL database...");
          for (const p of PRODUCTS) {
            await client.query(
              `INSERT INTO products (id, name, category, price, original_price, rating, rating_count, description, image, tag, is_featured, is_trending)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                p.id,
                p.name,
                p.category,
                p.price,
                p.originalPrice || null,
                p.rating,
                p.ratingCount,
                p.description,
                p.image,
                p.tag || null,
                p.isFeatured || false,
                p.isTrending || false
              ]
            );
          }
          console.log("✅ Successfully seeded Postgres products.");
        }
        
        client.release();
        console.log("✨ PostgreSQL Database is fully configured and connected.");
      } catch (err) {
        console.error("❌ Failed to bootstrap tables in Postgres. Resetting query status.", err);
        this.isPostgresActive = false;
      }
    } else {
      // Local setup seed
      if (this.localDb.products.length === 0) {
        this.localDb.products = [...PRODUCTS];
        this.saveLocalData();
      }
      console.log("⭐ Local persistent database configured with standard products.");
    }
  }

  public getModeInfo() {
    return {
      postgresActive: this.isPostgresActive,
      isNeon: this.isNeonActive,
      storageMethod: this.isPostgresActive 
        ? (this.isNeonActive ? "Neon Serverless Database" : "PostgreSQL Core Engine")
        : "Local File System Mode"
    };
  }

  public async testConnection() {
    if (!this.pool || !this.isPostgresActive) {
      return {
        success: false,
        error: "Active PostgreSQL core connection is unavailable. Operating in Local File System mode."
      };
    }
    const start = Date.now();
    try {
      const client = await this.pool.connect();
      const res = await client.query("SELECT version(), now() as current_time;");
      client.release();
      const elapsed = Date.now() - start;
      return {
        success: true,
        latencyMs: elapsed,
        version: res.rows[0].version,
        serverTime: res.rows[0].current_time,
        isNeon: this.isNeonActive
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to finalize database server ping connection test."
      };
    }
  }

  public async getStats() {
    if (this.isPostgresActive && this.pool) {
      try {
        const client = await this.pool.connect();
        const pCount = await client.query("SELECT COUNT(*) FROM products");
        const cCount = await client.query("SELECT COUNT(*) FROM cart_items");
        const wCount = await client.query("SELECT COUNT(*) FROM wishlist_items");
        const oCount = await client.query("SELECT COUNT(*) FROM orders");
        const oiCount = await client.query("SELECT COUNT(*) FROM order_items");
        const msgCount = await client.query("SELECT COUNT(*) FROM chat_messages");
        const mCount = await client.query("SELECT COUNT(*) FROM merchants");
        client.release();

        return {
          products: parseInt(pCount.rows[0].count, 10),
          cartItems: parseInt(cCount.rows[0].count, 10),
          wishlistItems: parseInt(wCount.rows[0].count, 10),
          orders: parseInt(oCount.rows[0].count, 10),
          orderItems: parseInt(oiCount.rows[0].count, 10),
          chatMessages: parseInt(msgCount.rows[0].count, 10),
          merchants: parseInt(mCount.rows[0].count, 10)
        };
      } catch (err) {
        console.error("Postgres stats fetch failed, falling back to counting state arrays:", err);
      }
    }

    return {
      products: this.localDb.products.length,
      cartItems: this.localDb.cart_items.length,
      wishlistItems: this.localDb.wishlist_items.length,
      orders: this.localDb.orders.length,
      orderItems: this.localDb.order_items.length,
      chatMessages: this.localDb.chat_messages.length,
      merchants: this.localDb.merchants.length
    };
  }

  // 1. PRODUCTS
  public async getProducts(): Promise<Product[]> {
    if (this.isPostgresActive && this.pool) {
      try {
        const res = await this.pool.query("SELECT * FROM products ORDER BY name ASC");
        return res.rows.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          price: parseFloat(row.price),
          originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
          rating: parseFloat(row.rating),
          ratingCount: parseInt(row.rating_count, 10),
          description: row.description,
          image: row.image,
          tag: row.tag || undefined,
          isFeatured: row.is_featured,
          isTrending: row.is_trending,
          merchantBrand: row.merchant_brand || undefined,
          merchantEmail: row.merchant_email || undefined,
          isDigital: !!row.is_digital
        }));
      } catch (err) {
        console.error("PG query products failed, using memory default", err);
      }
    }
    return this.localDb.products;
  }

  // 2. CART ITEMS
  public async getCartItems(userEmail: string): Promise<CartItem[]> {
    if (this.isPostgresActive && this.pool) {
      try {
        const query = `
          SELECT c.id, c.quantity, p.id as prod_id, p.name, p.category, p.price, p.original_price, p.image
          FROM cart_items c
          JOIN products p ON c.product_id = p.id
          WHERE c.user_email = $1
          ORDER BY c.id ASC
        `;
        const res = await this.pool.query(query, [userEmail]);
        return res.rows.map(row => ({
          id: row.prod_id, // Map product_id to cart item logical id
          name: row.name,
          category: row.category,
          price: parseFloat(row.price),
          originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
          image: row.image,
          quantity: row.quantity
        }));
      } catch (err) {
        console.error("PG query cart failed", err);
      }
    }
    
    // Local fallback
    return this.localDb.cart_items
      .filter(item => item.user_email === userEmail)
      .map(item => {
        const product = this.localDb.products.find(p => p.id === item.product_id);
        return {
          id: item.product_id,
          name: product?.name || "Premium Accessory",
          category: product?.category || "Tech",
          price: product?.price || 0,
          originalPrice: product?.originalPrice,
          image: product?.image || "",
          quantity: item.quantity
        };
      });
  }

  public async addCartItem(userEmail: string, productId: string, quantity: number): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      try {
        const q = `
          INSERT INTO cart_items (user_email, product_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_email, product_id)
          DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
        `;
        await this.pool.query(q, [userEmail, productId, quantity]);
        return;
      } catch (err) {
        console.error("PG add cart failed", err);
      }
    }

    // Local fallback
    const match = this.localDb.cart_items.find(
      c => c.user_email === userEmail && c.product_id === productId
    );
    if (match) {
      match.quantity += quantity;
    } else {
      this.localDb.cart_items.push({
        id: Date.now() + Math.floor(Math.random() * 100),
        user_email: userEmail,
        product_id: productId,
        quantity
      });
    }
    this.saveLocalData();
  }

  public async updateCartItemQuantity(userEmail: string, productId: string, quantity: number): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          "UPDATE cart_items SET quantity = $1 WHERE user_email = $2 AND product_id = $3",
          [quantity, userEmail, productId]
        );
        return;
      } catch (err) {
        console.error("PG update cart failed", err);
      }
    }

    const match = this.localDb.cart_items.find(
      c => c.user_email === userEmail && c.product_id === productId
    );
    if (match) {
      match.quantity = quantity;
      this.saveLocalData();
    }
  }

  public async removeCartItem(userEmail: string, productId: string): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          "DELETE FROM cart_items WHERE user_email = $1 AND product_id = $2",
          [userEmail, productId]
        );
        return;
      } catch (err) {
        console.error("PG delete cart item failed", err);
      }
    }

    this.localDb.cart_items = this.localDb.cart_items.filter(
      c => !(c.user_email === userEmail && c.product_id === productId)
    );
    this.saveLocalData();
  }

  public async clearCart(userEmail: string): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query("DELETE FROM cart_items WHERE user_email = $1", [userEmail]);
        return;
      } catch (err) {
        console.error("PG clean cart failed", err);
      }
    }

    this.localDb.cart_items = this.localDb.cart_items.filter(c => c.user_email !== userEmail);
    this.saveLocalData();
  }

  // 3. WISHLIST
  public async getWishlist(userEmail: string): Promise<string[]> {
    if (this.isPostgresActive && this.pool) {
      try {
        const res = await this.pool.query(
          "SELECT product_id FROM wishlist_items WHERE user_email = $1",
          [userEmail]
        );
        return res.rows.map(r => r.product_id);
      } catch (err) {
        console.error("PG query wishlist failed", err);
      }
    }

    return this.localDb.wishlist_items
      .filter(w => w.user_email === userEmail)
      .map(w => w.product_id);
  }

  public async toggleWishlist(userEmail: string, productId: string): Promise<boolean> {
    if (this.isPostgresActive && this.pool) {
      try {
        const check = await this.pool.query(
          "SELECT 1 FROM wishlist_items WHERE user_email = $1 AND product_id = $2",
          [userEmail, productId]
        );
        
        if (check.rows.length > 0) {
          await this.pool.query(
            "DELETE FROM wishlist_items WHERE user_email = $1 AND product_id = $2",
            [userEmail, productId]
          );
          return false; // Removed
        } else {
          await this.pool.query(
            "INSERT INTO wishlist_items (user_email, product_id) VALUES ($1, $2)",
            [userEmail, productId]
          );
          return true; // Added
        }
      } catch (err) {
        console.error("PG toggle wishlist failed", err);
      }
    }

    const idx = this.localDb.wishlist_items.findIndex(
      w => w.user_email === userEmail && w.product_id === productId
    );
    if (idx !== -1) {
      this.localDb.wishlist_items.splice(idx, 1);
      this.saveLocalData();
      return false; // Removed
    } else {
      this.localDb.wishlist_items.push({
        id: Date.now() + Math.floor(Math.random() * 50),
        user_email: userEmail,
        product_id: productId
      });
      this.saveLocalData();
      return true; // Added
    }
  }

  // 4. ORDERS & RECEIPTS LOGS
  public async getOrders(userEmail: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        const orderRes = await this.pool.query(
          "SELECT * FROM orders WHERE user_email = $1 ORDER BY order_date DESC",
          [userEmail]
        );
        
        const ordersList = [];
        for (const ord of orderRes.rows) {
          const itemsRes = await this.pool.query(
            `SELECT oi.quantity, oi.unit_price, p.id as prod_id, p.name, p.category, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [ord.id]
          );
          
          ordersList.push({
            id: ord.id,
            date: new Date(ord.order_date).toLocaleDateString(),
            total: parseFloat(ord.total_amount),
            shippingAddress: ord.shipping_address,
            paymentMethod: ord.payment_method,
            items: itemsRes.rows.map(row => ({
              id: row.prod_id,
              name: row.name,
              category: row.category,
              price: parseFloat(row.unit_price),
              image: row.image,
              quantity: row.quantity
            }))
          });
        }
        return ordersList;
      } catch (err) {
        console.error("PG query orders failed", err);
      }
    }

    // Local fallback
    return this.localDb.orders
      .filter(o => o.user_email === userEmail)
      .map(o => {
        const matchingItems = this.localDb.order_items.filter(oi => oi.order_id === o.id);
        const compiledItems = matchingItems.map(item => {
          const prod = this.localDb.products.find(p => p.id === item.product_id);
          return {
            id: item.product_id,
            name: prod?.name || "Premium Nexora Item",
            category: prod?.category || "Standard",
            price: item.unit_price,
            image: prod?.image || "",
            quantity: item.quantity
          };
        });

        return {
          id: o.id,
          date: new Date(o.order_date).toLocaleDateString(),
          total: o.total_amount,
          shippingAddress: o.shipping_address,
          paymentMethod: o.payment_method,
          items: compiledItems
        };
      });
  }

  public async createOrder(
    userEmail: string,
    total: number,
    shippingAddress: string,
    paymentMethod: string,
    items: CartItem[]
  ) {
    const orderId = "NX-ORD-" + Math.floor(100000 + Math.random() * 900000);
    
    if (this.isPostgresActive && this.pool) {
      try {
        const client = await this.pool.connect();
        await client.query("BEGIN");
        
        await client.query(
          `INSERT INTO orders (id, user_email, total_amount, shipping_address, payment_method)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, userEmail, total, shippingAddress, paymentMethod]
        );

        for (const item of items) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [orderId, item.id, item.quantity, item.price]
          );
        }

        // Clear cart since order has been checked out successfully!
        await client.query("DELETE FROM cart_items WHERE user_email = $1", [userEmail]);
        
        await client.query("COMMIT");
        client.release();
        return { orderId, success: true };
      } catch (err) {
        if (this.pool) await this.pool.query("ROLLBACK");
        console.error("PG create order failed", err);
      }
    }

    // Local DB fallback
    this.localDb.orders.push({
      id: orderId,
      user_email: userEmail,
      order_date: new Date().toISOString(),
      total_amount: total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod
    });

    for (const item of items) {
      this.localDb.order_items.push({
        id: Date.now() + Math.floor(Math.random() * 200),
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      });
    }

    // Clear cart
    this.localDb.cart_items = this.localDb.cart_items.filter(c => c.user_email !== userEmail);
    
    this.saveLocalData();
    return { orderId, success: true };
  }

  // 5. CHAT MESSAGES
  public async getChatHistory(userEmail: string): Promise<ChatMessage[]> {
    if (this.isPostgresActive && this.pool) {
      try {
        const q = "SELECT * FROM chat_messages WHERE user_email = $1 ORDER BY id ASC";
        const res = await this.pool.query(q, [userEmail]);
        return res.rows.map(row => ({
          id: String(row.id),
          role: row.role as ChatMessage["role"],
          content: row.content,
          timestamp: new Date(row.timestamp)
        }));
      } catch (err) {
        console.error("PG query chats failed", err);
      }
    }

    // Local fallback
    return this.localDb.chat_messages
      .filter(msg => msg.user_email === userEmail)
      .map(msg => ({
        id: String(msg.id),
        role: msg.role as ChatMessage["role"],
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
  }

  public async addChatMessage(userEmail: string, role: string, content: string): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          "INSERT INTO chat_messages (user_email, role, content) VALUES ($1, $2, $3)",
          [userEmail, role, content]
        );
        return;
      } catch (err) {
        console.error("PG insert chat failed", err);
      }
    }

    this.localDb.chat_messages.push({
      id: Date.now() + Math.floor(Math.random() * 800),
      user_email: userEmail,
      role,
      content,
      timestamp: new Date().toISOString()
    });
    this.saveLocalData();
  }

  // 6. MERCHANT METHODS
  public async getMerchant(email: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        const res = await this.pool.query("SELECT * FROM merchants WHERE email = $1", [email]);
        if (res.rows.length > 0) {
          return {
            email: res.rows[0].email,
            brandName: res.rows[0].brand_name,
            description: res.rows[0].description,
            logoUrl: res.rows[0].logo_url || undefined,
            createdAt: res.rows[0].created_at
          };
        }
        return null;
      } catch (err) {
        console.error("PG query merchant failed", err);
      }
    }

    const match = this.localDb.merchants.find(m => m.email === email);
    if (match) {
      return {
        email: match.email,
        brandName: match.brand_name,
        description: match.description,
        logoUrl: match.logo_url,
        createdAt: match.created_at
      };
    }
    return null;
  }

  public async registerMerchant(email: string, brandName: string, description: string, logoUrl?: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO merchants (email, brand_name, description, logo_url)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET brand_name = EXCLUDED.brand_name, description = EXCLUDED.description, logo_url = COALESCE(EXCLUDED.logo_url, merchants.logo_url)`,
          [email, brandName, description, logoUrl || null]
        );
        return { success: true };
      } catch (err) {
        console.error("PG register merchant failed", err);
      }
    }

    const matchIdx = this.localDb.merchants.findIndex(m => m.email === email);
    if (matchIdx !== -1) {
      this.localDb.merchants[matchIdx].brand_name = brandName;
      this.localDb.merchants[matchIdx].description = description;
      if (logoUrl) {
        this.localDb.merchants[matchIdx].logo_url = logoUrl;
      }
    } else {
      this.localDb.merchants.push({
        email,
        brand_name: brandName,
        description,
        logo_url: logoUrl,
        created_at: new Date().toISOString()
      });
    }
    this.saveLocalData();
    return { success: true };
  }

  public async updateMerchantLogo(email: string, logoUrl: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          `UPDATE merchants SET logo_url = $1 WHERE email = $2`,
          [logoUrl, email]
        );
        return { success: true };
      } catch (err) {
        console.error("PG update merchant logo failed", err);
        throw err;
      }
    }

    const matchIdx = this.localDb.merchants.findIndex(m => m.email === email);
    if (matchIdx !== -1) {
      this.localDb.merchants[matchIdx].logo_url = logoUrl;
      this.saveLocalData();
      return { success: true };
    }
    return { success: false, error: "Merchant profile not found." };
  }

  public async addMerchantProduct(
    id: string,
    name: string,
    category: string,
    price: number,
    description: string,
    image: string,
    merchantBrand: string,
    merchantEmail: string,
    isDigital: boolean = false,
    tag: string = "Merchant Spec"
  ) {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO products (id, name, category, price, description, image, rating, rating_count, merchant_brand, merchant_email, is_digital, tag)
           VALUES ($1, $2, $3, $4, $5, $6, 4.5, 1, $7, $8, $9, $10)`,
          [id, name, category, price, description, image, merchantBrand, merchantEmail, isDigital, tag]
        );
        return { success: true };
      } catch (err) {
        console.error("PG insert merchant product failed", err);
        throw err;
      }
    }

    // Local DB update
    const newProduct: Product = {
      id,
      name,
      category,
      price,
      rating: 4.5,
      ratingCount: 1,
      description,
      image,
      merchantBrand,
      merchantEmail,
      isDigital,
      tag
    };

    this.localDb.products.unshift(newProduct);
    this.saveLocalData();
    return { success: true };
  }

  public async updateProductPrice(id: string, price: number, merchantEmail: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        const result = await this.pool.query(
          `UPDATE products SET price = $1 WHERE id = $2 AND merchant_email = $3`,
          [price, id, merchantEmail]
        );
        return { success: (result.rowCount ? result.rowCount > 0 : false) };
      } catch (err) {
        console.error("PG update product price failed", err);
        throw err;
      }
    }

    const matchIdx = this.localDb.products.findIndex(p => p.id === id && p.merchantEmail === merchantEmail);
    if (matchIdx !== -1) {
      this.localDb.products[matchIdx].price = price;
      this.saveLocalData();
      return { success: true };
    }
    return { success: false, error: "Product not located, or unauthorized." };
  }

  public async updateProduct(
    id: string,
    merchantEmail: string,
    name: string,
    category: string,
    price: number,
    description: string,
    isDigital: boolean,
    tag: string
  ) {
    if (this.isPostgresActive && this.pool) {
      try {
        const result = await this.pool.query(
          `UPDATE products 
           SET name = $1, category = $2, price = $3, description = $4, is_digital = $5, tag = $6 
           WHERE id = $7 AND merchant_email = $8`,
          [name, category, price, description, isDigital, tag, id, merchantEmail]
        );
        return { success: (result.rowCount ? result.rowCount > 0 : false) };
      } catch (err) {
        console.error("PG update product failed", err);
        throw err;
      }
    }

    const matchIdx = this.localDb.products.findIndex(p => p.id === id && p.merchantEmail === merchantEmail);
    if (matchIdx !== -1) {
      this.localDb.products[matchIdx] = {
        ...this.localDb.products[matchIdx],
        name,
        category,
        price,
        description,
        isDigital,
        tag
      };
      this.saveLocalData();
      return { success: true };
    }
    return { success: false, error: "Product not located, or unauthorized to edit." };
  }

  public async registerUser(
    email: string,
    name: string,
    password: string,
    role: "customer" | "merchant" | "rider",
    locality?: string,
    brand_name?: string
  ) {
    if (this.isPostgresActive && this.pool) {
      try {
        const check = await this.pool.query("SELECT email FROM users WHERE email = $1", [email]);
        if (check.rows.length > 0) {
          return { success: false, error: "Email already registered." };
        }
        await this.pool.query(
          `INSERT INTO users (email, name, password, role, locality, brand_name) VALUES ($1, $2, $3, $4, $5, $6)`,
          [email, name, password, role, locality || null, brand_name || null]
        );
        if (role === "merchant" && brand_name) {
          await this.pool.query(
            "INSERT INTO merchants (email, brand_name, description) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
            [email, brand_name, "Independent merchant store listed in NEXORA."]
          );
        }
        return { success: true, user: { email, name, role, locality, brandName: brand_name } };
      } catch (err: any) {
        console.error("PG register user failed", err);
        return { success: false, error: err.message };
      }
    }

    const exists = this.localDb.users.some(u => u.email === email);
    if (exists) {
      return { success: false, error: "Email already registered." };
    }
    const newUser = {
      email,
      name,
      password,
      role,
      locality,
      brand_name,
      created_at: new Date().toISOString()
    };
    this.localDb.users.push(newUser);
    if (role === "merchant" && brand_name) {
      const mExists = this.localDb.merchants.some(m => m.email === email);
      if (!mExists) {
        this.localDb.merchants.push({
          email,
          brand_name,
          description: "Independent merchant store listed in NEXORA.",
          created_at: new Date().toISOString()
        });
      }
    }
    this.saveLocalData();
    return { success: true, user: { email, name, role, locality, brandName: brand_name } };
  }

  public async loginUser(email: string, password: string) {
    if (this.isPostgresActive && this.pool) {
      try {
        const result = await this.pool.query(
          "SELECT email, name, password, role, locality, brand_name FROM users WHERE email = $1",
          [email]
        );
        if (result.rows.length === 0) {
          return { success: false, error: "User not found." };
        }
        const user = result.rows[0];
        if (user.password !== password) {
          return { success: false, error: "Incorrect credentials." };
        }
        return {
          success: true,
          user: {
            email: user.email,
            name: user.name,
            role: user.role,
            locality: user.locality,
            brandName: user.brand_name
          }
        };
      } catch (err: any) {
        console.error("PG login user failed", err);
        return { success: false, error: err.message };
      }
    }

    const user = this.localDb.users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: "User not found." };
    }
    if (user.password !== password) {
      return { success: false, error: "Incorrect credentials." };
    }
    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        locality: user.locality,
        brandName: user.brand_name
      }
    };
  }

  public async getAdminOverview() {
    let rawMerchants: any[] = [];
    let rawOrders: any[] = [];
    let rawDeliveries: any[] = [];
    let rawChats: any[] = [];

    if (this.isPostgresActive && this.pool) {
      try {
        const mRes = await this.pool.query("SELECT * FROM merchants ORDER BY created_at DESC");
        rawMerchants = mRes.rows;

        const oRes = await this.pool.query("SELECT * FROM orders ORDER BY order_date DESC");
        rawOrders = oRes.rows;

        const dRes = await this.pool.query("SELECT * FROM deliveries");
        rawDeliveries = dRes.rows;

        const cRes = await this.pool.query("SELECT * FROM chat_messages ORDER BY timestamp DESC");
        rawChats = cRes.rows;
      } catch (err) {
        console.error("PG dynamic admin fetch failed, falling back to localDb data", err);
        rawMerchants = this.localDb.merchants;
        rawOrders = this.localDb.orders;
        rawDeliveries = this.localDb.deliveries;
        rawChats = this.localDb.chat_messages;
      }
    } else {
      rawMerchants = this.localDb.merchants;
      rawOrders = this.localDb.orders;
      rawDeliveries = this.localDb.deliveries;
      rawChats = this.localDb.chat_messages;
    }

    // Process structured data
    const products = await this.getProducts();
    const merchants = rawMerchants.map(m => {
      const email = m.email;
      const brandName = m.brand_name || m.brandName;
      const mProducts = products.filter(p => p.merchantEmail === email);
      return {
        email,
        brandName,
        description: m.description,
        logoUrl: m.logo_url || m.logoUrl,
        productCount: mProducts.length,
        createdAt: m.created_at || m.createdAt || new Date().toISOString()
      };
    });

    const deliveriesMap = new Map();
    rawDeliveries.forEach(del => {
      const key = del.order_id || del.orderId;
      deliveriesMap.set(key, {
        orderId: key,
        riderId: del.rider_id || del.riderId,
        riderName: del.rider_name || del.riderName,
        vehicleType: del.vehicle_type || del.vehicleType,
        status: del.status,
        currentLat: parseFloat(del.current_lat || del.currentLat || "34.0522"),
        currentLng: parseFloat(del.current_lng || del.currentLng || "-118.2437"),
        targetLat: parseFloat(del.target_lat || del.targetLat || "34.0522"),
        targetLng: parseFloat(del.target_lng || del.targetLng || "-118.2437"),
        estimatedMinutes: parseInt(del.estimated_minutes || del.estimatedMinutes || "15", 10),
        lastUpdate: del.last_update || del.lastUpdate || new Date().toISOString()
      });
    });

    const ordersList = [];
    for (const ord of rawOrders) {
      const orderId = ord.id;
      let orderItemsList: any[] = [];
      
      if (this.isPostgresActive && this.pool) {
        try {
          const itemsRes = await this.pool.query(
            `SELECT oi.quantity, oi.unit_price, p.id as prod_id, p.name, p.category, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
          );
          orderItemsList = itemsRes.rows.map(row => ({
            id: row.prod_id,
            name: row.name,
            category: row.category,
            price: parseFloat(row.unit_price),
            image: row.image,
            quantity: row.quantity
          }));
        } catch (_) {
          orderItemsList = [];
        }
      }
      
      if (orderItemsList.length === 0) {
        const matchingItems = this.localDb.order_items.filter(oi => oi.order_id === orderId);
        orderItemsList = matchingItems.map(item => {
          const prod = products.find(p => p.id === item.product_id);
          return {
            id: item.product_id,
            name: prod?.name || "Premium Nexora Item",
            category: prod?.category || "Standard",
            price: item.unit_price,
            image: prod?.image || "",
            quantity: item.quantity
          };
        });
      }

      const delivery = deliveriesMap.get(orderId) || null;

      ordersList.push({
        id: orderId,
        userEmail: ord.user_email || ord.userEmail,
        date: ord.order_date || ord.orderDate || new Date().toISOString(),
        total: parseFloat(ord.total_amount || ord.totalAmount || "0"),
        shippingAddress: ord.shipping_address || ord.shippingAddress || "",
        paymentMethod: ord.payment_method || ord.paymentMethod || "Quantum-Pay",
        items: orderItemsList,
        delivery
      });
    }

    const customerEmails = new Set<string>();
    rawOrders.forEach(o => {
      const email = o.user_email || o.userEmail;
      if (email) customerEmails.add(email);
    });
    rawChats.forEach(c => {
      const email = c.user_email || c.userEmail;
      if (email) customerEmails.add(email);
    });

    if (customerEmails.size === 0) {
      customerEmails.add("fodhis1@gmail.com");
    }

    const customers = Array.from(customerEmails).map(email => {
      const userOrders = ordersList.filter(o => o.userEmail === email);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      const userChats = rawChats.filter(c => (c.user_email || c.userEmail) === email);
      const lastOrder = userOrders.length > 0 ? userOrders[0].date : null;

      return {
        email,
        totalOrders: userOrders.length,
        totalSpent,
        lastOrderDate: lastOrder,
        chatMessagesCount: userChats.length
      };
    });

    return {
      merchants,
      customers,
      orders: ordersList,
      deliveries: Array.from(deliveriesMap.values())
    };
  }

  public async assignDelivery(
    orderId: string,
    riderId: string,
    riderName: string,
    vehicleType: string,
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    estimatedMinutes: number
  ) {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO deliveries (order_id, rider_id, rider_name, vehicle_type, status, current_lat, current_lng, target_lat, target_lng, estimated_minutes, last_update)
           VALUES ($1, $2, $3, $4, 'assigned', $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (order_id) DO UPDATE SET 
             rider_id = EXCLUDED.rider_id, 
             rider_name = EXCLUDED.rider_name, 
             vehicle_type = EXCLUDED.vehicle_type, 
             status = EXCLUDED.status, 
             current_lat = EXCLUDED.current_lat, 
             current_lng = EXCLUDED.current_lng, 
             target_lat = EXCLUDED.target_lat, 
             target_lng = EXCLUDED.target_lng, 
             estimated_minutes = EXCLUDED.estimated_minutes, 
             last_update = NOW()`,
          [orderId, riderId, riderName, vehicleType, currentLat, currentLng, targetLat, targetLng, estimatedMinutes]
        );
        return { success: true };
      } catch (err) {
        console.error("PG assign delivery failed", err);
        throw err;
      }
    }

    const matchIdx = this.localDb.deliveries.findIndex(d => d.order_id === orderId);
    const delivery = {
      order_id: orderId,
      rider_id: riderId,
      rider_name: riderName,
      vehicle_type: vehicleType,
      status: "assigned",
      current_lat: currentLat,
      current_lng: currentLng,
      target_lat: targetLat,
      target_lng: targetLng,
      estimated_minutes: estimatedMinutes,
      last_update: new Date().toISOString()
    };

    if (matchIdx !== -1) {
      this.localDb.deliveries[matchIdx] = delivery;
    } else {
      this.localDb.deliveries.push(delivery);
    }
    this.saveLocalData();
    return { success: true };
  }

  public async updateDeliveryStatus(
    orderId: string,
    status: string,
    currentLat: number,
    currentLng: number,
    estimatedMinutes: number
  ) {
    if (this.isPostgresActive && this.pool) {
      try {
        await this.pool.query(
          `UPDATE deliveries SET 
             status = $1, 
             current_lat = $2, 
             current_lng = $3, 
             estimated_minutes = $4, 
             last_update = NOW() 
           WHERE order_id = $5`,
          [status, currentLat, currentLng, estimatedMinutes, orderId]
        );
        return { success: true };
      } catch (err) {
        console.error("PG update delivery failed", err);
        throw err;
      }
    }

    const matchIdx = this.localDb.deliveries.findIndex(d => d.order_id === orderId);
    if (matchIdx !== -1) {
      this.localDb.deliveries[matchIdx].status = status;
      this.localDb.deliveries[matchIdx].current_lat = currentLat;
      this.localDb.deliveries[matchIdx].current_lng = currentLng;
      this.localDb.deliveries[matchIdx].estimated_minutes = estimatedMinutes;
      this.localDb.deliveries[matchIdx].last_update = new Date().toISOString();
      this.saveLocalData();
      return { success: true };
    }
    return { success: false, error: "Delivery not found for update" };
  }
}

export const db = new DatabaseManager();
