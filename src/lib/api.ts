/**
 * Typed API client for the Paithani Royale backend (backend-demo.ts).
 * Base URL defaults to http://localhost:4000 — override with VITE_API_URL env var.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

// ─── Low-level fetch wrapper ─────────────────────────────────────────────────

type Ok<T> = { data: T; error: null };
type Err = { data: null; error: string };
type Result<T> = Ok<T> | Err;

async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: (body as any).error ?? `HTTP ${res.status}` };
    }
    const data: T = await res.json();
    return { data, error: null };
  } catch {
    return { data: null, error: 'Network error – backend may be offline' };
  }
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ─── Domain types (mirrors backend-demo.ts) ──────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';

export interface BackendUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface BackendProduct {
  id: string;
  title: string;
  description?: string;
  priceCents: number;
  sku?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELED';

export interface BackendOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceCents: number;
  product?: { id: string; title: string; priceCents: number };
}

export interface BackendOrder {
  id: string;
  userId: string;
  totalCents: number;
  currency: string;
  stripePaymentId?: string;
  status: OrderStatus;
  createdAt: string;
  items: BackendOrderItem[];
}

export interface AdminDashboardData {
  totalUsers: number;
  totalOrders: number;
  revenueCents: number;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  priceCents: number;
  sku?: string;
  imageUrl?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface EmailValidateResult {
  valid: boolean;
  orderId?: string;
  recipientEmail?: string;
  reason?: string;
}

// ─── API surface ─────────────────────────────────────────────────────────────

export const api = {
  /** GET /_health */
  health: () => request<{ ok: boolean }>('/_health'),

  auth: {
    /** POST /auth/register */
    register: (email: string, password: string, name?: string) =>
      request<{ id: string; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),

    /** POST /auth/login → { token, user } */
    login: (email: string, password: string) =>
      request<{ token: string; user: BackendUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  products: {
    /** GET /products */
    list: () => request<BackendProduct[]>('/products'),

    /** GET /products/:id */
    get: (id: string) => request<BackendProduct>(`/products/${id}`),

    /** POST /products  (admin) */
    create: (token: string, data: CreateProductInput) =>
      request<BackendProduct>('/products', {
        method: 'POST',
        headers: bearer(token),
        body: JSON.stringify(data),
      }),

    /** PUT /products/:id  (admin) */
    update: (token: string, id: string, data: Partial<CreateProductInput>) =>
      request<BackendProduct>(`/products/${id}`, {
        method: 'PUT',
        headers: bearer(token),
        body: JSON.stringify(data),
      }),

    /** DELETE /products/:id  (admin) */
    remove: (token: string, id: string) =>
      request<{ ok: boolean }>(`/products/${id}`, {
        method: 'DELETE',
        headers: bearer(token),
      }),
  },

  orders: {
    /** POST /orders  (authenticated) → { orderId, clientSecret } */
    create: (token: string, items: OrderItemInput[], currency = 'INR') =>
      request<{ orderId: string; clientSecret: string | null }>('/orders', {
        method: 'POST',
        headers: bearer(token),
        body: JSON.stringify({ items, currency }),
      }),

    /** GET /orders  (authenticated) */
    list: (token: string) =>
      request<BackendOrder[]>('/orders', { headers: bearer(token) }),

    /** GET /orders/:id  (authenticated, own order or admin) */
    get: (token: string, id: string) =>
      request<BackendOrder>(`/orders/${id}`, { headers: bearer(token) }),
  },

  admin: {
    /** GET /admin/dashboard  (admin) */
    dashboard: (token: string) =>
      request<AdminDashboardData>('/admin/dashboard', { headers: bearer(token) }),

    /** GET /admin/orders  (admin) */
    orders: (token: string) =>
      request<BackendOrder[]>('/admin/orders', { headers: bearer(token) }),
  },

  email: {
    /** GET /email/validate?token=... */
    validate: (token: string) =>
      request<EmailValidateResult>(`/email/validate?token=${encodeURIComponent(token)}`),

    /** POST /email/send-order-link  (admin) */
    sendOrderLink: (authToken: string, orderId: string, recipientEmail: string) =>
      request<{ ok: boolean; expiresAt: string }>('/email/send-order-link', {
        method: 'POST',
        headers: bearer(authToken),
        body: JSON.stringify({ orderId, recipientEmail }),
      }),

    /** POST /email/consume  (admin) */
    consume: (authToken: string, token: string) =>
      request<{ order: BackendOrder }>('/email/consume', {
        method: 'POST',
        headers: bearer(authToken),
        body: JSON.stringify({ token }),
      }),
  },
};
