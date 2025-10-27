# Setup Instructions - E-Certify Anchor Program

## Vấn đề hiện tại
- Cargo.lock version 4 không tương thích với Rust toolchain cũ
- Cần tạo lại Anchor project với version ổn định

## Giải pháp

### Cách 1: Tạo Anchor Project Mới (Khuyên dùng)

```powershell
# 1. Backup code hiện tại
cd ..
mkdir program_backup
xcopy /E /I program program_backup

# 2. Xóa program cũ
Remove-Item -Recurse -Force program

# 3. Tạo Anchor project mới
anchor init program

# 4. Copy code từ backup vào
# Copy file lib.rs vào program/src/lib.rs
# Copy Cargo.toml (sửa lại dependencies nếu cần)

# 5. Build
cd program
anchor build
```

### Cách 2: Fix Cargo.lock (Thử)

```powershell
# 1. Xóa Cargo.lock
Remove-Item Cargo.lock

# 2. Update Rust version
rustup update stable

# 3. Build lại
anchor build
```

### Cách 3: Downgrade Rust (Không khuyên)

```powershell
rustup install 1.70.0
rustup default 1.70.0
anchor build
```

## Sau khi build thành công

```powershell
# Deploy lên Devnet
anchor deploy --provider.cluster devnet

# Hoặc dùng script
.\build-and-deploy.ps1
```

## Tạo file .env.local cho frontend

File đã được tạo tại: `frontend/.env.local`

Nội dung:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=ECertifyProgram11111111111111111111111111111
NEXT_PUBLIC_HELIUS_API_KEY=3ad52cea-a8c4-41e2-8b01-22230620e995
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=3ad52cea-a8c4-41e2-8b01-22230620e995
```

## Chạy Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Troubleshooting

1. Nếu build vẫn lỗi: Thử update Anchor CLI
   ```powershell
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install 0.28.0
   avm use 0.28.0
   ```

2. Nếu deploy lỗi: Kiểm tra Solana CLI và dev wallet
   ```powershell
   solana --version
   solana config get
   ```

