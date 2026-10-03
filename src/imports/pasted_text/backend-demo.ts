/* Single-file demo backend for Paithani (Node + TypeScript)
   - In-memory "DB" (Maps) for Users, Products, Orders, EmailTokens
   - JWT auth (bcrypt), role-based ADMIN/USER
   - Products CRUD (admin-protected where needed)
   - Orders creation (computes total from product prices) and listing
   - Stripe PaymentIntent integration if STRIPE_SECRET_KEY is set, otherwise simulated
   - SendGrid email sending if SENDGRID_API_KEY is set, otherwise console log
   - Email short-lived single-use token flow:
     - POST /email/send-order-link  (ADMIN) -> creates EmailToken, sends link
     - GET  /email/validate?token=..   -> checks token validity
     - POST /email/consume  (ADMIN + matching email) -> consumes token and returns order
   - Webhook: POST /webhook/stripe raw body handler
   - Health: GET /_health
   Notes:
   - Persistence: in-memory only. Use a real DB (Postgres/Prisma/Mongo) for production.
   - To run: npm install express helmet cors express-rate-limit body-parser bcrypt jsonwebtoken stripe @sendgrid/mail
     then run with ts-node / ts-node-dev or compile with tsc.
*/

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const STRIPE_PACKAGE_AVAILABLE = true;
let Stripe: any = undefined;
try {
  // lazy import (so package optional)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Stripe = require("stripe");
} catch (e) {
  // stripe not installed
  // continue without throwing; createPaymentIntent will fallback
}

const SG_PACKAGE_AVAILABLE = true;
let sgMail: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sgMail = require("@sendgrid/mail");
} catch (e) {
  // sendgrid not installed
}

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({ origin: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

// JSON parser for normal routes
app.use(express.json());

// Types / In-memory stores

type Role = "USER" | "ADMIN";
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: Role;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  priceCents: number;
  sku?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELED";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceCents: number;
}

interface Order {
  id: string;
  userId: string;
  totalCents: number;
  currency: string;
  stripePaymentId?: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

interface EmailToken {
  id: string;
  token: string;
  recipientEmail: string;
  orderId?: string;
  used: boolean;
  expiresAt: string; // ISO
  createdAt: string;
}

// Simple ID generator using crypto.randomUUID (Node >= 14.17.0)
function id(prefix = "") {
  return prefix + crypto.randomUUID();
}

// In-memory maps (replace with DB in production)
const users = new Map<string, User>();
const products = new Map<string, Product>();
const orders = new Map<string, Order>();
const emailTokens = new Map<string, EmailToken>();

// Config from env
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const EMAIL_LINK_SECRET = process.env.EMAIL_LINK_SECRET || "email-link-secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = Number(process.env.PORT || 4000);
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com";

// Initialize optional libs
const stripeClient = (Stripe && STRIPE_SECRET_KEY) ? new (Stripe as any)(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" }) : null;
if (sgMail && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Middleware: Auth
interface AuthRequest extends Request {
  user?: User;
}

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userId = payload.sub as string;
    const user = users.get(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: admin only" });
  next();
}

// Helper: create JWT
function createJwtForUser(user: User) {
  return jwt.sign({ role: user.role }, JWT_SECRET, { subject: user.id, expiresIn: JWT_EXPIRES_IN });
}

// Helper: createPaymentIntent (uses Stripe if configured, else simulates)
async function createPaymentIntentForOrder(order: Order) {
  if (stripeClient) {
    const pi = await stripeClient.paymentIntents.create({
      amount: order.totalCents,
      currency: order.currency || "inr",
      metadata: { orderId: order.id }
    });
    return pi;
  } else {
    // simulate
    return { id: "sim_pi_" + id(""), client_secret: "sim_cs_" + order.id };
  }
}

// Helper: handle Stripe webhook
async function handleStripeWebhookRaw(rawBody: Buffer, sigHeader: string | undefined, res: Response) {
  if (!stripeClient) {
    console.warn("Stripe client not configured; ignoring webhook");
    return res.json({ received: true });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(400).send("Webhook secret not configured");
  }
  let event: any;
  try {
    event = stripeClient.webhooks.constructEvent(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature error", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;
    if (orderId && orders.has(orderId)) {
      const order = orders.get(orderId)!;
      order.status = "PAID";
      order.stripePaymentId = pi.id;
      orders.set(orderId, order);
      console.log(`Order ${orderId} marked PAID via webhook`);
    }
  }

  return res.json({ received: true });
}

// Helper: send email
async function sendOrderAccessEmail(to: string, orderId: string, link: string) {
  if (sgMail && SENDGRID_API_KEY) {
    const msg = {
      to,
      from: EMAIL_FROM,
      subject: `Access to order ${orderId}`,
      text: `Access order ${orderId}: ${link} (expires shortly)`,
      html: `<p>Access order <strong>${orderId}</strong> : <a href="${link}">${link}</a></p>`
    };
    await sgMail.send(msg);
    return;
  }
  // fallback - log only
  console.log(`[email simulated] to=${to} subject=Access to order ${orderId} link=${link}`);
}

// Routes

const router = express.Router();

/* AUTH ROUTES */
router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  // check unique email
  for (const u of users.values()) {
    if (u.email === email) return res.status(409).json({ error: "Email already in use" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const u: User = {
    id: id("u_"),
    email,
    passwordHash,
    name,
    role: "USER",
    createdAt: new Date().toISOString()
  };
  users.set(u.id, u);
  res.json({ id: u.id, email: u.email });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const user = Array.from(users.values()).find((x) => x.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = createJwtForUser(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get("/auth/me", async (req: Request, res: Response) => {
  // Use authMiddleware in express route when mounting; here for completeness
  res.status(200).json({ ok: true });
});

/* PRODUCTS ROUTES */
router.get("/products", async (req: Request, res: Response) => {
  const list = Array.from(products.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(list);
});

router.get("/products/:id", async (req: Request, res: Response) => {
  const p = products.get(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(p);
});

router.post("/products", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const { title, description, priceCents, sku, imageUrl } = req.body;
  if (!title || typeof priceCents !== "number") return res.status(400).json({ error: "title and priceCents required" });
  const p: Product = {
    id: id("p_"),
    title,
    description,
    priceCents,
    sku,
    imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.set(p.id, p);
  res.json(p);
});

router.put("/products/:id", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const p = products.get(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  const { title, description, priceCents, sku, imageUrl } = req.body;
  p.title = title ?? p.title;
  p.description = description ?? p.description;
  p.priceCents = typeof priceCents === "number" ? priceCents : p.priceCents;
  p.sku = sku ?? p.sku;
  p.imageUrl = imageUrl ?? p.imageUrl;
  p.updatedAt = new Date().toISOString();
  products.set(p.id, p);
  res.json(p);
});

router.delete("/products/:id", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const p = products.get(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  products.delete(p.id);
  res.json({ ok: true });
});

/* ORDERS ROUTES */
// Create order (returns client_secret for Stripe payment or simulated)
router.post("/orders", authMiddleware as any, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { items, currency = "INR" } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must have items" });
  }

  let totalCents = 0;
  const orderItems: OrderItem[] = [];
  for (const it of items) {
    const product = products.get(it.productId);
    if (!product) return res.status(400).json({ error: "Invalid product in items", productId: it.productId });
    const qty = it.quantity && Number.isFinite(it.quantity) && it.quantity > 0 ? it.quantity : 1;
    totalCents += product.priceCents * qty;
    orderItems.push({
      id: id("oi_"),
      orderId: "", // fill later
      productId: product.id,
      quantity: qty,
      priceCents: product.priceCents
    });
  }

  const orderId = id("o_");
  for (const oi of orderItems) oi.orderId = orderId;

  const order: Order = {
    id: orderId,
    userId: user.id,
    totalCents,
    currency,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    items: orderItems
  };
  orders.set(order.id, order);

  // create payment intent (or simulated)
  const payment = await createPaymentIntentForOrder(order);
  // store stripe id if exists
  if (payment?.id) {
    order.stripePaymentId = payment.id;
    orders.set(order.id, order);
  }

  res.json({ orderId: order.id, clientSecret: payment?.client_secret ?? null });
});

// Get user's orders
router.get("/orders", authMiddleware as any, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const list = Array.from(orders.values()).filter((o) => o.userId === user.id);
  res.json(list);
});

// Get single order (user or admin)
router.get("/orders/:id", authMiddleware as any, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== user.id && user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  res.json(order);
});

/* ADMIN ROUTES */
router.get("/admin/dashboard", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const totalUsers = users.size;
  const totalOrders = orders.size;
  const revenue = Array.from(orders.values()).reduce((acc, o) => acc + o.totalCents, 0);
  res.json({ totalUsers, totalOrders, revenueCents: revenue });
});

router.get("/admin/orders", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const allOrders = Array.from(orders.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(allOrders);
});

/* EMAIL TOKEN ROUTES */
// Admin only: create short-lived token and send link
router.post("/email/send-order-link", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const { orderId, recipientEmail } = req.body;
  if (!orderId || !recipientEmail) return res.status(400).json({ error: "orderId and recipientEmail required" });
  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  // create a JWT token (signed) for link
  const token = jwt.sign({ orderId, recipientEmail, type: "email_link" }, EMAIL_LINK_SECRET, { expiresIn: "10m" });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const dbToken: EmailToken = {
    id: id("et_"),
    token,
    recipientEmail,
    orderId,
    used: false,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  };
  emailTokens.set(token, dbToken);
  const link = `${FRONTEND_URL}/admin/order-access?token=${encodeURIComponent(token)}`;
  try {
    await sendOrderAccessEmail(recipientEmail, orderId, link);
  } catch (err) {
    console.error("Failed to send email", err);
    emailTokens.delete(token);
    return res.status(500).json({ error: "Failed to send email" });
  }
  res.json({ ok: true, expiresAt: dbToken.expiresAt });
});

// Public: validate token (frontend can call to show status before login)
router.get("/email/validate", async (req: Request, res: Response) => {
  const token = (req.query.token as string) || "";
  if (!token) return res.status(400).json({ error: "token required" });
  const db = emailTokens.get(token);
  if (!db) return res.status(404).json({ valid: false, reason: "Token not found or used" });
  if (db.used) return res.status(410).json({ valid: false, reason: "Token already used" });
  if (new Date(db.expiresAt) < new Date()) return res.status(410).json({ valid: false, reason: "Token expired" });
  res.json({ valid: true, orderId: db.orderId, recipientEmail: db.recipientEmail });
});

// Consume token: must be authenticated ADMIN and email matches recipient
router.post("/email/consume", authMiddleware as any, requireAdmin as any, async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "token required" });
  const db = emailTokens.get(token);
  if (!db) return res.status(404).json({ error: "Token not found" });
  if (db.used) return res.status(410).json({ error: "Token already used" });
  if (new Date(db.expiresAt) < new Date()) return res.status(410).json({ error: "Token expired" });
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.email !== db.recipientEmail) return res.status(403).json({ error: "Authenticated admin email does not match token recipient" });

  // optional: verify signature (we used JWT)
  try {
    const payload = jwt.verify(token, EMAIL_LINK_SECRET) as any;
    if (payload.type !== "email_link") return res.status(400).json({ error: "Invalid token type" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token signature" });
  }

  // mark used
  db.used = true;
  emailTokens.set(token, db);

  // return order data
  const order = db.orderId ? orders.get(db.orderId) : null;
  if (!order) return res.status(404).json({ error: "Order not found" });
  // include product info for items
  const detailedItems = order.items.map((it) => {
    const product = products.get(it.productId);
    return { ...it, product: product ? { id: product.id, title: product.title, priceCents: product.priceCents } : null };
  });
  const responseOrder = { ...order, items: detailedItems };
  res.json({ order: responseOrder });
});

/* Stripe webhook raw route */
app.post("/webhook/stripe", bodyParser.raw({ type: "application/json" }), (req: Request, res: Response) => {
  const raw = req.body as Buffer;
  const sig = req.headers["stripe-signature"] as string | undefined;
  return handleStripeWebhookRaw(raw, sig, res);
});

/* Health */
router.get("/_health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Mount router
app.use("/", router);

// Initial seed (optional)
(async function seedIfRequested() {
  const initEmail = process.env.INIT_ADMIN_EMAIL;
  const initPassword = process.env.INIT_ADMIN_PASSWORD;
  if (initEmail && initPassword) {
    const existing = Array.from(users.values()).find((u) => u.email === initEmail);
    if (!existing) {
      const passwordHash = await bcrypt.hash(initPassword, 10);
      const admin: User = {
        id: id("u_"),
        email: initEmail,
        passwordHash,
        name: "Admin",
        role: "ADMIN",
        createdAt: new Date().toISOString()
      };
      users.set(admin.id, admin);
      console.log(`Seeded admin ${initEmail}`);
    } else {
      console.log(`Admin ${initEmail} already exists`);
    }
  }
})();

// Start server
app.listen(PORT, () => {
  console.log(`Single-file Paithani backend listening on port ${PORT}`);
  if (!stripeClient) {
    console.log("Stripe not configured — payment intents will be simulated. To enable Stripe, set STRIPE_SECRET_KEY and install stripe package.");
  }
  if (!sgMail || !SENDGRID_API_KEY) {
    console.log("SendGrid not configured — emails will be printed to console. To enable, set SENDGRID_API_KEY and install @sendgrid/mail.");
  }
});

/* END OF FILE */