# ✅ Vercel Deploy Env Checklist (Production)

Các biến môi trường cần cấu hình trước khi deploy Vercel (Prod/Preview):

## Frontend (public)
- `NEXT_PUBLIC_APP_URL` — Base URL prod (vd: https://e-certify.vercel.app)
- `NEXT_PUBLIC_DAS_URL` — Helius DAS endpoint (Devnet)
- `NEXT_PUBLIC_HELIUS_API_KEY_URL` — RPC URL Devnet (nếu dùng)
- `NEXT_PUBLIC_SOLANA_RPC_URL` — RPC dự phòng Devnet
- `NEXT_PUBLIC_APEC_COLLECTION` — Collection Mint để filter cNFT

## On-chain config
- `MERKLE_TREE` — Merkle tree address hiện hành
- `COLLECTION_MINT` — Collection mint address

## Minting / Scripts
- `PAYER_SECRET_KEY` — (JSON array) chỉ set ở server nếu cần mint từ backend/scripts
- `ANCHOR_PROVIDER_URL` — RPC cho Anchor (Devnet)
- `ANCHOR_WALLET` — Path keypair (cho scripts, không public)

## Storage (Irys / Arweave)
- `RPC_URL` — RPC cho Irys client (Devnet)
- `IRYS_*` keys nếu dùng (nếu không, để trống)

## OG / Social
- Không cần biến riêng, nhưng `NEXT_PUBLIC_APP_URL` phải đúng để generate `og:image` và LinkedIn `certUrl`.

## Kiểm tra trước build
```
npm run lint
npm run build -- --no-lint   # hoặc npm run build nếu env đầy đủ
```
- Đảm bảo route edge `app/api/og/verify/[assetId]/route.tsx` không thiếu env.
- Nếu thiếu RPC/HELIUS, DAS proxy `/api/das` sẽ lỗi → cần set `NEXT_PUBLIC_DAS_URL`.

