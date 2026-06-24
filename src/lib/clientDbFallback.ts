import { PRODUCTS, Product } from "../data/products";
import { CartItem, ChatMessage } from "../types";

// Detect if we are running in a static deployment (like Vercel, GitHub Pages, Netlify)
// where a custom express server does not run, and fetch API endpoints would 404.
export const isStaticClientOnly = 
  window.location.hostname.includes("vercel") ||
  window.location.hostname.includes("github.io") ||
  window.location.hostname.includes("netlify") ||
  window.location.hostname.includes("pages") ||
  window.location.hostname.includes("amplify") ||
  window.location.hostname.includes("render.com");

// Initialize localStorage databases if they do not exist
const initLocalStorage = () => {
  if (!localStorage.getItem("nexora_local_products")) {
    localStorage.setItem("nexora_local_products", JSON.stringify(PRODUCTS));
  }
  if (!localStorage.getItem("nexora_local_cart")) {
    localStorage.setItem("nexora_local_cart", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_wishlist")) {
    localStorage.setItem("nexora_local_wishlist", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_orders")) {
    localStorage.setItem("nexora_local_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_merchants")) {
    localStorage.setItem("nexora_local_merchants", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_chats")) {
    localStorage.setItem("nexora_local_chats", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_deliveries")) {
    localStorage.setItem("nexora_local_deliveries", JSON.stringify([]));
  }
  if (!localStorage.getItem("nexora_local_users")) {
    // Populate an initial default user matching USER_EMAIL context
    localStorage.setItem("nexora_local_users", JSON.stringify([
      {
        email: "fodhis1@gmail.com",
        name: "Fodhis User",
        password: "password123",
        role: "customer",
        created_at: new Date().toISOString()
      }
    ]));
  }
};

// Execute initialization
if (typeof window !== "undefined") {
  initLocalStorage();
}

// Client Database Simulator
export const clientDb = {
  getProducts(): Product[] {
    try {
      return JSON.parse(localStorage.getItem("nexora_local_products") || "[]");
    } catch {
      return PRODUCTS;
    }
  },

  saveProducts(prods: Product[]) {
    localStorage.setItem("nexora_local_products", JSON.stringify(prods));
  },

  addMerchantProduct(prod: Partial<Product>) {
    const prods = this.getProducts();
    const newProd: Product = {
      id: prod.id || "prod-" + Math.floor(100000 + Math.random() * 900000),
      name: prod.name || "Default Ware",
      category: prod.category || "Electronics",
      price: prod.price || 0,
      rating: 4.5,
      ratingCount: 1,
      description: prod.description || "A pristine premium ware.",
      image: prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      merchantBrand: prod.merchantBrand || "Independent Merchant",
      merchantEmail: prod.merchantEmail || "fodhis1@gmail.com"
    };
    prods.unshift(newProd);
    this.saveProducts(prods);
    return newProd;
  },

  updateProductPrice(id: string, price: number, email: string) {
    const prods = this.getProducts();
    const match = prods.find(p => p.id === id && p.merchantEmail === email);
    if (match) {
      match.price = price;
      this.saveProducts(prods);
      return { success: true };
    }
    return { success: false, error: "Product not located." };
  },

  getCart(email: string): CartItem[] {
    try {
      const allCarts = JSON.parse(localStorage.getItem("nexora_local_cart") || "[]");
      return allCarts.filter((item: any) => item.email === email);
    } catch {
      return [];
    }
  },

  addCartItem(email: string, productId: string, quantity: number) {
    try {
      const allCarts = JSON.parse(localStorage.getItem("nexora_local_cart") || "[]");
      const products = this.getProducts();
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existingIdx = allCarts.findIndex((item: any) => item.email === email && item.id === productId);
      if (existingIdx !== -1) {
        allCarts[existingIdx].quantity += quantity;
      } else {
        allCarts.push({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          quantity,
          email
        });
      }
      localStorage.setItem("nexora_local_cart", JSON.stringify(allCarts));
    } catch (e) {
      console.error(e);
    }
  },

  updateCartItemQuantity(email: string, productId: string, quantity: number) {
    try {
      let allCarts = JSON.parse(localStorage.getItem("nexora_local_cart") || "[]");
      if (quantity <= 0) {
        allCarts = allCarts.filter((item: any) => !(item.email === email && item.id === productId));
      } else {
        const item = allCarts.find((item: any) => item.email === email && item.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      localStorage.setItem("nexora_local_cart", JSON.stringify(allCarts));
    } catch (e) {
      console.error(e);
    }
  },

  removeCartItem(email: string, productId: string) {
    try {
      let allCarts = JSON.parse(localStorage.getItem("nexora_local_cart") || "[]");
      allCarts = allCarts.filter((item: any) => !(item.email === email && item.id === productId));
      localStorage.setItem("nexora_local_cart", JSON.stringify(allCarts));
    } catch (e) {
      console.error(e);
    }
  },

  clearCart(email: string) {
    try {
      let allCarts = JSON.parse(localStorage.getItem("nexora_local_cart") || "[]");
      allCarts = allCarts.filter((item: any) => item.email !== email);
      localStorage.setItem("nexora_local_cart", JSON.stringify(allCarts));
    } catch (e) {
      console.error(e);
    }
  },

  getWishlist(email: string): string[] {
    try {
      const allWishlists = JSON.parse(localStorage.getItem("nexora_local_wishlist") || "[]");
      return allWishlists
        .filter((item: any) => item.email === email)
        .map((item: any) => item.productId);
    } catch {
      return [];
    }
  },

  toggleWishlist(email: string, productId: string) {
    try {
      let allWishlists = JSON.parse(localStorage.getItem("nexora_local_wishlist") || "[]");
      const existsIdx = allWishlists.findIndex((item: any) => item.email === email && item.productId === productId);
      if (existsIdx !== -1) {
        allWishlists.splice(existsIdx, 1);
      } else {
        allWishlists.push({ email, productId });
      }
      localStorage.setItem("nexora_local_wishlist", JSON.stringify(allWishlists));
    } catch (e) {
      console.error(e);
    }
  },

  getOrders(email: string): any[] {
    try {
      const allOrders = JSON.parse(localStorage.getItem("nexora_local_orders") || "[]");
      const deliveries = this.getDeliveries();
      return allOrders
        .filter((item: any) => item.userEmail === email)
        .map((order: any) => ({
          ...order,
          delivery: deliveries.find((d: any) => d.orderId === order.id) || null
        }));
    } catch {
      return [];
    }
  },

  checkout(email: string, total: number, shippingAddress: string, paymentMethod: string, items: any[]) {
    try {
      const allOrders = JSON.parse(localStorage.getItem("nexora_local_orders") || "[]");
      const newOrderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: newOrderId,
        userEmail: email,
        date: new Date().toISOString(),
        total,
        shippingAddress,
        paymentMethod,
        items
      };
      allOrders.unshift(newOrder);
      localStorage.setItem("nexora_local_orders", JSON.stringify(allOrders));
      this.clearCart(email);
      return { success: true, orderId: newOrderId };
    } catch {
      return { success: false, orderId: "" };
    }
  },

  getMerchant(email: string): any {
    try {
      const allMerchants = JSON.parse(localStorage.getItem("nexora_local_merchants") || "[]");
      return allMerchants.find((m: any) => m.email === email) || null;
    } catch {
      return null;
    }
  },

  registerMerchant(email: string, brandName: string, description: string, logoUrl?: string) {
    try {
      const allMerchants = JSON.parse(localStorage.getItem("nexora_local_merchants") || "[]");
      const existsIdx = allMerchants.findIndex((m: any) => m.email === email);
      const merch = { email, brandName, description, logoUrl, createdAt: new Date().toISOString() };
      if (existsIdx !== -1) {
        allMerchants[existsIdx] = merch;
      } else {
        allMerchants.push(merch);
      }
      localStorage.setItem("nexora_local_merchants", JSON.stringify(allMerchants));
      return merch;
    } catch {
      return null;
    }
  },

  updateMerchantLogo(email: string, logoUrl: string) {
    try {
      const allMerchants = JSON.parse(localStorage.getItem("nexora_local_merchants") || "[]");
      const match = allMerchants.find((m: any) => m.email === email);
      if (match) {
        match.logoUrl = logoUrl;
        localStorage.setItem("nexora_local_merchants", JSON.stringify(allMerchants));
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  },

  getAdminOverview(): any {
    try {
      const allMerchants = JSON.parse(localStorage.getItem("nexora_local_merchants") || "[]");
      const allOrders = JSON.parse(localStorage.getItem("nexora_local_orders") || "[]");
      const allDeliveries = this.getDeliveries();
      
      const emailCounts: Record<string, number> = {};
      const customersMap: Record<string, any> = {};

      const products = this.getProducts();

      // Merchants with computed listing numbers
      const merchantsList = allMerchants.map((m: any) => {
        const count = products.filter(p => p.merchantEmail === m.email).length;
        return {
          email: m.email,
          brandName: m.brandName,
          description: m.description,
          logoUrl: m.logoUrl,
          productCount: count,
          createdAt: m.createdAt
        };
      });

      // Default merchant lists if empty
      if (merchantsList.length === 0) {
        merchantsList.push({
          email: "merchant@nexora.com",
          brandName: "Nexora Core Labs",
          description: "Default high-tech developer specifications.",
          productCount: products.filter(p => !p.merchantEmail).length,
          createdAt: new Date().toISOString()
        });
      }

      // Populate unique customer logs
      allOrders.forEach((o: any) => {
        if (!customersMap[o.userEmail]) {
          customersMap[o.userEmail] = {
            email: o.userEmail,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: o.date,
            chatMessagesCount: this.getChats(o.userEmail).length
          };
        }
        const cust = customersMap[o.userEmail];
        cust.totalOrders += 1;
        cust.totalSpent += o.total;
        if (new Date(o.date) > new Date(cust.lastOrderDate)) {
          cust.lastOrderDate = o.date;
        }
      });

      const customersList = Object.values(customersMap);
      if (customersList.length === 0) {
        customersList.push({
          email: "fodhis1@gmail.com",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          chatMessagesCount: this.getChats("fodhis1@gmail.com").length
        });
      }

      const ordersWithDeliveries = allOrders.map((order: any) => ({
        ...order,
        delivery: allDeliveries.find((d: any) => d.orderId === order.id) || null
      }));

      return {
        merchants: merchantsList,
        customers: customersList,
        orders: ordersWithDeliveries,
        deliveries: allDeliveries
      };
    } catch {
      return { merchants: [], customers: [], orders: [], deliveries: [] };
    }
  },

  getDeliveries(): any[] {
    try {
      return JSON.parse(localStorage.getItem("nexora_local_deliveries") || "[]");
    } catch {
      return [];
    }
  },

  assignDelivery(orderId: string, riderId: string, riderName: string, vehicleType: string, currentLat: number, currentLng: number, targetLat: number, targetLng: number, estimatedMinutes: number) {
    try {
      const allDeliveries = this.getDeliveries();
      const existingIdx = allDeliveries.findIndex((d: any) => d.orderId === orderId);
      const delivery = {
        orderId,
        riderId,
        riderName,
        vehicleType,
        status: "assigned",
        currentLat,
        currentLng,
        targetLat,
        targetLng,
        estimatedMinutes,
        lastUpdate: new Date().toISOString()
      };
      if (existingIdx !== -1) {
        allDeliveries[existingIdx] = delivery;
      } else {
        allDeliveries.push(delivery);
      }
      localStorage.setItem("nexora_local_deliveries", JSON.stringify(allDeliveries));
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  updateDelivery(orderId: string, status: string, currentLat: number, currentLng: number, estimatedMinutes: number) {
    try {
      const allDeliveries = this.getDeliveries();
      const match = allDeliveries.find((d: any) => d.orderId === orderId);
      if (match) {
        match.status = status;
        match.currentLat = currentLat;
        match.currentLng = currentLng;
        match.estimatedMinutes = estimatedMinutes;
        match.lastUpdate = new Date().toISOString();
        localStorage.setItem("nexora_local_deliveries", JSON.stringify(allDeliveries));
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  },

  getChats(email: string): ChatMessage[] {
    try {
      const allChats = JSON.parse(localStorage.getItem("nexora_local_chats") || "[]");
      return allChats
        .filter((c: any) => c.email === email)
        .map((c: any) => ({
          id: c.id,
          role: c.role,
          content: c.content,
          timestamp: c.timestamp
        }));
    } catch {
      return [];
    }
  },

  addChatMessage(email: string, role: string, content: string) {
    try {
      const allChats = JSON.parse(localStorage.getItem("nexora_local_chats") || "[]");
      allChats.push({
        id: "msg-" + Math.floor(10000 + Math.random() * 90000),
        email,
        role,
        content,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("nexora_local_chats", JSON.stringify(allChats));
    } catch (e) {
      console.error(e);
    }
  },

  registerUser(email: string, name: string, password: string, role: "customer" | "merchant" | "rider" | "admin", locality?: string, brandName?: string) {
    try {
      const allUsers = JSON.parse(localStorage.getItem("nexora_local_users") || "[]");
      const exists = allUsers.some((u: any) => u.email === email);
      if (exists) {
        return { success: false, error: "Email already registered." };
      }
      const newUser = {
        email,
        name,
        password,
        role,
        locality,
        brand_name: brandName,
        created_at: new Date().toISOString()
      };
      allUsers.push(newUser);
      localStorage.setItem("nexora_local_users", JSON.stringify(allUsers));
      
      if (role === "merchant" && brandName) {
        this.registerMerchant(email, brandName, "Independent merchant store listed in NEXORA.");
      }
      return { success: true, user: { email, name, role, locality, brandName } };
    } catch {
      return { success: false, error: "Database registration failure." };
    }
  },

  loginUser(email: string, password: string) {
    try {
      const allUsers = JSON.parse(localStorage.getItem("nexora_local_users") || "[]");
      const user = allUsers.find((u: any) => u.email === email);
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
    } catch {
      return { success: false, error: "Database verification failure." };
    }
  }
};

// High-fidelity fetch API proxy patcher
export const applyFetchPatch = () => {
  if (typeof window === "undefined" || !isStaticClientOnly) return;

  const originalFetch = window.fetch;

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    // Only intercept requests directed to our API routes
    if (!urlStr.includes("/api/")) {
      return originalFetch(input, init);
    }

    try {
      const url = new URL(urlStr, window.location.origin);
      const path = url.pathname;
      const method = init?.method?.toUpperCase() || "GET";
      const params = url.searchParams;

      // Inline Helper to simulate valid Response object
      const jsonResponse = (data: any, status = 200) => {
        return Promise.resolve(new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" }
        }));
      };

      // Intercept `/api/db-status`
      if (path === "/api/db-status") {
        return jsonResponse({
          success: true,
          mode: "Independent Static Cache (Offline First)",
          isPostgres: false,
          info: "Aesthetics synchronized statically on Vercel deployment."
        });
      }

      // Intercept user authentication routing
      if (path === "/api/auth/register" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.registerUser(body.email, body.name, body.password, body.role, body.locality, body.brandName);
        return jsonResponse(result);
      }

      if (path === "/api/auth/login" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.loginUser(body.email, body.password);
        return jsonResponse(result);
      }

      // Intercept `/api/products` (GET, POST)
      if (path === "/api/products" && method === "GET") {
        const prods = clientDb.getProducts();
        return jsonResponse(prods);
      }

      if (path === "/api/merchant/product" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const newProd = clientDb.addMerchantProduct(body);
        return jsonResponse({ success: true, product: newProd });
      }

      if (path === "/api/merchant/product/update-price" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.updateProductPrice(body.id, body.price, body.email);
        return jsonResponse(result);
      }

      // Intercept `/api/cart`
      if (path === "/api/cart") {
        const email = params.get("email") || "fodhis1@gmail.com";
        if (method === "GET") {
          return jsonResponse(clientDb.getCart(email));
        } else if (method === "POST" && init?.body) {
          const body = JSON.parse(init.body as string);
          clientDb.addCartItem(body.email || email, body.productId, body.quantity || 1);
          return jsonResponse({ success: true });
        }
      }

      if (path === "/api/cart/update" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        clientDb.updateCartItemQuantity(body.email || "fodhis1@gmail.com", body.productId, body.quantity);
        return jsonResponse({ success: true });
      }

      if (path === "/api/cart/remove" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        clientDb.removeCartItem(body.email || "fodhis1@gmail.com", body.productId);
        return jsonResponse({ success: true });
      }

      if (path === "/api/cart/clear" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        clientDb.clearCart(body.email || "fodhis1@gmail.com");
        return jsonResponse({ success: true });
      }

      // Intercept `/api/wishlist`
      if (path === "/api/wishlist" && method === "GET") {
        const email = params.get("email") || "fodhis1@gmail.com";
        return jsonResponse(clientDb.getWishlist(email));
      }

      if (path === "/api/wishlist/toggle" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        clientDb.toggleWishlist(body.email || "fodhis1@gmail.com", body.productId);
        return jsonResponse({ success: true });
      }

      // Intercept `/api/orders`
      if (path === "/api/orders") {
        const email = params.get("email") || "fodhis1@gmail.com";
        return jsonResponse(clientDb.getOrders(email));
      }

      if (path === "/api/orders/checkout" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.checkout(body.email || "fodhis1@gmail.com", body.total, body.shippingAddress, body.paymentMethod, body.items);
        return jsonResponse(result);
      }

      // Intercept `/api/merchant`
      if (path === "/api/merchant" && method === "GET") {
        const email = params.get("email") || "fodhis1@gmail.com";
        const merchant = clientDb.getMerchant(email);
        if (merchant) {
          return jsonResponse(merchant);
        } else {
          return jsonResponse(null, 200); // 200 with null is typical for our server
        }
      }

      if (path === "/api/merchant/register" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.registerMerchant(body.email, body.brandName, body.description, body.logoUrl);
        return jsonResponse(result);
      }

      if (path === "/api/merchant/update-logo" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.updateMerchantLogo(body.email, body.logoUrl);
        return jsonResponse(result);
      }

      // Intercept `/api/admin`
      if (path === "/api/admin/overview" && method === "GET") {
        return jsonResponse(clientDb.getAdminOverview());
      }

      if (path === "/api/admin/assign-delivery" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.assignDelivery(
          body.orderId,
          body.riderId,
          body.riderName,
          body.vehicleType,
          body.currentLat,
          body.currentLng,
          body.targetLat,
          body.targetLng,
          body.estimatedMinutes
        );
        return jsonResponse(result);
      }

      if (path === "/api/admin/update-delivery" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const result = clientDb.updateDelivery(
          body.orderId,
          body.status,
          body.currentLat,
          body.currentLng,
          body.estimatedMinutes
        );
        return jsonResponse(result);
      }

      // Intercept `/api/chats`
      if (path === "/api/chats" && method === "GET") {
        const email = params.get("email") || "fodhis1@gmail.com";
        return jsonResponse(clientDb.getChats(email));
      }

      // Intercept chatbot and AI summaries
      if (path === "/api/recommend" && method === "POST" && init?.body) {
        const body = JSON.parse(init.body as string);
        const email = body.email || "fodhis1@gmail.com";
        const message = body.message || "";
        
        clientDb.addChatMessage(email, "user", message);

        const simulatedResponse = `### Greetings from Nexora AI! 🌟\n\nI see you're interested in shopping in Nexora. I'm operating in standalone secure client-cache mode since we are hosting this beautifully in a static edge cloud context!\n\nHere are some highlights customized for your high-tech vibe from our catalog:\n1. **Nexora Smart Watch Pro** ($199.99) - A best-seller equipped with high-performance biometric nodes.\n2. **Vortex Running Shoes** ($129.99) - Made with active gravity-propulsion core foam.\n3. **Luma Desk Lamp** ($89.99) - A gorgeous adaptive illumination dock.\n\nLet me know how else I can assist your cyberware configurations today!`;
        
        clientDb.addChatMessage(email, "assistant", simulatedResponse);

        return jsonResponse({
          response: simulatedResponse,
          isOfflineMode: true
        });
      }

      // Default fallback if some other API gets matches
      return jsonResponse({ success: true, message: "Standard proxy fallback" });

    } catch (e: any) {
      console.warn("API override proxy intercepted an error. Delegating to native:", e);
      return originalFetch(input, init);
    }
  };
};
