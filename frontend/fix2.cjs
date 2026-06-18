const fs = require('fs');
const path = require('path');

let footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
footer = footer.replace(/Facebook, Twitter, Instagram, Youtube/g, 'Github');
footer = footer.replace(/<Facebook[^>]*>/g, '<Github size={20} />');
footer = footer.replace(/<Twitter[^>]*>/g, '<Github size={20} />');
footer = footer.replace(/<Instagram[^>]*>/g, '<Github size={20} />');
footer = footer.replace(/<Youtube[^>]*>/g, '<Github size={20} />');
fs.writeFileSync('src/components/layout/Footer.tsx', footer);

let card = fs.readFileSync('src/components/ui/Card.tsx', 'utf8');
if (!card.includes('import React')) card = "import React from 'react';\n" + card;
fs.writeFileSync('src/components/ui/Card.tsx', card);

let cart = fs.readFileSync('src/features/cart/pages/CartPage.tsx', 'utf8');
cart = cart.replace(/store\.slug/g, '(store as any).slug');
cart = cart.replace(/item\.product\.comparePrice/g, '(item.product as any).comparePrice');
cart = cart.replace(/item\.product\.slug/g, '(item.product as any).slug');
fs.writeFileSync('src/features/cart/pages/CartPage.tsx', cart);

let sellerForm = fs.readFileSync('src/features/dashboard/seller/pages/SellerProductFormPage.tsx', 'utf8');
sellerForm = sellerForm.replace(/invalid_type_error_removed:\s*\"[^\"]*\",?/g, '');
fs.writeFileSync('src/features/dashboard/seller/pages/SellerProductFormPage.tsx', sellerForm);

let api = fs.readFileSync('src/lib/api.ts', 'utf8');
api = api.replace(/import\.meta\.env\.VITE_API_URL/g, '(import.meta as any).env.VITE_API_URL');
fs.writeFileSync('src/lib/api.ts', api);

if (fs.existsSync('src/app.tsx') && !fs.existsSync('src/App.tsx')) {
  fs.renameSync('src/app.tsx', 'src/App.tsx');
}
