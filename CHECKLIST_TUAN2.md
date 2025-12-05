# 📋 CHECKLIST TRIỂN KHAI TUẦN 2 - DATA LAYER & STORAGE

## 🎯 MỤC TIÊU
Xây dựng hệ thống tạo ảnh động, upload metadata và images lên Arweave (qua Irys), và batch processing cho việc mint credentials với đầy đủ metadata theo chuẩn Metaplex.

---

## 📊 PHÂN TÍCH HIỆN TRẠNG

### ✅ Đã có:
- ✅ Admin certify page với CSV upload (`app/(platform)/admin/certify/page.tsx`)
- ✅ API route `/api/mint` để batch mint
- ✅ Admin minting service (`ts/adminMint.ts`)
- ✅ Metadata structure cơ bản (nhưng chưa có image và attributes đầy đủ)
- ✅ CSV parsing manual (chưa dùng papaparse)

### ❌ Cần implement:
- ❌ Image generation API (satori/canvas)
- ❌ Irys SDK integration cho Arweave upload
- ❌ Metadata JSON structure đầy đủ theo Metaplex standard
- ❌ Batch processing với Promise.all cho parallel upload
- ❌ CSV parsing với papaparse (thay thế manual parsing)

---

## ✅ CHECKLIST CHI TIẾT

### **PHASE 1: Cài đặt Dependencies** 📦

#### 1.1. Install Image Generation Libraries
- [ ] **Cài `satori`**: `npm install satori` - SVG to PNG conversion
- [ ] **Cài `@vercel/og`** (optional): Nếu muốn dùng Vercel OG Image API
- [ ] **Hoặc `canvas`**: `npm install canvas` - Alternative cho server-side rendering
- [ ] **Cài `sharp`**: `npm install sharp` - Image processing (recommended với satori)

#### 1.2. Install Arweave/Irys SDK
- [ ] **Cài `@irys/sdk`**: `npm install @irys/sdk` - Irys SDK cho Arweave upload
- [ ] **Cài `arweave`** (nếu cần): `npm install arweave` - Direct Arweave access (optional)

#### 1.3. Install CSV Parsing Library
- [ ] **Cài `papaparse`**: `npm install papaparse` - CSV parsing library
- [ ] **Cài `@types/papaparse`**: `npm install --save-dev @types/papaparse` - TypeScript types

#### 1.4. Verify Dependencies
- [ ] Kiểm tra `package.json` đã có đủ dependencies
- [ ] Chạy `npm install` để cài đặt

---

### **PHASE 2: Image Generation API** 🎨

#### 2.1. Tạo API Route cho Image Generation
- [ ] **Tạo `app/api/certificate/image/route.ts`**:
  - [ ] Setup satori với fonts (có thể dùng Google Fonts hoặc local fonts)
  - [ ] Design certificate template với:
    - University logo/branding
    - Student name
    - Major/degree
    - Issue date
    - Certificate number/ID
    - QR code (optional)
  - [ ] Export function `generateCertificateImage(studentData)`:
    - Input: `{ name, major, issueDate, email, ... }`
    - Output: `Buffer` (PNG image)
  - [ ] Handle errors và return proper HTTP responses

#### 2.2. Certificate Design Specifications
- [ ] **Kích thước**: 1200x800px (hoặc 16:9 ratio)
- [ ] **Màu sắc**: Brand colors (theo design system)
- [ ] **Typography**: Professional fonts (có thể dùng Inter, Roboto)
- [ ] **Layout**: 
  - Header: University name/logo
  - Center: Student name (large)
  - Subtitle: Major/Degree
  - Footer: Issue date, Certificate ID
- [ ] **Background**: Gradient hoặc pattern (không dùng static image)

#### 2.3. Test Image Generation
- [ ] Test API endpoint với sample data
- [ ] Verify image được generate đúng format (PNG)
- [ ] Verify image có đầy đủ thông tin student
- [ ] Test với nhiều students khác nhau

---

### **PHASE 3: Irys/Arweave Integration** 🌐

#### 3.1. Setup Irys SDK
- [ ] **Tạo utility file `lib/arweave/irys.ts`**:
  - [ ] Import `@irys/sdk`
  - [ ] Setup Irys instance với Node Devnet (miễn phí):
    ```typescript
    const irys = new Irys({
      url: 'https://devnet.irys.xyz',
      token: 'solana',
      key: payerPrivateKey, // Từ PAYER_SECRET_KEY
    });
    ```
  - [ ] Export functions:
    - `uploadImage(buffer: Buffer, filename: string): Promise<string>` - Upload image, return Arweave URL
    - `uploadMetadata(metadata: object, filename: string): Promise<string>` - Upload JSON, return Arweave URL

#### 3.2. Environment Variables
- [ ] **Thêm vào `.env.local`**:
  ```env
  # Irys/Arweave (optional - sẽ dùng Node Devnet miễn phí)
  IRYS_NETWORK=devnet
  IRYS_TOKEN=solana
  ```

#### 3.3. Upload Functions Implementation
- [ ] **Function `uploadImage`**:
  - [ ] Convert Buffer to Uint8Array
  - [ ] Upload với tags: `{ Content-Type: 'image/png' }`
  - [ ] Return Arweave transaction ID (URL format: `https://arweave.net/<txId>`)
  - [ ] Handle errors và retry logic

- [ ] **Function `uploadMetadata`**:
  - [ ] Stringify JSON metadata
  - [ ] Upload với tags: `{ Content-Type: 'application/json' }`
  - [ ] Return Arweave transaction ID
  - [ ] Handle errors và retry logic

#### 3.4. Test Upload Functions
- [ ] Test upload image với sample certificate
- [ ] Test upload metadata JSON
- [ ] Verify URLs có thể access được
- [ ] Test error handling (network errors, etc.)

---

### **PHASE 4: Metadata Standard (Metaplex)** 📄

#### 4.1. Tạo Metadata Structure
- [ ] **Tạo type `lib/types/metadata.ts`**:
  - [ ] Define `MetaplexMetadata` interface theo chuẩn:
    ```typescript
    {
      name: string;
      symbol: string;
      description: string;
      image: string; // Arweave URL
      external_url?: string;
      attributes: Array<{
        trait_type: string;
        value: string | number;
      }>;
      properties?: {
        files?: Array<{
          uri: string;
          type: string;
        }>;
        category?: string;
      };
    }
    ```

#### 4.2. Metadata Builder Function
- [ ] **Tạo `lib/utils/metadata-builder.ts`**:
  - [ ] Function `buildMetaplexMetadata(studentData, imageUrl, metadataUrl)`:
    - [ ] Build attributes array:
      - `Student Name`: student name
      - `Major`: major/degree
      - `Issue Date`: issue date
      - `Email`: student email (optional)
      - `Certificate ID`: unique ID
    - [ ] Set `name`: `"APEC Credential: {studentName}"`
    - [ ] Set `symbol`: `"APEC-CRED"`
    - [ ] Set `description`: Certificate description
    - [ ] Set `image`: Arweave image URL
    - [ ] Set `external_url`: Link to verification page
    - [ ] Return complete metadata object

#### 4.3. Update Admin Mint Service
- [ ] **Cập nhật `ts/adminMint.ts`**:
  - [ ] Import metadata builder và upload functions
  - [ ] Trong `batchMintCredentials`:
    - [ ] For each student:
      1. Generate certificate image (call API hoặc function)
      2. Upload image to Arweave → get `imageUrl`
      3. Build metadata JSON
      4. Upload metadata to Arweave → get `metadataUrl`
      5. Use `metadataUrl` trong mint instruction (thay vì placeholder)
    - [ ] Update metadata structure để dùng `metadataUrl` thay vì `uri`

#### 4.4. Test Metadata Structure
- [ ] Verify metadata JSON đúng format Metaplex
- [ ] Verify metadata có thể parse được
- [ ] Test với các tools như Metaplex Metadata Validator

---

### **PHASE 5: Batch Processing Frontend** ⚡

#### 5.1. Update CSV Parsing với PapaParse
- [ ] **Cập nhật `app/(platform)/admin/certify/page.tsx`**:
  - [ ] Import `papaparse`
  - [ ] Replace manual CSV parsing với `Papa.parse()`:
    ```typescript
    import Papa from 'papaparse';
    
    const parseCSV = (file: File): Promise<CsvRow[]> => {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as CsvRow[]),
          error: reject,
        });
      });
    };
    ```
  - [ ] Handle errors và validation tốt hơn

#### 5.2. Implement Batch Processing với Promise.all
- [ ] **Cập nhật `runBatchMint` function**:
  - [ ] Thay vì gọi API một lần, chia thành batches:
    - [ ] Process mỗi student: Generate image → Upload image → Build metadata → Upload metadata
    - [ ] Sử dụng `Promise.all()` để upload song song (ví dụ: 5-10 students cùng lúc)
    - [ ] Track progress cho từng student
    - [ ] Update UI với progress bar/status

#### 5.3. Progress Tracking UI
- [ ] **Thêm progress state**:
  - [ ] `progress: { current: number, total: number }`
  - [ ] `statuses: Array<{ student: string, status: 'pending' | 'uploading' | 'minting' | 'done' | 'error' }>`
- [ ] **Update UI**:
  - [ ] Progress bar hiển thị tổng tiến độ
  - [ ] List từng student với status (uploading image, uploading metadata, minting, done)
  - [ ] Real-time updates khi mỗi step hoàn thành

#### 5.4. Error Handling & Retry Logic
- [ ] **Implement retry logic**:
  - [ ] Retry upload nếu fail (max 3 lần)
  - [ ] Skip student nếu retry hết vẫn fail
  - [ ] Log errors chi tiết
- [ ] **User feedback**:
  - [ ] Hiển thị lỗi cụ thể cho từng student
  - [ ] Allow retry failed students
  - [ ] Export failed list để xử lý sau

#### 5.5. Optimize Batch Size
- [ ] **Tune batch size**:
  - [ ] Test với batch size khác nhau (5, 10, 20 students)
  - [ ] Monitor performance và errors
  - [ ] Set optimal batch size (có thể config trong env)
- [ ] **Rate limiting**:
  - [ ] Thêm delay giữa các batches nếu cần
  - [ ] Tránh overwhelm Irys/Arweave network

---

### **PHASE 6: API Route Updates** 🔌

#### 6.1. Update Mint API Route
- [ ] **Cập nhật `app/api/mint/route.ts`**:
  - [ ] Import image generation và upload functions
  - [ ] Trước khi mint:
    - [ ] Generate images cho tất cả students
    - [ ] Upload images lên Arweave
    - [ ] Build và upload metadata
    - [ ] Collect metadata URLs
  - [ ] Pass metadata URLs vào admin minting service
  - [ ] Handle errors ở mỗi step

#### 6.2. Tạo Image Generation API Endpoint
- [ ] **Tạo `app/api/certificate/image/route.ts`**:
  - [ ] POST endpoint nhận student data
  - [ ] Generate certificate image
  - [ ] Return image as PNG buffer hoặc base64
  - [ ] Có thể cache images nếu cần

#### 6.3. Error Handling
- [ ] **Comprehensive error handling**:
  - [ ] Image generation errors
  - [ ] Upload errors (network, Irys API)
  - [ ] Metadata validation errors
  - [ ] Minting errors
- [ ] **Return detailed errors**:
  - [ ] Which student failed
  - [ ] Which step failed (image gen, upload, mint)
  - [ ] Error message và code

---

### **PHASE 7: Testing & Verification** ✅

#### 7.1. Unit Tests
- [ ] **Test image generation**:
  - [ ] Test với various student data
  - [ ] Verify image format và size
  - [ ] Verify content đúng
- [ ] **Test upload functions**:
  - [ ] Test upload image
  - [ ] Test upload metadata
  - [ ] Verify URLs accessible
- [ ] **Test metadata builder**:
  - [ ] Verify Metaplex format
  - [ ] Verify all fields present

#### 7.2. Integration Tests
- [ ] **End-to-end test**:
  - [ ] Upload CSV với 5-10 students
  - [ ] Verify images được generate
  - [ ] Verify uploads thành công
  - [ ] Verify metadata URLs đúng
  - [ ] Verify minting thành công với metadata URLs
- [ ] **Verify on-chain**:
  - [ ] Check credentials trên Solana Explorer
  - [ ] Verify metadata URI trỏ đến Arweave
  - [ ] Verify image hiển thị đúng trên wallet/NFT viewer

#### 7.3. Performance Testing
- [ ] **Test batch processing**:
  - [ ] Test với 10, 50, 100 students
  - [ ] Measure time cho mỗi step
  - [ ] Verify không bị timeout
  - [ ] Verify memory usage hợp lý

---

### **PHASE 8: Documentation & Cleanup** 📝

#### 8.1. Update Documentation
- [ ] **Cập nhật `README.md`**:
  - [ ] Thêm section về Tuần 2
  - [ ] Document image generation
  - [ ] Document Arweave/Irys integration
  - [ ] Document metadata structure
- [ ] **Tạo `TUAN2_SUMMARY.md`**:
  - [ ] Tổng kết các thay đổi
  - [ ] Hướng dẫn sử dụng
  - [ ] Troubleshooting

#### 8.2. Code Cleanup
- [ ] **Remove old code**:
  - [ ] Xóa placeholder metadata URIs
  - [ ] Xóa manual CSV parsing (nếu đã replace)
  - [ ] Clean up unused imports
- [ ] **Add comments**:
  - [ ] Comment các functions quan trọng
  - [ ] Document API endpoints
  - [ ] Document environment variables

---

## 🚨 LƯU Ý QUAN TRỌNG

### Zero Mock Policy
- ❌ **TUYỆT ĐỐI KHÔNG** dùng static mock images
- ❌ **TUYỆT ĐỐI KHÔNG** dùng placeholder metadata URIs
- ✅ Tất cả images phải được generate động
- ✅ Tất cả metadata phải được upload lên Arweave

### Metaplex Metadata Standard
- ✅ Phải tuân thủ chính xác format Metaplex
- ✅ Attributes phải đúng structure
- ✅ Image URL phải accessible

### Batch Processing
- ✅ Sử dụng `Promise.all()` cho parallel upload
- ✅ Không block UI khi processing
- ✅ Track progress và show status
- ✅ Handle errors gracefully

### Irys Node Devnet
- ✅ Sử dụng Node Devnet để được miễn phí
- ✅ URL: `https://devnet.irys.xyz`
- ✅ Token: `solana`

---

## 📅 TIMELINE ƯỚC TÍNH

- **Phase 1:** 30 phút (Install dependencies)
- **Phase 2:** 4-6 giờ (Image generation)
- **Phase 3:** 3-4 giờ (Irys integration)
- **Phase 4:** 2-3 giờ (Metadata structure)
- **Phase 5:** 4-5 giờ (Batch processing)
- **Phase 6:** 2-3 giờ (API updates)
- **Phase 7:** 2-3 giờ (Testing)
- **Phase 8:** 1-2 giờ (Documentation)

**Tổng:** ~18-26 giờ làm việc

---

## ✅ CRITERIA HOÀN THÀNH TUẦN 2

1. ✅ Images được generate động (không dùng static)
2. ✅ Images và metadata được upload lên Arweave (qua Irys)
3. ✅ Metadata tuân thủ Metaplex standard
4. ✅ Batch processing với Promise.all hoạt động
5. ✅ CSV parsing với papaparse
6. ✅ Progress tracking và error handling
7. ✅ Credentials mint với metadata URLs thực sự

---

**Ngày tạo:** $(date)
**Người tạo:** Full-stack Web3 Expert AI Assistant
**Trạng thái:** ⏳ Chờ duyệt để bắt đầu triển khai

