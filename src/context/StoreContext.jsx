import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { storeService } from '../lib/services';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({ storeName: 'E-COM' });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPublicData = async () => {
    const [p, c, b, s, imgs] = await Promise.all([
      storeService.listPublicProducts(),
      storeService.listCategories(),
      storeService.listBanners(),
      storeService.getSiteSettings(),
      storeService.listProductImages(),
    ]);
    const imageMap = imgs.reduce((acc, row) => {
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push(row);
      return acc;
    }, {});
    setProducts((p ?? []).map((x) => ({ ...x, images: imageMap[x.id] ?? [] })));
    setCategories(c ?? []);
    setBanners(b ?? []);
    setSettings({ storeName: 'E-COM', ...s });
  };

  const refreshProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data ?? null);
  };

  const loadPrivateData = async (userId) => {
    const [cartRows, wishRows] = await Promise.all([
      storeService.getCart(userId),
      storeService.getWishlist(userId),
    ]);
    setCart((cartRows ?? []).map((row) => ({ ...row.product, quantity: row.quantity, cart_item_id: row.id })));
    setWishlist((wishRows ?? []).map((row) => row.product));
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      await loadPublicData();
      if (data.session?.user) {
        await refreshProfile(data.session.user.id);
        await loadPrivateData(data.session.user.id);
      }
      setLoading(false);
    };
    boot();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession ?? null);
      if (nextSession?.user) {
        await refreshProfile(nextSession.user.id);
        await loadPrivateData(nextSession.user.id);
      } else {
        setProfile(null);
        setCart([]);
        setWishlist([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const addToCart = async (product, qty = 1) => {
    if (!session?.user) throw new Error('Please login first');
    const existing = cart.find((x) => x.id === product.id);
    const quantity = (existing?.quantity ?? 0) + qty;
    await storeService.upsertCartItem({ user_id: session.user.id, product_id: product.id, quantity });
    await loadPrivateData(session.user.id);
  };

  const updateQty = async (productId, qty) => {
    if (!session?.user) return;
    await storeService.upsertCartItem({ user_id: session.user.id, product_id: productId, quantity: Math.max(1, qty) });
    await loadPrivateData(session.user.id);
  };

  const removeFromCart = async (productId) => {
    if (!session?.user) return;
    await storeService.removeCartItem({ user_id: session.user.id, product_id: productId });
    await loadPrivateData(session.user.id);
  };

  const toggleWishlist = async (product) => {
    if (!session?.user) throw new Error('Please login first');
    const wished = wishlist.some((x) => x.id === product.id);
    await storeService.toggleWishlist({ user_id: session.user.id, product_id: product.id, wished });
    await loadPrivateData(session.user.id);
  };

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    products,
    categories,
    banners,
    settings,
    cart,
    wishlist,
    loading,
    refreshPublic: loadPublicData,
    refreshProfile,
    loadPrivateData,
    addToCart,
    updateQty,
    removeFromCart,
    toggleWishlist,
  }), [session, profile, products, categories, banners, settings, cart, wishlist, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
