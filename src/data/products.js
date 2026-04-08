const baseImages = [
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1620656798579-1984d8ca5f0f?auto=format&fit=crop&w=900&q=80',
];

const names = [
  'Royal Kundan Bridal Set','Pearl Drop Earrings','Temple Design Necklace','Oxidised Silver Jhumka','Floral Meenakari Earrings','Premium Party Wear Choker','Wedding Special Bangles Set','Daily Wear Stone Studs','Traditional Gold Finish Maang Tikka','Elegant Pearl Pendant Set',
  'Noor Rose Gold Hoops','Ziva Festive Anklet Duo','Shree Combo Charm Pack','Riwaaz Bridal Choker Pro','Classic Nose Pin Trio','Velvet Temple Kada','Marigold Festival Neckpiece','Ethereal Office Wear Studs','Heritage Kundan Ring Set','Apsara Lightweight Bracelet','Moonlight Choker Layers','Gulnaar Pearl Jhumkas','Saanvi Bridal Haathphool','Royal Glow Gift Box Set'
];

const categories = ['Bridal Sets','Earrings','Necklace','Jhumka','Meenakari Jewellery','Choker Sets','Bangles','Studs','Maang Tikka','Pendant Sets','Hoops','Anklets','Combo Sets','Bridal Sets','Nose Pins','Temple Jewellery','Festival Collection','Daily Wear Jewellery','Kundan Jewellery','Bracelets','Party Wear Jewellery','Pearl Jewellery','Wedding Collection','Gift Sets'];

const occasions = ['Wedding','Party','Festive','Daily','Office','Gift'];

export const productsSeed = names.map((name, i) => {
  const price = 999 + i * 120;
  const oldPrice = price + 450;
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  return {
    id: i + 1,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: categories[i],
    subcategory: categories[i],
    collectionType: i % 3 === 0 ? 'Bridal' : i % 3 === 1 ? 'Daily Wear' : 'Party Wear',
    price,
    oldPrice,
    discount,
    description: `${name} is handcrafted with premium finish, anti-allergy comfort and festive sparkle for modern Indian women.`,
    shortDescription: 'Luxury finish, lightweight fit, festive-ready elegance.',
    material: i % 2 ? 'Alloy, Kundan, Pearl' : 'Brass, Stones, Enamel',
    color: i % 2 ? 'Gold & Pearl' : 'Rose Gold & Ruby',
    style: i % 2 ? 'Traditional' : 'Contemporary',
    occasion: occasions[i % occasions.length],
    stockQuantity: 8 + i,
    sku: `AAJ-${1000 + i}`,
    rating: Number((4 + (i % 10) / 20).toFixed(1)),
    reviewCount: 18 + i * 3,
    badges: [i % 2 === 0 ? 'Sale' : 'Premium', i % 4 === 0 ? 'Best Seller' : 'New'],
    featured: i < 10,
    bestseller: i % 4 === 0,
    newArrival: i > 15,
    images: [baseImages[i % 4], baseImages[(i + 1) % 4], baseImages[(i + 2) % 4]],
    thumbnail: baseImages[i % 4],
    careInstructions: 'Store in airtight pouch, avoid perfume and water contact.',
    shippingInfo: 'Ships in 24-48 hours. Free shipping above ₹999.',
    returnInfo: '7-day easy return and exchange available.',
    availability: i % 7 === 0 ? 'Limited Stock' : 'In Stock',
    sizeInfo: 'Adjustable / Free Size',
    tags: ['bridal','festival','party','daily', categories[i].toLowerCase()],
  };
});

export const categoriesSeed = [
  'Earrings','Jhumka','Studs','Hoops','Necklace','Choker Sets','Bridal Sets','Bangles','Bracelets','Rings','Maang Tikka','Anklets'
].map((name, idx) => ({ id: idx + 1, name, slug: name.toLowerCase().replace(/\s+/g, '-'), image: baseImages[idx % 4] }));

export const bannersSeed = [
  { id: 1, title: 'Shine in Every Celebration', subtitle: 'Bridal beauty collection now live', image: baseImages[0], cta: 'Shop Bridal' },
  { id: 2, title: 'Festival Offers up to 40% Off', subtitle: 'Curated festive looks in premium finish', image: baseImages[1], cta: 'Grab Offers' },
  { id: 3, title: 'Affordable Luxury Jewellery', subtitle: 'Crafted for modern women', image: baseImages[2], cta: 'New Arrivals' },
];

export const testimonialsSeed = [
  { id: 1, name: 'Priya Nair', text: 'Beautiful quality and very elegant design.' },
  { id: 2, name: 'Sakshi Verma', text: 'Perfect for weddings and festive functions.' },
  { id: 3, name: 'Nisha Patel', text: 'Affordable and looks premium.' },
  { id: 4, name: 'Ritika Sharma', text: 'Loved the packaging and fast delivery.' },
  { id: 5, name: 'Aarti Mehta', text: 'My go-to store for statement jewellery.' },
];

export const couponsSeed = [
  { code: 'WELCOME10', type: 'percent', value: 10, active: true },
  { code: 'FESTIVE20', type: 'percent', value: 20, active: true },
  { code: 'BRIDAL15', type: 'percent', value: 15, active: true },
  { code: 'NEWUSER5', type: 'percent', value: 5, active: true },
];
