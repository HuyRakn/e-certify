# 🔄 Hard Reset Demo Data (Clean State)

Chuẩn bị data sạch để quay video demo: tạo Merkle Tree & Collection mới, cập nhật env, và làm sạch file tạm.

## 1) Tạo Merkle Tree mới (Devnet)
```
# Chạy bằng ts-node (đã cài trong project)
ts-node scripts/init-tree.ts
```
- Ghi lại `Merkle Tree Address` mới (in ra console).

## 2) (Tuỳ chọn) Tạo Collection mới
```
ts-node scripts/create-collection.ts
```
- Ghi lại `Collection Mint Address` mới.

## 3) Cập nhật biến môi trường
- File `.env.local` (local) và Vercel Project Env:
  - `MERKLE_TREE=<tree_moi>`
  - `NEXT_PUBLIC_APEC_COLLECTION=<collection_moi>`
  - `COLLECTION_MINT=<collection_moi>` (nếu backend dùng)
  - `RPC_URL` hoặc `NEXT_PUBLIC_HELIUS_API_KEY_URL` (Devnet)

## 4) Làm sạch file tạm/demo
- Xoá CSV cũ nếu có trong repo hoặc local uploads.
- Đảm bảo `public/fonts/Inter-Regular.ttf` vẫn còn (font cần cho render ảnh).

## 5) Kiểm tra nhanh sau reset
```
# 1. Build verify OG image (đảm bảo env ok)
npm run build -- --no-lint   # hoặc npm run build nếu env đầy đủ

# 2. Test demo routes
http://localhost:3000/verify/demo-asset-1
http://localhost:3000/passport   (kết nối ví Devnet)
http://localhost:3000/api/og/verify/demo-asset-1
```

## 6) Nếu cần xoá toàn bộ data cũ (on-chain)
- Devnet: chỉ cần tạo tree/collection mới và dùng env mới. Không cần “xoá” on-chain.
- Đảm bảo Frontend/API đều dùng địa chỉ mới để không hiển thị dữ liệu cũ.

