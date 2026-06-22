import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db } from "./server/db";

// Ensure local environment binds correctly if needed
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the Google Gemini API client lazily and safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint: Database status disclosure API
app.get("/api/db-status", (req, res) => {
  try {
    const status = db.getModeInfo();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoint: Run database connection diagnostic test
app.get("/api/db-test", async (req, res) => {
  try {
    const diagnostic = await db.testConnection();
    res.json(diagnostic);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Endpoint: Read database table statistics
app.get("/api/db-stats", async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch database table stats.", details: err.message });
  }
});

// API Endpoint: Get the products catalog sorted from DB
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to grab products catalogs.", details: err.message });
  }
});

// API Endpoint: Get user's cart items from DB
app.get("/api/cart", async (req, res) => {
  try {
    const userEmail = (req.query.email as string) || "fodhis1@gmail.com";
    const items = await db.getCartItems(userEmail);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get cart items.", details: err.message });
  }
});

// API Endpoint: Add item to user's cart in DB
app.post("/api/cart", async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!productId) {
      res.status(400).json({ error: "Product ID is missing." });
      return;
    }
    const qty = parseInt(quantity, 10) || 1;
    await db.addCartItem(userEmail, productId, qty);
    res.json({ success: true, message: "Item added to DB cart." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add cart items.", details: err.message });
  }
});

// API Endpoint: Update quantity of a product in DB cart
app.post("/api/cart/update", async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!productId || quantity === undefined) {
       res.status(400).json({ error: "Product ID or quantity is missing." });
       return;
    }
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      await db.removeCartItem(userEmail, productId);
    } else {
      await db.updateCartItemQuantity(userEmail, productId, qty);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update quantity.", details: err.message });
  }
});

// API Endpoint: Remove item from DB cart
app.post("/api/cart/remove", async (req, res) => {
  try {
    const { email, productId } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!productId) {
      res.status(400).json({ error: "Product ID is required." });
      return;
    }
    await db.removeCartItem(userEmail, productId);
    res.json({ success: true, message: "Item deleted from DB cart." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete from DB cart.", details: err.message });
  }
});

// API Endpoint: Clear entire DB cart
app.post("/api/cart/clear", async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    await db.clearCart(userEmail);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to clear DB cart.", details: err.message });
  }
});

// API Endpoint: Get user's wishlist IDs
app.get("/api/wishlist", async (req, res) => {
  try {
    const userEmail = (req.query.email as string) || "fodhis1@gmail.com";
    const ids = await db.getWishlist(userEmail);
    res.json(ids);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get wishlist.", details: err.message });
  }
});

// API Endpoint: Toggle wishlist item in DB
app.post("/api/wishlist/toggle", async (req, res) => {
  try {
    const { email, productId } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!productId) {
       res.status(400).json({ error: "Product ID is requested" });
       return;
    }
    const added = await db.toggleWishlist(userEmail, productId);
    res.json({ success: true, added });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to toggle wishlist.", details: err.message });
  }
});

// API Endpoint: Get order registry receipts
app.get("/api/orders", async (req, res) => {
  try {
    const userEmail = (req.query.email as string) || "fodhis1@gmail.com";
    const list = await db.getOrders(userEmail);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch purchase log.", details: err.message });
  }
});

// API Endpoint: Create custom order receipts
app.post("/api/orders/checkout", async (req, res) => {
  try {
    const { email, total, shippingAddress, paymentMethod, items } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!total || !items || !Array.isArray(items) || items.length === 0) {
       res.status(400).json({ error: "Checkout items are empty." });
       return;
    }
    const results = await db.createOrder(
      userEmail,
      parseFloat(total),
      shippingAddress || "Main Workspace Sector",
      paymentMethod || "Smart Pay Integration",
      items
    );
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to compile checks.", details: err.message });
  }
});

// API Endpoint: Get merchant profile
app.get("/api/merchant", async (req, res) => {
  try {
    const email = (req.query.email as string) || "fodhis1@gmail.com";
    const merchant = await db.getMerchant(email);
    res.json(merchant);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to grab merchant profile.", details: err.message });
  }
});

// API Endpoint: Register merchant
app.post("/api/merchant/register", async (req, res) => {
  try {
    const { email, brandName, description, logoUrl } = req.body;
    if (!email || !brandName) {
      res.status(400).json({ error: "Email and Brand Name are required." });
      return;
    }
    const result = await db.registerMerchant(email, brandName, description || "", logoUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to register merchant profile.", details: err.message });
  }
});

// API Endpoint: Update merchant brand logo
app.post("/api/merchant/update-logo", async (req, res) => {
  try {
    const { email, logoUrl } = req.body;
    if (!email || !logoUrl) {
      res.status(400).json({ error: "Email and logo URL are required." });
      return;
    }
    const result = await db.updateMerchantLogo(email, logoUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update merchant logo.", details: err.message });
  }
});

// API Endpoint: Admin Panel overview dashboard diagnostics
app.get("/api/admin/overview", async (req, res) => {
  try {
    const overview = await db.getAdminOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve administrative diagnostics.", details: err.message });
  }
});

// API Endpoint: Admin Panel delivery rider assignment
app.post("/api/admin/assign-delivery", async (req, res) => {
  try {
    const { orderId, riderId, riderName, vehicleType, currentLat, currentLng, targetLat, targetLng, estimatedMinutes } = req.body;
    if (!orderId || !riderId) {
      res.status(400).json({ error: "Missing required properties." });
      return;
    }
    const result = await db.assignDelivery(
      orderId,
      riderId,
      riderName || "Nexus Agent",
      vehicleType || "Quantum Speedster",
      parseFloat(currentLat || "34.0522"),
      parseFloat(currentLng || "-118.2437"),
      parseFloat(targetLat || "34.0522"),
      parseFloat(targetLng || "-118.2437"),
      parseInt(estimatedMinutes || "15", 10)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to assign rider to delivery.", details: err.message });
  }
});

// API Endpoint: Admin Panel delivery status update simulation
app.post("/api/admin/update-delivery", async (req, res) => {
  try {
    const { orderId, status, currentLat, currentLng, estimatedMinutes } = req.body;
    if (!orderId || !status) {
      res.status(400).json({ error: "Order ID and status are required." });
      return;
    }
    const result = await db.updateDeliveryStatus(
      orderId,
      status,
      parseFloat(currentLat),
      parseFloat(currentLng),
      parseInt(estimatedMinutes, 10)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update delivery progress.", details: err.message });
  }
});

// API Endpoint: Add a product from a merchant (ware)
app.post("/api/merchant/product", async (req, res) => {
  try {
    const { name, category, price, description, image, merchantBrand, merchantEmail, isDigital, tag } = req.body;
    if (!name || !category || !price || !merchantBrand || !merchantEmail) {
      res.status(400).json({ error: "Required product fields are missing." });
      return;
    }
    const id = "prod-" + Math.floor(100000 + Math.random() * 900000);
    const result = await db.addMerchantProduct(
      id,
      name,
      category,
      parseFloat(price),
      description || "A pristine premium ware provided by our partner merchant.",
      image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      merchantBrand,
      merchantEmail,
      !!isDigital,
      tag || "Merchant Spec"
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create merchant product.", details: err.message });
  }
});

// API Endpoint: Update merchant product price
app.post("/api/merchant/product/update-price", async (req, res) => {
  try {
    const { id, price, email } = req.body;
    if (!id || price === undefined || !email) {
      res.status(400).json({ error: "Missing required properties." });
      return;
    }
    const result = await db.updateProductPrice(id, parseFloat(price), email);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update product price.", details: err.message });
  }
});

// API Endpoint: User registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password, role, locality, brandName } = req.body;
    if (!email || !name || !password || !role) {
      res.status(400).json({ error: "Please details all required properties: email, name, password, role." });
      return;
    }
    const result = await db.registerUser(email, name, password, role, locality, brandName);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to register user.", details: err.message });
  }
});

// API Endpoint: User login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Please enter your email and password." });
      return;
    }
    const result = await db.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to log in.", details: err.message });
  }
});

// API Endpoint: Retrieve chats histories
app.get("/api/chats", async (req, res) => {
  try {
    const userEmail = (req.query.email as string) || "fodhis1@gmail.com";
    const chats = await db.getChatHistory(userEmail);
    res.json(chats);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get chat timeline history.", details: err.message });
  }
});

// API Endpoint: Smart AI Shopping Recommendations with persistent chat log
app.post("/api/recommend", async (req, res) => {
  try {
    const { message, chatHistory, email } = req.body;
    const userEmail = email || "fodhis1@gmail.com";
    if (!message) {
       res.status(400).json({ error: "Message is required." });
       return;
    }

    // Persist the user's message in the DB
    await db.addChatMessage(userEmail, "user", message);

    const ai = getGeminiClient();
    const products = await db.getProducts();

    if (!ai) {
      const simulatedResponse = `### Greetings from Nexora AI! 🌟\n\nI see you're interested in shopping with Nexora! (To enable live, smart AI suggestions, please add your **GEMINI_API_KEY** in the Secrets panel).\n\nBased on our current high-tech catalog, I highly recommend standard highlights:\n1. **Nexora Smart Watch Pro** ($199.99) - A best-selling physical stress analyzer with a holographic display.\n2. **Vortex Running Shoes** ($129.99) - Made with dynamic carbon-propulsion loops and shock absorbers.\n3. **Wireless Earbuds** ($79.99) - Offering space-grade acoustics and heavy noise isolation.\n\nTell me what type of accessories or products you are styling, and I will happily filter the choices for you!`;
      
      // Persist the assistant message too!
      await db.addChatMessage(userEmail, "assistant", simulatedResponse);

      res.json({
        response: simulatedResponse,
        isOfflineMode: true,
      });
      return;
    }

    // Format catalog for Gemini from Database records
    const catalogString = products.map(p => 
      `- ID: "${p.id}", Name: "${p.name}", Category: "${p.category}", Price: $${p.price}, Rating: ${p.rating}, Description: "${p.description}"`
    ).join("\n");

    const systemInstruction = `You are Nexora AI, a friendly, extremely helpful, and stylish futuristic AI Shopping Assistant for Nexora.
Nexora is a cutting-edge electronic, fashion, lifestyle, and beauty e-commerce store.

Here is the exact live products inventory under catalog:
${catalogString}

Your goal is to guide the user to make the perfect purchase. Keep your tone sophisticated, modern, and engaging ("futuristic, cyber-luxe style"). 

IMPORTANT GUIDELINES:
1. Always suggest actual items from the catalog whenever applicable. Refrain from inventing non-existent items.
2. Format your recommendations clearly with bold titles, clean lists, and prices.
3. If they ask generic questions, suggest 2-3 products that fit best.
4. Keep answers concise, highly scannable, and styled beautifully using markdown formatting (no HTML).
5. Encourage them to add things to their cart or explore categories!`;

    // Compile historical chat format if provided
    const formattedContents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }
    // Append the current message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I was unable to formulate a response. How else may I assist you today?";
    
    // Persist model assistant response in SQL Database too!
    await db.addChatMessage(userEmail, "assistant", replyText);

    res.json({ response: replyText, isOfflineMode: false });

  } catch (error: any) {
    console.error("Gemini API server route error:", error);
    res.status(500).json({ 
      error: "Failed to connect to the smart shopping core.",
      details: error.message 
    });
  }
});

// Configure Vite middleware in development vs static express server in build/production mode
async function bootstrap() {
  // Initialize Database tables and schemas before booting
  try {
    await db.init();
    console.log("🎒 Relational Database Schema is fully synchronous.");
  } catch (dbErr) {
    console.error("🧰 Warning: Database bootstrapping triggered error:", dbErr);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from dist/ directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexora backend server is listening at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failure while starting Nexora backend server:", err);
});
