# Changelog Week 1 → Week 5
Tóm tắt nhanh những thay đổi chính, kèm khu vực mã liên quan để tiện tra cứu khi làm việc trên máy khác.

## Week 1 — Hạ tầng & Smart Contract
- Khởi tạo Merkle Tree/Collection cho cNFT nén qua scripts `scripts/init-tree.ts`, `scripts/create-collection.ts`.
- Triển khai smart contract Anchor tại `credify_program/src/lib.rs` với logic Soulbound (không chuyển nhượng).
- Dịch vụ mint cho admin (`ts/adminMint.ts`) và API mint thực tế (`app/api/mint` liên quan trong mã).

## Week 2 — Data Layer & Storage
- Tạo ảnh chứng chỉ động tại `app/api/certificate/image/route.ts`.
- Upload Arweave qua Irys (`lib/arweave/irys.ts`), chuẩn hóa metadata với `lib/utils/metadata-builder.ts`.
- Hỗ trợ upload CSV và chuẩn bị batch mint trên UI `app/(platform)/admin/certify`.

## Week 3 — Minting & Soulbound UX
- Tích hợp ví admin, gom lệnh mint trong một giao dịch để tối ưu phí (các trang admin/certify).
- Áp dụng delegate/PDA để Soulbound khi mint.
- Student Passport (`app/(platform)/passport`) hiển thị chứng chỉ theo Collection, lọc NFT rác.

## Week 4 — Verify & Chia sẻ
- Trang verifier công khai `app/(public)/verify/[assetId]` (gọi Helius DAS, tính Merkle proof client-side).
- Nút LinkedIn Add-to-Profile `app/(public)/verify/[assetId]/linkedin-button-client.tsx`.
- Ảnh OG động khi share: `app/api/og/verify/[assetId]/route.tsx`.

## Week 5 — Polish & Deploy-readiness
- Skeleton loading và tối ưu trải nghiệm chờ (Verifier/Passport dùng `app/components/ui/skeleton.tsx`).
- Điều chỉnh responsive/mobile cho Passport và Verifier.
- Dọn dẹp, tối ưu cấu hình deploy (Vercel, RPC/DAS proxy), cập nhật `vercel.json` và middleware.

## Cách kiểm tra nhanh
- Mint & Admin: `/admin/certify` → kết nối ví → upload CSV → mint.
- Sinh viên: `/passport` → kết nối ví → xem chứng chỉ lọc theo Collection.
- Verify: `/verify/<assetId>` → trạng thái Verified/Fake, nút LinkedIn, OG image khi share.

