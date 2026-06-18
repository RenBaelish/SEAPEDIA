import { drizzle } from 'drizzle-orm/d1';
import { users, stores, products, roles, userRoles, wallets, categories } from './db/schema';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';

export default {
  async fetch(request: Request, env: any) {
    const db = drizzle(env.DB, { schema });
    
    console.log("Seeding massive data...");

    const dummyHash = "dummy_hash_123";

    // --- Create Roles ---
    const roleTypes = ['ADMIN', 'BUYER', 'SELLER', 'DRIVER'];
    for (const r of roleTypes) {
      const existing = await db.select().from(roles).where(eq(roles.name, r)).get();
      if (!existing) {
        await db.insert(roles).values({ id: crypto.randomUUID(), name: r });
      }
    }
    const allRoles = await db.select().from(roles).all();
    const roleMap = allRoles.reduce((acc, r) => ({...acc, [r.name]: r.id}), {} as Record<string,string>);

    // --- Admin ---
    let admin = await db.select().from(users).where(eq(users.email, "admin@seapedia.id")).get();
    if (!admin) {
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id, username: "admin", email: "admin@seapedia.id", password: dummyHash, fullName: "SEAPEDIA Admin"
      });
      await db.insert(userRoles).values({ userId: id, roleId: roleMap['ADMIN'] });
      await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 0 });
    }

    // --- Categories ---
    const categoryDefs = [
      { name: "Elektronik", slug: "elektronik" },
      { name: "Handphone & Tablet", slug: "handphone-tablet" },
      { name: "Komputer & Laptop", slug: "komputer-laptop" },
      { name: "Kecantikan", slug: "kecantikan" },
      { name: "Fashion Muslim", slug: "fashion-muslim" },
      { name: "Kesehatan", slug: "kesehatan" },
      { name: "Makanan & Minuman", slug: "makanan-minuman" },
      { name: "Olahraga", slug: "olahraga" },
      { name: "Rumah & Dapur", slug: "home-living" },
      { name: "Otomotif", slug: "otomotif" },
    ];
    
    const catIds: Record<string, string> = {};
    for (const cat of categoryDefs) {
      let existing = await db.select().from(categories).where(eq(categories.slug, cat.slug)).get();
      if (!existing) {
        const id = crypto.randomUUID();
        await db.insert(categories).values({ id, name: cat.name, slug: cat.slug });
        catIds[cat.slug] = id;
      } else {
        catIds[cat.slug] = existing.id;
      }
    }

    // --- Sellers ---
    const sellersData = [
      { email: "demo@seapedia.id", user: "demoseller", name: "Demo Seller", storeName: "Demo Store", slug: "demo-store", desc: "Toko demo SEAPEDIA berbagai produk pilihan terbaik." },
      { email: "gadget@seapedia.id", user: "gadgetstore", name: "Super Gadget", storeName: "SUPER GADGET-SAMSUNG EXCLUSIVE", slug: "super-gadget", desc: "Official distributor untuk smartphone, laptop, dan aksesoris." },
      { email: "beauty@seapedia.id", user: "beautystore", name: "Waytoglow Beauty", storeName: "waytoglow", slug: "waytoglow", desc: "Toko kosmetik dan skincare original terlengkap." },
      { email: "fashion@seapedia.id", user: "fashionstore", name: "Tiebymin Official", storeName: "tiebymin official", slug: "tiebymin-official", desc: "Pusat fashion muslimah dan busana trendy terkini." },
      { email: "philips@seapedia.id", user: "philipsstore", name: "Philips Audio", storeName: "Philips Audio", slug: "philips-audio", desc: "Produk Philips resmi audio, charger, dan aksesoris." },
      { email: "logitech@seapedia.id", user: "logitechstore", name: "Logitech Official", storeName: "Logitech G Official", slug: "logitech-g-official", desc: "Peripheral gaming dan produktivitas terbaik dari Logitech." },
      { email: "sneakers@seapedia.id", user: "sneakersstore", name: "Senikersku", storeName: "Senikersku", slug: "senikersku", desc: "Sepatu sneakers original dan authentic 100%." },
      { email: "ecentio@seapedia.id", user: "ecentiostore", name: "Ecentio Indonesia", storeName: "ecentio.indonesia", slug: "ecentio-indonesia", desc: "Produk rumah tangga, botol minum, dan peralatan serbaguna." },
      { email: "hypermart@seapedia.id", user: "hypermartstore", name: "Hypermart Ponorogo", storeName: "Hypermart Ponorogo", slug: "hypermart-ponorogo", desc: "Supermarket online produk kebutuhan sehari-hari." },
      { email: "spigen@seapedia.id", user: "spigenstore", name: "Spigen Indonesia", storeName: "Spigen Indonesia", slug: "spigen-indonesia", desc: "Case dan aksesoris HP premium original Spigen." }
    ];

    const storeIds: Record<string, string> = {};

    for (const s of sellersData) {
      let seller = await db.select().from(users).where(eq(users.email, s.email)).get();
      if (!seller) {
        const id = crypto.randomUUID();
        await db.insert(users).values({
          id, username: s.user, email: s.email, password: dummyHash, fullName: s.name
        });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['BUYER'] });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['SELLER'] });
        await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 2000000 });
        seller = { id } as any;
      }

      let store = await db.select().from(stores).where(eq(stores.ownerId, seller!.id)).get();
      if (!store) {
        const storeId = crypto.randomUUID();
        await db.insert(stores).values({
          id: storeId, ownerId: seller!.id, name: s.storeName, slug: s.slug, description: s.desc,
          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
          totalSales: Math.floor(Math.random() * 1000)
        });
        store = { id: storeId } as any;
      }
      storeIds[s.storeName] = store!.id;
      storeIds[s.slug] = store!.id;
    }

    // --- Driver ---
    let driver = await db.select().from(users).where(eq(users.email, "driver@seapedia.id")).get();
    if (!driver) {
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id, username: "demodriver", email: "driver@seapedia.id", password: dummyHash, fullName: "Demo Driver"
      });
      await db.insert(userRoles).values({ userId: id, roleId: roleMap['DRIVER'] });
      await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 0 });
    }

    // --- Products ---
    const productDefs = [
      // Super Gadget - Handphone & Laptop
      { store: "super-gadget", name: "MacBook Pro M3 Max 14-inch 1TB Space Black", price: 45000000, compare: 48000000, stock: 8, weight: 2000, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", sold: 127 },
      { store: "super-gadget", name: "iPhone 15 Pro Max 256GB Titan Natural", price: 22000000, compare: 24000000, stock: 15, weight: 500, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", sold: 340 },
      { store: "super-gadget", name: "Charger Samsung Fast Charging 25W USB Type C", price: 299000, compare: 350000, stock: 120, weight: 200, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", sold: 2300 },
      { store: "super-gadget", name: "Ugreen Adaptor GaN 100W USB-C Super Fast Charging", price: 385000, compare: 450000, stock: 60, weight: 250, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80", sold: 890 },
      { store: "super-gadget", name: "Samsung Galaxy S24 Ultra 256GB Titanium Black", price: 18500000, compare: 20000000, stock: 20, weight: 500, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", sold: 210 },
      { store: "super-gadget", name: "Apple AirPods Pro 2nd Gen USB-C", price: 3800000, compare: 4200000, stock: 30, weight: 150, cat: "elektronik", img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", sold: 560 },

      // Logitech
      { store: "logitech-g-official", name: "Logitech G305 Lightspeed Mouse Gaming Wireless", price: 519000, compare: 600000, stock: 45, weight: 300, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1527814050087-3793815479fa?auto=format&fit=crop&w=800&q=80", sold: 1200 },
      { store: "logitech-g-official", name: "Logitech MX Master 3S Wireless Mouse Dark Grey", price: 1350000, compare: 1500000, stock: 25, weight: 350, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80", sold: 670 },
      { store: "logitech-g-official", name: "Logitech G Pro X Mechanical Gaming Keyboard", price: 1800000, compare: 2100000, stock: 18, weight: 1200, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1601445638532-2f4d34e9ef5a?auto=format&fit=crop&w=800&q=80", sold: 445 },
      { store: "logitech-g-official", name: "Logitech C920 HD Pro Webcam 1080p 30fps", price: 1250000, compare: 1400000, stock: 30, weight: 400, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80", sold: 320 },

      // Philips
      { store: "philips-audio", name: "Philips SWA3021 Audio Adapter Type C to 3.5mm", price: 65000, compare: 80000, stock: 200, weight: 50, cat: "elektronik", img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80", sold: 3400 },
      { store: "philips-audio", name: "Philips Wireless Charging Pad DLP9216 15W", price: 179000, compare: 250000, stock: 80, weight: 150, cat: "elektronik", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", sold: 780 },
      { store: "philips-audio", name: "Philips DLP9339N 5000mAh Magsafe Power Bank", price: 199000, compare: 350000, stock: 55, weight: 250, cat: "elektronik", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80", sold: 920 },
      { store: "philips-audio", name: "Philips SWA3070 Adapter USB 3.0 to USB-C", price: 49000, compare: 65000, stock: 150, weight: 30, cat: "elektronik", img: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=80", sold: 2100 },

      // waytoglow - Kecantikan
      { store: "waytoglow", name: "HANASUI Collagen Water Sunscreen SPF 50+ 40ml", price: 27116, compare: 35000, stock: 500, weight: 100, cat: "kecantikan", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80", sold: 15000 },
      { store: "waytoglow", name: "Mykonos All Variant 50ML EDP Unisex Parfum", price: 138000, compare: 180000, stock: 120, weight: 150, cat: "kecantikan", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80", sold: 4500 },
      { store: "waytoglow", name: "Lavojoy Let It Glow Body Serum Skin Brightening", price: 47900, compare: 65000, stock: 200, weight: 180, cat: "kecantikan", img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=800&q=80", sold: 8800 },
      { store: "waytoglow", name: "Glad2Glow Cherry Blossom Micellar Waters Pembersih Makeup", price: 30000, compare: 55000, stock: 350, weight: 100, cat: "kecantikan", img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80", sold: 120000 },
      { store: "waytoglow", name: "PIXY 4 Beauty Benefits Concealing Base BB Cushion", price: 43000, compare: 55000, stock: 250, weight: 100, cat: "kecantikan", img: "https://images.unsplash.com/photo-1583241800698-e8ab01830a22?auto=format&fit=crop&w=800&q=80", sold: 9200 },
      { store: "waytoglow", name: "Freshcare Smash Matcha Double Inhaler Roll On", price: 13900, compare: 20000, stock: 600, weight: 50, cat: "kesehatan", img: "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=800&q=80", sold: 25000 },

      // Tiebymin - Fashion
      { store: "tiebymin-official", name: "Tiebymin - Tyana Bergo Oval Syar'i Premium", price: 39999, compare: 55000, stock: 800, weight: 150, cat: "fashion-muslim", img: "https://images.unsplash.com/photo-1589810635656-7ee3ebc05f77?auto=format&fit=crop&w=800&q=80", sold: 150000 },
      { store: "tiebymin-official", name: "Tiebymin - Alana Bergo Jersey Hijab Pramuka Nyaman", price: 55000, compare: 75000, stock: 600, weight: 150, cat: "fashion-muslim", img: "https://images.unsplash.com/photo-1576991255346-ef9df2c3d8ba?auto=format&fit=crop&w=800&q=80", sold: 98000 },
      { store: "tiebymin-official", name: "[S-2XL] Blouse VNeck Wanita Dolman Loose Top", price: 84900, compare: null, stock: 300, weight: 250, cat: "fashion-muslim", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", sold: 12000 },
      { store: "tiebymin-official", name: "Celana Despo Polos Pendek Pria Casual All Size", price: 40000, compare: 80000, stock: 1000, weight: 200, cat: "olahraga", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", sold: 75000 },
      { store: "tiebymin-official", name: "Kaos Rib Waffle Polos Lengan Panjang Premium Unisex", price: 40000, compare: 70000, stock: 500, weight: 200, cat: "fashion-muslim", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", sold: 45000 },

      // Senikersku - Sepatu
      { store: "senikersku", name: "Puma Speedcat Ballet Black Mauve Mist Womens 100% Authentic", price: 2099000, compare: null, stock: 25, weight: 800, cat: "olahraga", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", sold: 1200 },
      { store: "senikersku", name: "Nike Air Force 1 '07 White 100% Original", price: 1549000, compare: 1799000, stock: 50, weight: 1000, cat: "olahraga", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", sold: 3400 },
      { store: "senikersku", name: "Adidas Ultraboost 23 Cloud White Running Shoes", price: 2500000, compare: 2800000, stock: 20, weight: 900, cat: "olahraga", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", sold: 980 },

      // Ecentio - Peralatan Rumah
      { store: "ecentio-indonesia", name: "ecentio 750ml Aluminium Botol Olahraga Multifungsi", price: 68000, compare: 100000, stock: 300, weight: 400, cat: "olahraga", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", sold: 18000 },
      { store: "ecentio-indonesia", name: "ecentio Disney Mickey Botol Minum 1000ml Portable", price: 63000, compare: 120000, stock: 200, weight: 450, cat: "olahraga", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", sold: 9500 },
      { store: "ecentio-indonesia", name: "ecentio Lunch Box Tas Set 3pcs Anti Tumpah Stainless", price: 43500, compare: 80000, stock: 250, weight: 600, cat: "home-living", img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80", sold: 6700 },
      { store: "ecentio-indonesia", name: "Tumbler Minum Freesip Botol Thermos 600ml Stainless Steel", price: 65000, compare: 120000, stock: 400, weight: 400, cat: "home-living", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", sold: 55000 },

      // Hypermart
      { store: "hypermart-ponorogo", name: "MINYAK GORENG ROSE BRAND 2L POUCH", price: 56100, compare: null, stock: 500, weight: 2000, cat: "makanan-minuman", img: "https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80", sold: 3200 },
      { store: "hypermart-ponorogo", name: "SUNCO COOKING OIL REFILL 2 LITER", price: 49210, compare: null, stock: 400, weight: 2000, cat: "makanan-minuman", img: "https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80", sold: 2100 },
      { store: "hypermart-ponorogo", name: "Sedaap Mie Instan 16 pcs Mix Flavors Korean Series", price: 61100, compare: 75000, stock: 200, weight: 2000, cat: "makanan-minuman", img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80", sold: 5600 },
      { store: "hypermart-ponorogo", name: "Minyak Goreng Bimoli Spesial 2 Liter", price: 24000, compare: null, stock: 600, weight: 2000, cat: "makanan-minuman", img: "https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80", sold: 4500 },
      { store: "hypermart-ponorogo", name: "Sunlight Sabun Cuci Piring Jeruk Nipis 610g", price: 18100, compare: 25000, stock: 300, weight: 650, cat: "home-living", img: "https://images.unsplash.com/photo-1584824486509-112e4181f1ce?auto=format&fit=crop&w=800&q=80", sold: 12000 },

      // Spigen
      { store: "spigen-indonesia", name: "SPIGEN Card Holder Stand Magsafe iPhone 16 15 14 13", price: 339000, compare: 400000, stock: 60, weight: 100, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1603921326210-6ead2ae4bba4?auto=format&fit=crop&w=800&q=80", sold: 8500 },
      { store: "spigen-indonesia", name: "Spigen iPhone 15 Pro Max Clear Case MagSafe", price: 450000, compare: 550000, stock: 40, weight: 80, cat: "handphone-tablet", img: "https://images.unsplash.com/photo-1603921326210-6ead2ae4bba4?auto=format&fit=crop&w=800&q=80", sold: 3200 },

      // Demo Store
      { store: "demo-store", name: "Sony Alpha a7 IV Mirrorless Camera Body", price: 38500000, compare: null, stock: 5, weight: 1500, cat: "elektronik", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", sold: 87 },
      { store: "demo-store", name: "Tenda Camping 4-6 Orang 3.3x2.1m Waterproof", price: 306900, compare: 450000, stock: 30, weight: 5000, cat: "olahraga", img: "https://images.unsplash.com/photo-1504280390267-33106d19467f?auto=format&fit=crop&w=800&q=80", sold: 1200 },
      { store: "demo-store", name: "SWEETY Silver Pants Cloud Soft Tape Popok Bayi", price: 52500, compare: 75000, stock: 300, weight: 800, cat: "home-living", img: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80", sold: 35000 },
      { store: "demo-store", name: "Logitech C920 Webcam HD Pro Streaming 1080p", price: 1250000, compare: 1500000, stock: 20, weight: 400, cat: "komputer-laptop", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80", sold: 450 },
      { store: "demo-store", name: "Coffee Beans Arabica Gayo Single Origin 500g", price: 185000, compare: null, stock: 100, weight: 520, cat: "makanan-minuman", img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80", sold: 2300 },
      { store: "demo-store", name: "Kemei KM-329 Catok Rambut Profesional 160-220C", price: 75700, compare: 120000, stock: 80, weight: 500, cat: "kecantikan", img: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80", sold: 18000 },
      { store: "demo-store", name: "Sepatu Running Asics Gel-Pulse 16 Original", price: 799500, compare: 950000, stock: 25, weight: 800, cat: "olahraga", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", sold: 560 },
      { store: "demo-store", name: "House of Smith Harrington Jacket Black Original", price: 245000, compare: 350000, stock: 100, weight: 400, cat: "fashion-muslim", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80", sold: 14000 },
      { store: "demo-store", name: "eBuy Dumbell Set 20KG Barbel Alat Olahraga Rumahan", price: 236610, compare: 300000, stock: 40, weight: 20000, cat: "olahraga", img: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=800&q=80", sold: 9800 },
    ];

    for (let i = 0; i < productDefs.length; i++) {
      const p = productDefs[i];
      const storeId = storeIds[p.store];
      if (!storeId) continue;

      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").substring(0, 80) + "-" + i;
      const existing = await db.select().from(products).where(eq(products.slug, slug)).get();
      if (!existing) {
        await db.insert(products).values({
          id: crypto.randomUUID(),
          storeId,
          categoryId: catIds[p.cat],
          name: p.name,
          slug,
          description: `Deskripsi lengkap untuk ${p.name}. Produk dijamin kualitas dan keasliannya. Tersedia pengiriman ke seluruh Indonesia.`,
          price: p.price,
          comparePrice: p.compare ?? null,
          rating: parseFloat((4.4 + Math.random() * 0.6).toFixed(1)),
          sold: p.sold,
          stock: p.stock,
          weight: p.weight,
          images: JSON.stringify([p.img])
        });
      }
    }

    return new Response(JSON.stringify({ message: "Seeding complete!" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
