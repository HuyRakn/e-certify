# 📋 CHECKLIST TUẦN 4: VIRAL LOOP & VERIFICATION

## 🎯 MỤC TIÊU
Xây dựng hệ thống verification zero-trust với Merkle proof verification, LinkedIn integration, và Dynamic OG Image.

---

## ✅ PHASE 1: VERIFIER PORTAL (ZERO-TRUST)

### 1.1. **Cải thiện trang `/verify/[assetId]`**
**Dùng để:** Trang public verification không cần authentication

**Tasks:**
- [ ] **Cải thiện logic hiện tại:**
  - [ ] Lấy `assetId` từ URL params
  - [ ] Gọi Helius API `getAssetProof` để lấy Merkle proof
  - [ ] Gọi Helius API `getAsset` để lấy asset data
  - [ ] Hiển thị loading state khi đang verify

**Files cần sửa:**
- `app/(public)/verify/[assetId]/page.tsx` - Cải thiện logic verify
- `app/components/VerificationPage.tsx` - Update component

---

### 1.2. **Client-side Merkle Root Verification**
**Dùng để:** Tính toán Merkle root từ proof và so sánh với root on-chain (Zero-Trust)

**Tasks:**
- [ ] **Tạo utility function:**
  - [ ] `lib/utils/merkle-verification.ts` - Functions để verify Merkle proof
  - [ ] Function `calculateMerkleRoot(leaf, proof)` - Tính root từ leaf và proof
  - [ ] Function `verifyMerkleProof(leaf, proof, expectedRoot)` - So sánh với root on-chain
  - [ ] Sử dụng `@solana/spl-account-compression` hoặc tự implement Merkle tree logic

- [ ] **Integrate vào VerificationPage:**
  - [ ] Sau khi lấy proof từ API, tính toán root client-side
  - [ ] So sánh với root từ on-chain (từ Merkle Tree account)
  - [ ] Hiển thị kết quả: ✅ Verified (nếu match) hoặc ❌ Fake (nếu không match)

**Files cần tạo:**
- `lib/utils/merkle-verification.ts` - Merkle proof verification utilities

**Files cần sửa:**
- `app/components/VerificationPage.tsx` - Thêm Merkle root verification logic

---

### 1.3. **UI States cho Verification**
**Dùng để:** Hiển thị rõ ràng kết quả verification

**Tasks:**
- [ ] **Verified State (Tick xanh):**
  - [ ] Icon: ShieldCheck (green)
  - [ ] Text: "VERIFIED - This credential is authentic"
  - [ ] Hiển thị Merkle root comparison result
  - [ ] Hiển thị proof steps count

- [ ] **Fake State (Cảnh báo đỏ):**
  - [ ] Icon: AlertTriangle (red)
  - [ ] Text: "FAKE - This credential could not be verified"
  - [ ] Hiển thị lý do: Root mismatch, invalid proof, etc.

**Files cần sửa:**
- `app/components/VerificationPage.tsx` - Update UI states

---

## ✅ PHASE 2: LINKEDIN INTEGRATION

### 2.1. **Nút "Add to LinkedIn"**
**Dùng để:** Cho phép sinh viên share chứng chỉ lên LinkedIn

**Tasks:**
- [ ] **Tạo component/button:**
  - [ ] Component `LinkedInShareButton` hoặc thêm vào `VerificationPage`
  - [ ] Icon LinkedIn (có thể dùng lucide-react hoặc custom SVG)
  - [ ] Text: "Add to LinkedIn" hoặc "Share on LinkedIn"

- [ ] **Cấu trúc URL chuẩn LinkedIn:**
  - [ ] Format: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name={certificateName}&organizationName={institution}&issueYear={year}&issueMonth={month}&certUrl={verifyUrl}&certId={assetId}`
  - [ ] `certUrl` phải trỏ về: `https://yourdomain.com/verify/[assetId]`
  - [ ] Extract metadata từ asset để fill các fields

**Files cần tạo/sửa:**
- `app/components/LinkedInShareButton.tsx` - Component mới (optional)
- `app/components/VerificationPage.tsx` - Thêm LinkedIn button
- `app/(public)/verify/[assetId]/page.tsx` - Thêm LinkedIn button vào verified state

---

### 2.2. **LinkedIn URL Builder**
**Dùng để:** Build URL LinkedIn với đúng format

**Tasks:**
- [ ] **Tạo utility function:**
  - [ ] `lib/utils/linkedin-share.ts` - Function `buildLinkedInUrl(asset, verifyUrl)`
  - [ ] Extract: certificate name, institution, issue date (year/month)
  - [ ] Build URL với query parameters đúng format

**Files cần tạo:**
- `lib/utils/linkedin-share.ts` - LinkedIn URL builder

---

## ✅ PHASE 3: DYNAMIC OG IMAGE

### 3.1. **Setup Vercel OG**
**Dùng để:** Tạo ảnh xem trước động khi share link verify lên Facebook/LinkedIn

**Tasks:**
- [ ] **Cài đặt package:**
  - [ ] `npm install @vercel/og` hoặc `next-seo` (nếu dùng next-seo)
  - [ ] Kiểm tra Next.js version compatibility

- [ ] **Tạo OG Image Route:**
  - [ ] `app/api/og/verify/[assetId]/route.tsx` - Route để generate OG image
  - [ ] Sử dụng `ImageResponse` từ `@vercel/og`
  - [ ] Fetch asset data từ Helius API
  - [ ] Render ảnh với thông tin: Certificate name, institution, issue date, verified badge

**Files cần tạo:**
- `app/api/og/verify/[assetId]/route.tsx` - OG image generation route

---

### 3.2. **Metadata cho Verify Page**
**Dùng để:** Set OG tags cho trang verify để social media hiển thị đúng

**Tasks:**
- [ ] **Update metadata trong verify page:**
  - [ ] `app/(public)/verify/[assetId]/page.tsx` - Thêm `generateMetadata` function
  - [ ] Dynamic `og:image` trỏ về `/api/og/verify/[assetId]`
  - [ ] Dynamic `og:title` với certificate name
  - [ ] Dynamic `og:description` với certificate description
  - [ ] `og:url` trỏ về verify page URL

**Files cần sửa:**
- `app/(public)/verify/[assetId]/page.tsx` - Thêm `generateMetadata` function

---

### 3.3. **OG Image Design**
**Dùng để:** Thiết kế ảnh xem trước đẹp và chuyên nghiệp

**Tasks:**
- [ ] **Design layout:**
  - [ ] Background: Brand color hoặc gradient
  - [ ] Certificate name (large, bold)
  - [ ] Institution name
  - [ ] Issue date
  - [ ] Verified badge/icon
  - [ ] Logo APEC (nếu có)

- [ ] **Sử dụng Vercel OG:**
  - [ ] Render HTML-like structure với JSX
  - [ ] Sử dụng fonts (Inter, Roboto)
  - [ ] Size: 1200x630px (standard OG image size)

**Files cần sửa:**
- `app/api/og/verify/[assetId]/route.tsx` - Design OG image layout

---

## ✅ PHASE 4: INTEGRATION & TESTING

### 4.1. **Integration Testing**
**Dùng để:** Test toàn bộ flow verification

**Tasks:**
- [ ] **Test Merkle Proof Verification:**
  - [ ] Test với asset ID hợp lệ → Should verify ✅
  - [ ] Test với asset ID không tồn tại → Should show ❌ Fake
  - [ ] Test với proof invalid → Should show ❌ Fake
  - [ ] Test root mismatch → Should show ❌ Fake

- [ ] **Test LinkedIn Integration:**
  - [ ] Click "Add to LinkedIn" → Should open LinkedIn với URL đúng format
  - [ ] Verify URL có đầy đủ parameters
  - [ ] Verify `certUrl` trỏ về verify page

- [ ] **Test OG Image:**
  - [ ] Share link verify lên Facebook → Should hiển thị OG image
  - [ ] Share link verify lên LinkedIn → Should hiển thị OG image
  - [ ] Test với nhiều asset IDs khác nhau → Should hiển thị đúng metadata

**Test URLs:**
- `http://localhost:3000/verify/[assetId]` - Verify page
- `http://localhost:3000/api/og/verify/[assetId]` - OG image

---

## 📁 FILES CẦN TẠO/SỬA

### Files mới:
1. `lib/utils/merkle-verification.ts` - Merkle proof verification utilities
2. `lib/utils/linkedin-share.ts` - LinkedIn URL builder
3. `app/api/og/verify/[assetId]/route.tsx` - OG image generation route
4. `app/components/LinkedInShareButton.tsx` - LinkedIn share button (optional)

### Files cần sửa:
1. `app/(public)/verify/[assetId]/page.tsx` - Cải thiện verify logic + thêm metadata
2. `app/components/VerificationPage.tsx` - Thêm Merkle root verification + LinkedIn button
3. `package.json` - Thêm dependency `@vercel/og` (nếu chưa có)

---

## 🔧 DEPENDENCIES CẦN THIẾT

### Cần cài đặt:
- `@vercel/og` - Dynamic OG image generation
- `@solana/spl-account-compression` - Merkle tree utilities (có thể đã có)

### Đã có sẵn:
- `@solana/web3.js` - Web3 interactions
- Helius RPC URL - Cho DAS API calls

---

## 🧪 CÁCH TEST

### Test 1: Merkle Proof Verification
```
1. Truy cập: http://localhost:3000/verify/[assetId]
2. Xem console logs để verify Merkle root calculation
3. Kiểm tra UI: ✅ Verified hoặc ❌ Fake
```

### Test 2: LinkedIn Integration
```
1. Verify một credential
2. Click "Add to LinkedIn"
3. Kiểm tra URL có đúng format không
4. Kiểm tra certUrl trỏ về verify page
```

### Test 3: OG Image
```
1. Share link: http://localhost:3000/verify/[assetId]
2. Facebook Debugger: https://developers.facebook.com/tools/debug/
3. LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
4. Kiểm tra ảnh xem trước hiển thị đúng
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Merkle Root Verification:**
   - Phải tính toán root từ proof client-side
   - So sánh với root on-chain (từ Merkle Tree account)
   - Không trust server response (Zero-Trust)

2. **LinkedIn URL Format:**
   - Phải tuân thủ format chuẩn LinkedIn
   - `certUrl` phải là absolute URL (không phải relative)
   - Extract metadata chính xác từ asset

3. **OG Image:**
   - Phải là dynamic (fetch data từ API)
   - Size: 1200x630px
   - Render nhanh (cache nếu có thể)

---

## 📝 TÓM TẮT

### Tuần 4 sẽ làm:
1. ✅ **Verifier Portal** - Zero-trust verification với Merkle root calculation
2. ✅ **LinkedIn Integration** - Nút share với URL chuẩn
3. ✅ **Dynamic OG Image** - Ảnh xem trước khi share link

### Kết quả mong đợi:
- Admin/Sinh viên có thể share chứng chỉ lên LinkedIn
- Khi share, hiển thị ảnh xem trước đẹp với thông tin certificate
- Verification hoàn toàn zero-trust (client-side Merkle proof verification)

