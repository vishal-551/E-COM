import { supabase } from './supabase';

export const authService = {
  signUp: async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  },
};

const qb = (table) => supabase.from(table);

export const storeService = {
  listPublicProducts: async () => {
    const { data, error } = await qb('products').select('*, category:categories(*)').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  listProductImages: async () => {
    const { data, error } = await qb('product_images').select('*');
    if (error) throw error;
    return data;
  },
  listCategories: async () => {
    const { data, error } = await qb('categories').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data;
  },
  listBanners: async () => {
    const { data, error } = await qb('banners').select('*').eq('is_active', true).order('display_order');
    if (error) throw error;
    return data;
  },
  getSiteSettings: async () => {
    const { data, error } = await qb('site_settings').select('*').eq('key', 'global').maybeSingle();
    if (error) throw error;
    return data?.value ?? {};
  },
  submitEnquiry: async (payload) => {
    const { error } = await qb('enquiries').insert(payload);
    if (error) throw error;
  },
  getCart: async (userId) => {
    const { data, error } = await qb('cart_items').select('*, product:products(*)').eq('user_id', userId);
    if (error) throw error;
    return data;
  },
  upsertCartItem: async ({ user_id, product_id, quantity }) => {
    const { error } = await qb('cart_items').upsert({ user_id, product_id, quantity }, { onConflict: 'user_id,product_id' });
    if (error) throw error;
  },
  removeCartItem: async ({ user_id, product_id }) => {
    const { error } = await qb('cart_items').delete().eq('user_id', user_id).eq('product_id', product_id);
    if (error) throw error;
  },
  getWishlist: async (userId) => {
    const { data, error } = await qb('wishlists').select('*, product:products(*)').eq('user_id', userId);
    if (error) throw error;
    return data;
  },
  toggleWishlist: async ({ user_id, product_id, wished }) => {
    if (wished) {
      const { error } = await qb('wishlists').delete().eq('user_id', user_id).eq('product_id', product_id);
      if (error) throw error;
      return;
    }
    const { error } = await qb('wishlists').insert({ user_id, product_id });
    if (error) throw error;
  },
  applyCoupon: async ({ code, subtotal }) => {
    const { data, error } = await qb('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Invalid coupon');
    if (data.expiry_date && new Date(data.expiry_date).getTime() < Date.now()) throw new Error('Coupon expired');
    if (subtotal < Number(data.min_order_amount || 0)) throw new Error('Minimum amount not met');
    const discount = data.discount_type === 'percentage' ? (subtotal * Number(data.discount_value)) / 100 : Number(data.discount_value);
    return { coupon: data, discount: Math.min(discount, subtotal) };
  },
  placeOrder: async ({ user_id, shipping_address, payment_method, items, coupon_code, discount_amount, subtotal, shipping_amount, total_amount }) => {
    const { data: order, error } = await qb('orders').insert({
      user_id,
      shipping_address,
      payment_method,
      coupon_code,
      discount_amount,
      subtotal,
      shipping_amount,
      total_amount,
    }).select('*').single();
    if (error) throw error;

    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_total: it.quantity * it.unit_price,
      product_name: it.product_name,
      product_thumbnail_url: it.product_thumbnail_url,
    }));

    const { error: itemErr } = await qb('order_items').insert(orderItems);
    if (itemErr) throw itemErr;

    const { error: cartErr } = await qb('cart_items').delete().eq('user_id', user_id);
    if (cartErr) throw cartErr;

    return order;
  },
  myOrders: async (userId) => {
    const { data, error } = await qb('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const [
      sales, orders, products, users, pending, dispatched, delivered, cancelled, lowStock, recentOrders, recentUsers,
    ] = await Promise.all([
      qb('orders').select('total_amount'),
      qb('orders').select('id', { count: 'exact', head: true }),
      qb('products').select('id', { count: 'exact', head: true }),
      qb('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      qb('orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
      qb('orders').select('id', { count: 'exact', head: true }).eq('status', 'Dispatched'),
      qb('orders').select('id', { count: 'exact', head: true }).eq('status', 'Delivered'),
      qb('orders').select('id', { count: 'exact', head: true }).eq('status', 'Cancelled'),
      qb('products').select('id', { count: 'exact', head: true }).lte('stock', 5),
      qb('orders').select('*, profile:profiles(full_name,email)').order('created_at', { ascending: false }).limit(5),
      qb('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    const totalSales = (sales.data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
    return {
      totalSales,
      totalOrders: orders.count ?? 0,
      totalProducts: products.count ?? 0,
      totalUsers: users.count ?? 0,
      pendingOrders: pending.count ?? 0,
      dispatchedOrders: dispatched.count ?? 0,
      deliveredOrders: delivered.count ?? 0,
      cancelledOrders: cancelled.count ?? 0,
      lowStockCount: lowStock.count ?? 0,
      latestOrders: recentOrders.data ?? [],
      latestCustomers: recentUsers.data ?? [],
    };
  },
};
