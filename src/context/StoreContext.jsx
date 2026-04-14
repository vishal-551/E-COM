import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, storeService } from '../lib/services';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({ storeName: 'E-COM' });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPublicData = async () => {
    const [p, c, b, s] = await Promise.all([
      storeService.listPublicProducts({ limit: 100 }),
      storeService.listCategories(),
      storeService.listBanners(),
      storeService.getSiteSettings(),
    ]);
    setProducts(p || []);
    setCategories(c || []);
    setBanners(b || []);
    setSettings(s || {});
  };

  const loadPrivateData = async () => {
    try {
      const [cartRows, wishRows] = await Promise.all([storeService.getCart(), storeService.getWishlist()]);
      setCart((cartRows || []).map((row) => ({ ...row.product, quantity: row.quantity })));
      setWishlist((wishRows || []).map((row) => row.product));
    } catch {
      setCart([]);
      setWishlist([]);
    }
  };

  const bootstrap = async () => {
    setLoading(true);
    await loadPublicData();
    try {
      const me = await authService.profile();
      setUser(me);
      await loadPrivateData();
    } catch {
      setUser(null);
      setCart([]);
      setWishlist([]);
    }
    setLoading(false);
  };

  useEffect(() => { bootstrap(); }, []);

  const addToCart = async (product, qty = 1) => {
    await storeService.upsertCartItem({ product: product._id, quantity: qty });
    await loadPrivateData();
  };

  const updateQty = async (productId, qty) => {
    await storeService.upsertCartItem({ product: productId, quantity: Math.max(1, qty) });
    await loadPrivateData();
  };

  const removeFromCart = async (productId) => {
    await storeService.removeCartItem(productId);
    await loadPrivateData();
  };

  const toggleWishlist = async (product) => {
    await storeService.toggleWishlist(product);
    await loadPrivateData();
  };

  const value = useMemo(() => ({
    user,
    profile: user,
    isAdmin: user?.role === 'admin',
    products,
    categories,
    banners,
    settings,
    cart,
    wishlist,
    loading,
    refreshPublic: loadPublicData,
    refreshProfile: bootstrap,
    loadPrivateData,
    addToCart,
    updateQty,
    removeFromCart,
    toggleWishlist,
    setUser,
  }), [user, products, categories, banners, settings, cart, wishlist, loading]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
