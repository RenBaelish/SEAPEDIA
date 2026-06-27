import { drizzle } from 'drizzle-orm/d1';
import { users, stores, products, roles, userRoles, wallets, categories } from './db/schema';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';

const HASHES: Record<string, string> = {
  admin:       '$2b$10$leeaKdcnXFwjaD1eEslcpeKqXC8pvnRDj8Gjtx2DlASPUXxgauPUC',
  techmart:    '$2b$10$kEW2L84WUqNvR9NfaftPv.tYlRFK4oUyo1OiNRbPpI8U9i.kS4jG2',
  glowskin:    '$2b$10$mBIk3SUecZvFghjvNw2P0OqE3tOVD/ZGAnTnMwI.A1fXJc89GJc/6',
  urbanstyle:  '$2b$10$aIe50/3P2AZoWt1hmdXKOOHCrrNOtN2tf98dJHe6VszrPey.dftwy',
  freshmart:   '$2b$10$meZrnchSg.689NsLkOQ2XenfL.knUBNeEmHlNWnDMfZljf3qQOUke',
  sportszone:  '$2b$10$CfIsngxeMHWGuDUiUv0VZO3mrMul6LXIlaSABodEw5AAdUXK3QXQa',
  homedeco:    '$2b$10$WzbP5F8LsGA7T0IeZV3dgOsbKEgZddXuAi45FjjFA0skbAR5k/Pqi',
  autojaya:    '$2b$10$hanyDfTUmm8tYLY5Spb.GOexB.Qt5NRTqBO2yfztet1ssSORaCX3y',
  healthplus:  '$2b$10$IaXpgPurraFujQxMiF.RKOwhBVD5yXesMeBMWitHe2PH07kyw4o3W',
  gaminghub:   '$2b$10$V7DvReEI07axPwBUr6.RhuTda4bqVKAAu4/aoa4CdkFVNEBeBRiq2',
  periplus:    '$2b$10$YbSfimKRm07Gbyf4v68gxuWvAzM.23uNdF.uKLZiT36qA/kZ9wBgC',
  budi:        '$2b$10$3lpP3/H5Z5srgyyJtBeMLexa8VIb85LnAh3Vto4pD8COgh3L1M.6i',
  siti:        '$2b$10$Qjv4B1KWyHzbSRE50qPc/.YvFCjOXc5zaKBl.G/0BsiZ7AjIQ029e',
  ahmad:       '$2b$10$rfv0urUt0Muj01kUwFIBEOGrmhOQHUrowKMJzZ/lAc.LNocZot.qm',
  dewi:        '$2b$10$H.zOHrg7VKUQuhe4wxDxm.DPq4YloVrVlMff/fpWeGd1PM4KxF7Jy',
  rudi:        '$2b$10$trsWjkqQ4c5dUapuXkCVF.o0dDwm3Dp/TxkZZRs5UGll1Mma6prnq',
  andi:        '$2b$10$r1e082yTkVr4Mr1LBOJv4ez9Cx7Lpjr/zB3RWhUf3MHIkpwaLIFpq',
};

export default {
  async fetch(request: Request, env: any) {
    const db = drizzle(env.DB, { schema });

    const roleTypes = ['ADMIN', 'BUYER', 'SELLER', 'DRIVER'];
    for (const r of roleTypes) {
      const existing = await db.select().from(roles).where(eq(roles.name, r)).get();
      if (!existing) await db.insert(roles).values({ id: crypto.randomUUID(), name: r });
    }
    const allRoles = await db.select().from(roles).all();
    const roleMap = allRoles.reduce((acc, r) => ({...acc, [r.name]: r.id}), {} as Record<string, string>);

    const adminAccounts = [
      { email: 'admin@seapedia.id', username: 'seapedia_admin', name: 'SEAPEDIA Administrator', hashKey: 'admin' }
    ];
    for (const a of adminAccounts) {
      const existing = await db.select().from(users).where(eq(users.email, a.email)).get();
      if (!existing) {
        const id = crypto.randomUUID();
        await db.insert(users).values({ id, username: a.username, email: a.email, password: HASHES[a.hashKey], fullName: a.name });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['ADMIN'] });
        await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 0 });
      }
    }

    const categoryDefs = [
      { name: 'Elektronik', slug: 'elektronik' },
      { name: 'Handphone & Tablet', slug: 'handphone-tablet' },
      { name: 'Komputer & Laptop', slug: 'komputer-laptop' },
      { name: 'Kecantikan', slug: 'kecantikan' },
      { name: 'Fashion Muslim', slug: 'fashion-muslim' },
      { name: 'Kesehatan', slug: 'kesehatan' },
      { name: 'Makanan & Minuman', slug: 'makanan-minuman' },
      { name: 'Olahraga', slug: 'olahraga' },
      { name: 'Rumah & Dapur', slug: 'home-living' },
      { name: 'Otomotif', slug: 'otomotif' },
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

    const sellersData = [
      { email: 'techmart@seapedia.id', username: 'techmart_id', name: 'TechMart Indonesia', hashKey: 'techmart', storeName: 'TechMart Indonesia', slug: 'techmart-indonesia', desc: 'Distributor resmi elektronik, laptop, dan smartphone terpercaya.' },
      { email: 'glowskin@seapedia.id', username: 'glowskin_official', name: 'GlowSkin Official', hashKey: 'glowskin', storeName: 'GlowSkin Official', slug: 'glowskin-official', desc: 'Skincare dan kosmetik original pilihan dermatologis.' },
      { email: 'urbanstyle@seapedia.id', username: 'urbanstyle_id', name: 'Urban Style ID', hashKey: 'urbanstyle', storeName: 'Urban Style ID', slug: 'urban-style-id', desc: 'Fashion pria dan wanita modern, casual, dan formal.' },
      { email: 'freshmart@seapedia.id', username: 'freshmart_daily', name: 'FreshMart Daily', hashKey: 'freshmart', storeName: 'FreshMart Daily', slug: 'freshmart-daily', desc: 'Produk makanan, minuman, dan kebutuhan dapur segar setiap hari.' },
      { email: 'sportszone@seapedia.id', username: 'sportszone_id', name: 'SportsZone ID', hashKey: 'sportszone', storeName: 'SportsZone ID', slug: 'sportszone-id', desc: 'Perlengkapan olahraga dan fitness premium untuk semua level.' },
      { email: 'homedeco@seapedia.id', username: 'homedeco_living', name: 'HomeDeco Living', hashKey: 'homedeco', storeName: 'HomeDeco Living', slug: 'homedeco-living', desc: 'Perabot rumah, dekorasi, dan peralatan dapur berkualitas tinggi.' },
      { email: 'autojaya@seapedia.id', username: 'autojaya_store', name: 'AutoJaya Store', hashKey: 'autojaya', storeName: 'AutoJaya Store', slug: 'autojaya-store', desc: 'Aksesoris dan spare part otomotif original dan terjamin.' },
      { email: 'healthplus@seapedia.id', username: 'healthplus_id', name: 'HealthPlus ID', hashKey: 'healthplus', storeName: 'HealthPlus ID', slug: 'healthplus-id', desc: 'Suplemen kesehatan, vitamin, dan alat medis berstandar BPOM.' },
      { email: 'gaminghub@seapedia.id', username: 'gaminghub_id', name: 'GamingHub ID', hashKey: 'gaminghub', storeName: 'GamingHub ID', slug: 'gaminghub-id', desc: 'Peripheral gaming, konsol, dan aksesoris esports terlengkap.' },
      { email: 'periplus@seapedia.id', username: 'periplus_online', name: 'Periplus Online', hashKey: 'periplus', storeName: 'Periplus Online', slug: 'periplus-online', desc: 'Toko buku dan alat tulis terlengkap se-Indonesia.' },
    ];

    const storeIds: Record<string, string> = {};
    for (const s of sellersData) {
      let seller = await db.select().from(users).where(eq(users.email, s.email)).get();
      if (!seller) {
        const id = crypto.randomUUID();
        await db.insert(users).values({ id, username: s.username, email: s.email, password: HASHES[s.hashKey], fullName: s.name });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['BUYER'] });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['SELLER'] });
        await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 5000000 });
        seller = { id } as any;
      }
      let store = await db.select().from(stores).where(eq(stores.ownerId, seller!.id)).get();
      if (!store) {
        const storeId = crypto.randomUUID();
        await db.insert(stores).values({ id: storeId, ownerId: seller!.id, name: s.storeName, slug: s.slug, description: s.desc, rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)), totalSales: Math.floor(Math.random() * 5000) });
        store = { id: storeId } as any;
      }
      storeIds[s.slug] = store!.id;
    }

    const buyerAccounts = [
      { email: 'budi.santoso@gmail.com', username: 'budi_santoso', name: 'Budi Santoso', hashKey: 'budi' },
      { email: 'siti.rahayu@gmail.com', username: 'siti_rahayu', name: 'Siti Rahayu', hashKey: 'siti' },
      { email: 'ahmad.fauzi@gmail.com', username: 'ahmad_fauzi', name: 'Ahmad Fauzi', hashKey: 'ahmad' },
      { email: 'dewi.kartika@gmail.com', username: 'dewi_kartika', name: 'Dewi Kartika', hashKey: 'dewi' },
    ];
    for (const b of buyerAccounts) {
      const existing = await db.select().from(users).where(eq(users.email, b.email)).get();
      if (!existing) {
        const id = crypto.randomUUID();
        await db.insert(users).values({ id, username: b.username, email: b.email, password: HASHES[b.hashKey], fullName: b.name });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['BUYER'] });
        await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 2000000 });
      }
    }

    const driverAccounts = [
      { email: 'rudi.driver@seapedia.id', username: 'rudi_express', name: 'Rudi Hartono', hashKey: 'rudi' },
      { email: 'andi.kurir@seapedia.id', username: 'andi_kurir', name: 'Andi Prasetyo', hashKey: 'andi' },
    ];
    for (const d of driverAccounts) {
      const existing = await db.select().from(users).where(eq(users.email, d.email)).get();
      if (!existing) {
        const id = crypto.randomUUID();
        await db.insert(users).values({ id, username: d.username, email: d.email, password: HASHES[d.hashKey], fullName: d.name });
        await db.insert(userRoles).values({ userId: id, roleId: roleMap['DRIVER'] });
        await db.insert(wallets).values({ id: crypto.randomUUID(), userId: id, balance: 0 });
      }
    }

    const productDefs = [
      { store: 'techmart-indonesia', name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black', price: 18500000, compare: 20000000, stock: 20, weight: 230, cat: 'handphone-tablet', img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', sold: 410 },
      { store: 'techmart-indonesia', name: 'iPhone 16 Pro Max 512GB Desert Titanium', price: 25000000, compare: 27000000, stock: 10, weight: 227, cat: 'handphone-tablet', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', sold: 285 },
      { store: 'techmart-indonesia', name: 'Xiaomi 14 Ultra 512GB Titanium Grey', price: 14999000, compare: 16000000, stock: 25, weight: 220, cat: 'handphone-tablet', img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', sold: 310 },
      { store: 'techmart-indonesia', name: 'Apple iPad Pro M4 11-inch 256GB WiFi', price: 16000000, compare: 17500000, stock: 12, weight: 440, cat: 'handphone-tablet', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', sold: 175 },
      { store: 'techmart-indonesia', name: 'MacBook Pro M3 Pro 14-inch 512GB Space Black', price: 32000000, compare: 35000000, stock: 8, weight: 1610, cat: 'komputer-laptop', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', sold: 95 },
      { store: 'techmart-indonesia', name: 'Apple AirPods Pro 2nd Gen USB-C', price: 3850000, compare: 4200000, stock: 30, weight: 61, cat: 'elektronik', img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', sold: 680 },
      { store: 'gaminghub-id', name: 'ASUS ROG Strix G16 RTX 4070 Intel i9-14900HX', price: 29000000, compare: 32000000, stock: 6, weight: 2700, cat: 'komputer-laptop', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80', sold: 88 },
      { store: 'gaminghub-id', name: 'Logitech G Pro X Superlight 2 Wireless Mouse', price: 1800000, compare: 2100000, stock: 40, weight: 60, cat: 'komputer-laptop', img: 'https://images.unsplash.com/photo-1527814050087-3793815479fa?auto=format&fit=crop&w=800&q=80', sold: 920 },
      { store: 'gaminghub-id', name: 'Razer BlackWidow V4 Pro Mechanical Gaming Keyboard', price: 2500000, compare: 2900000, stock: 18, weight: 1300, cat: 'komputer-laptop', img: 'https://images.unsplash.com/photo-1601445638532-2f4d34e9ef5a?auto=format&fit=crop&w=800&q=80', sold: 340 },
      { store: 'gaminghub-id', name: 'Sony PlayStation 5 Slim Disc Edition', price: 9500000, compare: 10000000, stock: 15, weight: 3600, cat: 'elektronik', img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80', sold: 210 },
      { store: 'gaminghub-id', name: 'Corsair HS80 RGB Wireless Gaming Headset', price: 1500000, compare: 1800000, stock: 22, weight: 340, cat: 'elektronik', img: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80', sold: 450 },
      { store: 'glowskin-official', name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner', price: 180000, compare: 220000, stock: 200, weight: 150, cat: 'kecantikan', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80', sold: 12000 },
      { store: 'glowskin-official', name: 'COSRX Advanced Snail 96 Mucin Power Essence', price: 320000, compare: 380000, stock: 150, weight: 100, cat: 'kecantikan', img: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=800&q=80', sold: 8800 },
      { store: 'glowskin-official', name: 'Laneige Lip Sleeping Mask Berry 20g', price: 230000, compare: 280000, stock: 300, weight: 50, cat: 'kecantikan', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', sold: 25000 },
      { store: 'glowskin-official', name: 'Wardah Acnederm Niacinamide Serum 20ml', price: 75000, compare: 95000, stock: 400, weight: 80, cat: 'kecantikan', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80', sold: 35000 },
      { store: 'glowskin-official', name: 'SK-II Facial Treatment Essence 160ml', price: 1850000, compare: 2100000, stock: 30, weight: 250, cat: 'kecantikan', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', sold: 1200 },
      { store: 'healthplus-id', name: 'Blackmores Bio C 1000mg 60 Tablets', price: 195000, compare: 240000, stock: 200, weight: 200, cat: 'kesehatan', img: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=800&q=80', sold: 5600 },
      { store: 'healthplus-id', name: 'Enervon Active Multivitamin 30 Tablets', price: 75000, compare: 95000, stock: 500, weight: 100, cat: 'kesehatan', img: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a22?auto=format&fit=crop&w=800&q=80', sold: 22000 },
      { store: 'healthplus-id', name: 'Omron HEM-7120 Digital Blood Pressure Monitor', price: 380000, compare: 450000, stock: 80, weight: 500, cat: 'kesehatan', img: 'https://images.unsplash.com/photo-1526626334842-d8a93a53c2f7?auto=format&fit=crop&w=800&q=80', sold: 3200 },
      { store: 'healthplus-id', name: 'Neurobion Forte Merah Multivitamin B 30 Tablet', price: 55000, compare: 75000, stock: 400, weight: 80, cat: 'kesehatan', img: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=800&q=80', sold: 42000 },
      { store: 'urban-style-id', name: 'Kemeja Flannel Pria Premium Lengan Panjang Slim Fit', price: 145000, compare: 200000, stock: 300, weight: 350, cat: 'fashion-muslim', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', sold: 8500 },
      { store: 'urban-style-id', name: 'Celana Chino Pria Stretch All Size 28-38', price: 185000, compare: 250000, stock: 200, weight: 450, cat: 'fashion-muslim', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', sold: 12000 },
      { store: 'urban-style-id', name: 'Hoodie Oversize Unisex Premium Fleece Anti Pilling', price: 175000, compare: 250000, stock: 250, weight: 500, cat: 'fashion-muslim', img: 'https://images.unsplash.com/photo-1589810635656-7ee3ebc05f77?auto=format&fit=crop&w=800&q=80', sold: 15000 },
      { store: 'urban-style-id', name: 'Dress Midi Wanita Polos Vintage Premium', price: 220000, compare: 300000, stock: 150, weight: 300, cat: 'fashion-muslim', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', sold: 6800 },
      { store: 'freshmart-daily', name: 'Kopi Arabica Gayo Single Origin Specialty 500g', price: 185000, compare: 220000, stock: 100, weight: 520, cat: 'makanan-minuman', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80', sold: 2800 },
      { store: 'freshmart-daily', name: 'Madu Hutan Asli Kalimantan Raw Unfiltered 500ml', price: 145000, compare: 180000, stock: 80, weight: 600, cat: 'makanan-minuman', img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80', sold: 1900 },
      { store: 'freshmart-daily', name: 'Indomie Goreng Spesial Paket 40 Bungkus', price: 115000, compare: 135000, stock: 200, weight: 3200, cat: 'makanan-minuman', img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80', sold: 9500 },
      { store: 'freshmart-daily', name: 'Minyak Goreng Tropical Premium 2 Liter', price: 48000, compare: 60000, stock: 300, weight: 2100, cat: 'makanan-minuman', img: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80', sold: 7200 },
      { store: 'freshmart-daily', name: 'Beras Premium Pandan Wangi Cianjur 5kg', price: 78000, compare: 95000, stock: 150, weight: 5100, cat: 'makanan-minuman', img: 'https://images.unsplash.com/photo-1536304993881-ff86e6a8c2a7?auto=format&fit=crop&w=800&q=80', sold: 5400 },
      { store: 'sportszone-id', name: 'Nike Air Zoom Pegasus 40 Running Shoes', price: 1850000, compare: 2100000, stock: 40, weight: 780, cat: 'olahraga', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', sold: 2800 },
      { store: 'sportszone-id', name: 'Dumbell Set Adjustable 2x20KG Rubber Coated', price: 890000, compare: 1100000, stock: 30, weight: 40000, cat: 'olahraga', img: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=800&q=80', sold: 1500 },
      { store: 'sportszone-id', name: 'Yoga Mat Premium Non Slip 6mm TPE Material', price: 185000, compare: 250000, stock: 100, weight: 1200, cat: 'olahraga', img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80', sold: 6700 },
      { store: 'sportszone-id', name: 'Tenda Camping Gunung 2 Orang Waterproof 4000mm', price: 550000, compare: 700000, stock: 25, weight: 2500, cat: 'olahraga', img: 'https://images.unsplash.com/photo-1504280390267-33106d19467f?auto=format&fit=crop&w=800&q=80', sold: 890 },
      { store: 'homedeco-living', name: 'Miyako Blender Kaca MBT-2003 500W Anti Pecah', price: 285000, compare: 350000, stock: 60, weight: 3000, cat: 'home-living', img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80', sold: 3200 },
      { store: 'homedeco-living', name: 'Philips Rice Cooker Digital HD3195 1.8L 500W', price: 650000, compare: 800000, stock: 35, weight: 2800, cat: 'home-living', img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80', sold: 1800 },
      { store: 'homedeco-living', name: 'Set Panci Teflon Anti Lengket 5pcs Marble Series', price: 420000, compare: 600000, stock: 40, weight: 4000, cat: 'home-living', img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80', sold: 2100 },
      { store: 'homedeco-living', name: 'Lemari Pakaian 3 Pintu Sliding Mirror Premium', price: 3200000, compare: 4000000, stock: 8, weight: 45000, cat: 'home-living', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', sold: 320 },
      { store: 'autojaya-store', name: 'Aki Mobil GS Astra NS40ZL MF Maintenance Free', price: 680000, compare: 800000, stock: 20, weight: 9000, cat: 'otomotif', img: 'https://images.unsplash.com/photo-1504222490345-c075b626c6e6?auto=format&fit=crop&w=800&q=80', sold: 1200 },
      { store: 'autojaya-store', name: 'Cover Mobil Waterproof Silver Anti UV Avanza', price: 250000, compare: 350000, stock: 40, weight: 1500, cat: 'otomotif', img: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80', sold: 2100 },
      { store: 'autojaya-store', name: 'Parfum Mobil Little Tree Black Ice 3 Pcs', price: 85000, compare: 120000, stock: 200, weight: 100, cat: 'otomotif', img: 'https://images.unsplash.com/photo-1532154066703-3973764d5e5f?auto=format&fit=crop&w=800&q=80', sold: 8900 },
      { store: 'autojaya-store', name: 'Kaca Film 3M Crystalline Series 70 VLT Full Set', price: 1250000, compare: 1600000, stock: 15, weight: 500, cat: 'otomotif', img: 'https://images.unsplash.com/photo-1532154066703-3973764d5e5f?auto=format&fit=crop&w=800&q=80', sold: 560 },
      { store: 'periplus-online', name: 'Atomic Habits James Clear Edisi Bahasa Indonesia', price: 128000, compare: 165000, stock: 100, weight: 350, cat: 'home-living', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', sold: 5600 },
      { store: 'periplus-online', name: 'The Psychology of Money Morgan Housel', price: 135000, compare: 175000, stock: 80, weight: 300, cat: 'home-living', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', sold: 3800 },
    ];

    for (let i = 0; i < productDefs.length; i++) {
      const p = productDefs[i];
      const storeId = storeIds[p.store];
      if (!storeId) continue;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 80) + '-' + i;
      const existing = await db.select().from(products).where(eq(products.slug, slug)).get();
      if (!existing) {
        await db.insert(products).values({
          id: crypto.randomUUID(), storeId, categoryId: catIds[p.cat], name: p.name, slug,
          description: p.name + ' - Produk berkualitas tinggi dengan garansi resmi. Pengiriman aman ke seluruh Indonesia.',
          price: p.price, comparePrice: p.compare ?? null,
          rating: parseFloat((4.4 + Math.random() * 0.6).toFixed(1)),
          sold: p.sold, stock: p.stock, weight: p.weight,
          images: JSON.stringify([p.img])
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Seeding complete!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
