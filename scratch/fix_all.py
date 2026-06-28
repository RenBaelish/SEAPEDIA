import os

# 1. Fix backend/src/routes/reviews.ts imports and remove dynamic imports
reviews_path = r'd:\Projek\Compest Soft Eng\SEAPEDIA-new\backend\src\routes\reviews.ts'
with open(reviews_path, 'r', encoding='utf-8') as f:
    reviews_content = f.read()

# Add missing schemas to top import
if "orders, orderItems, products, stores" not in reviews_content:
    reviews_content = reviews_content.replace(
        "import { reviews, users } from '../db/schema';",
        "import { reviews, users, orders, orderItems, products, stores } from '../db/schema';"
    )
if "and" not in reviews_content.split('\n')[5]:
    reviews_content = reviews_content.replace(
        "import { eq, desc } from 'drizzle-orm';",
        "import { eq, desc, and } from 'drizzle-orm';"
    )

# Remove dynamic imports inside the route
reviews_content = reviews_content.replace(
    "const { orders, orderItems, products, stores } = await import('../db/schema');\n  const { eq, and } = await import('drizzle-orm');",
    ""
)

# Fix the GET product review dynamic imports too if they exist
reviews_content = reviews_content.replace(
    "const { eq, desc } = await import('drizzle-orm');",
    ""
)

with open(reviews_path, 'w', encoding='utf-8') as f:
    f.write(reviews_content)


# 2. Fix backend/src/routes/orders.ts (Increment sold and totalSales when PESANAN_SELESAI)
orders_path = r'd:\Projek\Compest Soft Eng\SEAPEDIA-new\backend\src\routes\orders.ts'
with open(orders_path, 'r', encoding='utf-8') as f:
    orders_content = f.read()

increment_logic = """
      const itemsForSales = await db.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))
        .all();
      let totalItemsSold = 0;
      for (const item of itemsForSales) {
        totalItemsSold += item.quantity;
        const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
        if (product) {
          await db.update(products).set({ sold: product.sold + item.quantity }).where(eq(products.id, product.id));
        }
      }
      await db.update(stores).set({ totalSales: store.totalSales + totalItemsSold }).where(eq(stores.id, store.id));
"""
if "totalItemsSold" not in orders_content:
    orders_content = orders_content.replace(
        "      const productNames = items.map(i => i.productName).join(', ');",
        increment_logic + "\n      const productNames = items.map(i => i.productName).join(', ');"
    )

with open(orders_path, 'w', encoding='utf-8') as f:
    f.write(orders_content)


# 3. Fix backend/src/routes/products.ts (include storeRating and storeTotalSales)
products_path = r'd:\Projek\Compest Soft Eng\SEAPEDIA-new\backend\src\routes\products.ts'
with open(products_path, 'r', encoding='utf-8') as f:
    products_content = f.read()

products_content = products_content.replace(
    "storeLogoUrl: stores.logoUrl\n    })",
    "storeLogoUrl: stores.logoUrl,\n      storeRating: stores.rating,\n      storeTotalSales: stores.totalSales\n    })"
)
products_content = products_content.replace(
    "storeLogoUrl: stores.logoUrl\n      })",
    "storeLogoUrl: stores.logoUrl,\n        storeRating: stores.rating,\n        storeTotalSales: stores.totalSales\n      })"
)

with open(products_path, 'w', encoding='utf-8') as f:
    f.write(products_content)


# 4. Fix ProductDetailPage.tsx (Add storeRating and totalSales logic)
pdp_path = r'd:\Projek\Compest Soft Eng\SEAPEDIA-new\frontend\src\features\product\pages\ProductDetailPage.tsx'
with open(pdp_path, 'r', encoding='utf-8') as f:
    pdp_content = f.read()

store_info_replacement = """                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img src="/icon/verify-icon.png" alt="verified" className="w-3.5 h-3.5 object-contain" />
                    <Link to={`/store/${product.storeSlug}`} className="text-sm font-extrabold text-nb-black hover:text-nb-blue transition-colors truncate">
                      {product.storeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-nb-yellow text-nb-yellow" />
                      <span className="font-bold text-nb-black">{(product.storeRating || 0).toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span className="font-bold text-nb-black">{formatSold(product.storeTotalSales || 0)} Terjual</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} />
                      <span>Jakarta</span>
                    </div>
                  </div>"""

pdp_content = pdp_content.replace(
    """                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img src="/icon/verify-icon.png" alt="verified" className="w-3.5 h-3.5 object-contain" />
                    <Link to={`/store/${product.storeSlug}`} className="text-sm font-extrabold text-nb-black hover:text-nb-blue transition-colors truncate">
                      {product.storeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    <span>Jakarta, Indonesia</span>
                  </div>""",
    store_info_replacement
)

with open(pdp_path, 'w', encoding='utf-8') as f:
    f.write(pdp_content)

print("All modifications successfully applied.")
