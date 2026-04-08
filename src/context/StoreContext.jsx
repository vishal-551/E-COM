import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bannersSeed, categoriesSeed, couponsSeed, productsSeed, testimonialsSeed } from '../data/products';
import { load, save } from '../utils/storage';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => load('aaj_products', productsSeed));
  const [categories, setCategories] = useState(() => load('aaj_categories', categoriesSeed));
  const [cart, setCart] = useState(() => load('aaj_cart', []));
  const [wishlist, setWishlist] = useState(() => load('aaj_wishlist', []));
  const [orders, setOrders] = useState(() => load('aaj_orders', []));
  const [enquiries, setEnquiries] = useState(() => load('aaj_enquiries', []));
  const [coupons, setCoupons] = useState(() => load('aaj_coupons', couponsSeed));
  const [banners, setBanners] = useState(() => load('aaj_banners', bannersSeed));
  const [settings, setSettings] = useState(() => {
    const defaults = {
      storeName: 'Khushi Jewallary',
      ownerName: 'Khushi',
      phone: '+91 90000 00000',
      whatsapp: '+91 90000 00000',
      email: 'support@khushijewallary.com',
      address: 'Your Shop Address Here, Jaipur, Rajasthan 302001',
      instagram: '#', facebook: '#', youtube: '#',
    };
    const savedSettings = load('aaj_settings', defaults);
    const storeName = (savedSettings?.storeName || '').toLowerCase().includes('aarohi') ? defaults.storeName : savedSettings.storeName;
    const ownerName = (savedSettings?.ownerName || '').toLowerCase().includes('aarohi') ? defaults.ownerName : savedSettings.ownerName;
    return { ...defaults, ...savedSettings, storeName, ownerName };
  });
  const testimonials = testimonialsSeed;
  const reviews = [
    { id: 1, user: 'Sana', rating: 5, comment: 'Superb finish.' },
    { id: 2, user: 'Meera', rating: 5, comment: 'Looks luxurious.' },
    { id: 3, user: 'Pooja', rating: 4, comment: 'Very light weight.' },
    { id: 4, user: 'Divya', rating: 5, comment: 'Fast shipping and pretty packaging.' },
  ];

  useEffect(() => { save('aaj_products', products); }, [products]);
  useEffect(() => { save('aaj_categories', categories); }, [categories]);
  useEffect(() => { save('aaj_cart', cart); }, [cart]);
  useEffect(() => { save('aaj_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { save('aaj_orders', orders); }, [orders]);
  useEffect(() => { save('aaj_enquiries', enquiries); }, [enquiries]);
  useEffect(() => { save('aaj_coupons', coupons); }, [coupons]);
  useEffect(() => { save('aaj_banners', banners); }, [banners]);
  useEffect(() => { save('aaj_settings', settings); }, [settings]);

  const addToCart = (product, qty = 1) => setCart((prev) => {
    const found = prev.find((i) => i.id === product.id);
    return found ? prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { ...product, qty }];
  });
  const updateQty = (id, qty) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const toggleWishlist = (product) => setWishlist((p) => p.some((x) => x.id === product.id) ? p.filter((x) => x.id !== product.id) : [...p, product]);
  const placeOrder = (payload) => {
    const order = { id: `AAJ${Date.now()}`, date: new Date().toISOString(), status: 'Order placed', ...payload };
    setOrders((p) => [order, ...p]);
    setCart([]);
    return order;
  };

  const value = useMemo(() => ({
    products, setProducts, categories, setCategories, cart, wishlist, orders, enquiries, setEnquiries,
    coupons, setCoupons, banners, setBanners, settings, setSettings, testimonials, reviews,
    addToCart, updateQty, removeFromCart, toggleWishlist, placeOrder,
  }), [products, categories, cart, wishlist, orders, enquiries, coupons, banners, settings]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
