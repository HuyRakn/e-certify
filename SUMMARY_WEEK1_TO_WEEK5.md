# TÓM TẮT DỄ HIỂU (WEEK 1 → WEEK 5)
Giải thích ngắn gọn, không cần biết code, chỉ cần hiểu chức năng và cách dùng trên giao diện.

---

## Week 1 — Hạ tầng & Smart Contract
- **Merkle Tree & Collection (scripts/init-tree.ts, create-collection.ts)**  
  Tạo “cây” để lưu chứng chỉ cNFT nén và bộ sưu tập chung cho trường.
- **Smart Contract (credify_program/src/lib.rs)**  
  Mint/transfer/burn cNFT với cơ chế **Soulbound**: chứng chỉ gắn với ví sinh viên, không chuyển nhượng.
- **Admin Mint Service (ts/adminMint.ts + API /api/mint)**  
  Dịch vụ cho admin gửi yêu cầu mint thực tế, không mock.
- **Cách dùng UI:** chủ yếu dùng scripts + API; UI đầy đủ hơn ở tuần sau.

## Week 2 — Data Layer & Storage
- **Tạo ảnh chứng chỉ động (app/api/certificate/image)**  
  Nhập tên/major/ngày cấp → hệ thống vẽ ảnh PNG tự động (không dùng ảnh tĩnh).
- **Upload lên Arweave qua Irys (lib/arweave/irys.ts)**  
  Ảnh + metadata được lưu vĩnh viễn, phi tập trung.
- **Metadata chuẩn Metaplex (lib/utils/metadata-builder.ts)**  
  Đảm bảo thông tin NFT đúng chuẩn (name, symbol, image, attributes...).
- **CSV batch upload trên UI (admin/certify)**  
  Giáo viên tải CSV, hệ thống xử lý song song để chuẩn bị mint.
- **Cách dùng UI:** gọi API ảnh `/api/certificate/image?...`; trang admin/certify dùng CSV.

## Week 3 — Minting & Soulbound Logic
- **Kết nối ví Admin (Wallet Adapter) trong admin/certify**  
  Admin dùng ví Solana để ký giao dịch mint.
- **Batch mint tối ưu (TransactionBuilder)**  
  Gom nhiều lệnh mint vào 1 transaction → giảm phí, nhanh hơn.
- **Soulbound khi mint**  
  Trường là delegate (PDA), sinh viên không chuyển được chứng chỉ.
- **Student Passport (app/(platform)/passport)**  
  Sinh viên xem chứng chỉ trong ví; lọc theo Collection để bỏ NFT rác.
- **Cách dùng UI:** admin/certify (kết nối ví, upload CSV, mint); passport (kết nối ví sinh viên để xem).

## Week 4 — Viral Loop & Verification
- **Verifier page (public/verify/[assetId])**  
  Kiểm tra chứng chỉ: gọi Helius DAS, tính Merkle proof trên trình duyệt (zero-trust).  
  Hiển thị Verified (tick xanh) hoặc Fake (cảnh báo).
- **LinkedIn “Add to Profile”**  
  Nút mở LinkedIn với URL chuẩn, chèn link verify của trường.
- **Dynamic OG Image (/api/og/verify/[assetId])**  
  Khi share link verify lên Facebook/LinkedIn sẽ hiện ảnh xem trước của bằng.
- **Cách dùng UI:** mở link verify (vd: /verify/demo-asset-1); dùng nút LinkedIn share ngay trên trang.

## Week 5 — Polish UI, Optimize & Deploy
- **Skeleton loading**  
  Khi chờ RPC chậm: Verifier và Student Passport hiển thị khung xương (skeleton) thay vì trống.
- **Responsive mobile**  
  Passport và Verifier hiển thị tốt trên điện thoại (grid 1 cột, nút xếp dọc).
- **Hard Reset Demo (HARD_RESET_DEMO.md)**  
  Hướng dẫn tạo Merkle Tree/Collection mới, cập nhật .env để có data sạch quay video.
- **Deploy Env Checklist (DEPLOY_ENV_CHECKLIST.md)**  
  Danh sách biến môi trường cần cho Vercel (APP_URL, DAS_URL, MERKLE_TREE, COLLECTION, RPC…).
- **Cách dùng UI:** giống trước nhưng mượt hơn khi loading; có hướng dẫn reset và kiểm tra env trước deploy.

---

## Cách test nhanh (dành cho người xem)
- **Mint & Admin:** `/admin/certify` → kết nối ví → upload CSV → mint.
- **Xem chứng chỉ (SV):** `/passport` → kết nối ví sinh viên → thấy danh sách (lọc spam).
- **Verify:** `/verify/<assetId>` → thấy trạng thái Verified/Fake, có nút LinkedIn + xem OG image khi share.
- **Ảnh chứng chỉ động:** `/api/certificate/image?name=...&major=...&issueDate=...`

## File hướng dẫn bổ trợ
- `HARD_RESET_DEMO.md` — Reset data demo, tạo tree/collection mới.
- `DEPLOY_ENV_CHECKLIST.md` — Check biến môi trường trước deploy.
# TÓM TẮT DỄ HIỂU (WEEK 1 → WEEK 5)
Giải thích ngắn gọn, không cần biết code, chỉ cần hiểu chức năng và cách dùng trên giao diện.

---

## Week 1 — Hạ tầng & Smart Contract
- **Merkle Tree & Collection (scripts/init-tree.ts, create-collection.ts)**  
  Tạo “cây” để lưu chứng chỉ cNFT nén và bộ sưu tập chung cho trường.
- **Smart Contract (credify_program/src/lib.rs)**  
  Mint/transfer/burn cNFT với cơ chế **Soulbound**: chứng chỉ gắn với ví sinh viên, không chuyển nhượng.
- **Admin Mint Service (ts/adminMint.ts + API /api/mint)**  
  Dịch vụ cho admin gửi yêu cầu mint thực tế, không mock.
- **Cách dùng UI:** chưa có UI đầy đủ; chủ yếu là scripts + API mint.

## Week 2 — Data Layer & Storage
- **Tạo ảnh chứng chỉ động (app/api/certificate/image)**  
  Nhập tên/major/ngày cấp → hệ thống vẽ ảnh PNG tự động (không dùng ảnh tĩnh).
- **Upload lên Arweave qua Irys (lib/arweave/irys.ts)**  
  Ảnh + metadata được lưu vĩnh viễn, phi tập trung.
- **Metadata chuẩn Metaplex (lib/utils/metadata-builder.ts)**  
  Đảm bảo thông tin NFT đúng chuẩn (name, symbol, image, attributes...).
- **CSV batch upload trên UI (admin/certify)**  
  Giáo viên tải CSV, hệ thống xử lý song song (Promise.all) để chuẩn bị mint.
- **Cách dùng UI:** gọi API ảnh `/api/certificate/image?...`, trang admin/certify cho CSV.

## Week 3 — Minting & Soulbound Logic
- **Kết nối ví Admin (Wallet Adapter) trong admin/certify**  
  Admin dùng ví Solana để ký giao dịch mint.
- **Batch mint tối ưu (TransactionBuilder)**  
  Gom nhiều lệnh mint vào 1 transaction → giảm phí, nhanh hơn.
- **Soulbound khi mint**  
  Trường là delegate (PDA), sinh viên không chuyển được chứng chỉ.
- **Student Passport (app/(platform)/passport)**  
  Sinh viên xem chứng chỉ trong ví; lọc theo Collection để bỏ NFT rác.
- **Cách dùng UI:** admin/certify (kết nối ví, upload CSV, mint); passport (kết nối ví sinh viên để xem).

## Week 4 — Viral Loop & Verification
- **Verifier page (public/verify/[assetId])**  
  Kiểm tra chứng chỉ: gọi Helius DAS, tính Merkle proof trên trình duyệt (zero-trust).  
  Hiển thị Verified (tick xanh) hoặc Fake (cảnh báo).
- **LinkedIn “Add to Profile”**  
  Nút mở LinkedIn với URL chuẩn, chèn link verify của trường.
- **Dynamic OG Image (/api/og/verify/[assetId])**  
  Khi share link verify lên Facebook/LinkedIn sẽ hiện ảnh xem trước của bằng.
- **Cách dùng UI:** mở link verify (vd: /verify/demo-asset-1); dùng nút LinkedIn share ngay trên trang.

## Week 5 — Polish UI, Optimize & Deploy
- **Skeleton loading**  
  Khi chờ RPC chậm: Verifier và Student Passport hiển thị khung xương (skeleton) thay vì trống.
- **Responsive mobile**  
  Passport và Verifier hiển thị tốt trên điện thoại (grid 1 cột, nút xếp dọc).
- **Hard Reset Demo (HARD_RESET_DEMO.md)**  
  Hướng dẫn tạo Merkle Tree/Collection mới, cập nhật .env để có data sạch quay video.
- **Deploy Env Checklist (DEPLOY_ENV_CHECKLIST.md)**  
  Danh sách biến môi trường cần có cho Vercel (APP_URL, DAS_URL, MERKLE_TREE, COLLECTION, RPC…).
- **Cách dùng UI:** như cũ nhưng mượt hơn khi loading; có hướng dẫn reset và kiểm tra env trước deploy.

---

## Cách test nhanh (dành cho người xem)
- **Mint & Admin:** `/admin/certify` → kết nối ví → upload CSV → mint.
- **Xem chứng chỉ (SV):** `/passport` → kết nối ví sinh viên → thấy danh sách (lọc spam).
- **Verify:** `/verify/<assetId>` → thấy trạng thái Verified/Fake, có nút LinkedIn + xem OG image khi share.
- **Ảnh chứng chỉ động:** `/api/certificate/image?name=...&major=...&issueDate=...`

## File hướng dẫn bổ trợ
- `HARD_RESET_DEMO.md` — Reset data demo, tạo tree/collection mới.
- `DEPLOY_ENV_CHECKLIST.md` — Check biến môi trường trước deploy.

