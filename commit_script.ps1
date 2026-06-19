git reset HEAD~7

git add backend/
git commit -m "feat(backend): implement store settings API, wallet routes, and product image uploads"

git add frontend/src/types/ frontend/src/router/
git commit -m "feat(frontend): define types and routing for store, wallet, and product features"

git add frontend/src/features/dashboard/
git commit -m "feat(frontend): implement seller dashboard views for store settings and product multi-image uploads"

git add frontend/src/features/product/pages/ProductDetailPage.tsx frontend/src/components/shared/ProductCard.tsx
git commit -m "feat(frontend): refine product detail UI and update typography across product components"

git add frontend/src/components/layout/DashboardShell.tsx
git commit -m "feat(frontend): enhance dashboard shell with dynamic seller profile integration"

git add frontend/src/components/layout/Navbar.tsx frontend/tailwind.config.js
git commit -m "feat(frontend): redesign navbar interface with dynamic dropdowns and smooth animations"

git add .
git commit -m "fix(frontend): resolve UI inconsistencies and update global layout components"
