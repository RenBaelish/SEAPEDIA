# Panduan Alur Penggunaan SEAPEDIA (Skenario Pengujian)

Dokumen ini disusun khusus bagi tim juri/penilai untuk menguji alur sistem SEAPEDIA secara menyeluruh. Aplikasi ini telah mengimplementasikan kapabilitas ekosistem e-commerce yang utuh sesuai spesifikasi *Task Level* (Level 1 hingga 7). 

## Persiapan
- Pastikan Anda sudah mengakses web utama.
- Anda dapat login menggunakan akun *dummy* yang telah disediakan pada `README.md` utama.
- Sistem mengusung konsep **Satu Akun Multi-Peran** (Role Switcher - Level 7). Artinya, satu alamat email bisa memiliki peran ganda (misal: sebagai Pembeli sekaligus Penjual). 

---

## Skenario Pengujian Utama (End-to-End Flow)

Berikut adalah skenario utama transaksi dari awal hingga akhir untuk membuktikan bahwa seluruh spesifikasi level aplikasi telah terpenuhi.

### 1. Pembeli (Buyer) Memilih dan Memesan Produk (Level 1, Level 4)
1. Login menggunakan akun **Buyer** (`budi.santoso@gmail.com`).
2. Masuk ke halaman **Beranda** atau **Pencarian** dan temukan produk dari toko tertentu (contoh: "TechMart Indonesia").
3. Klik produk tersebut, lalu tekan tombol **Masukkan ke Keranjang** (Add to Cart).
4. Buka halaman **Keranjang** (Cart) melalui ikon di pojok kanan atas.
5. Anda akan melihat sistem mematuhi **aturan bisnis ketat (Level 4)**: Pembeli hanya bisa memilih dan melakukan _checkout_ untuk barang-barang dari **satu toko yang sama** dalam satu waktu. Jika Anda memasukkan produk dari toko lain, kotak centangnya (checkbox) akan diblokir.
6. Klik **Checkout**, isi metode pengiriman, dan pastikan saldo E-Wallet cukup. Klik **Bayar & Buat Pesanan**.
7. Pesanan selesai dibuat dengan status awal: `MENUNGGU_DIPROSES`.
8. *Catatan Keamanan (Level 7)*: Jika penjual (Seller) iseng mengubah perannya menjadi Buyer dan mencoba membeli barang dari tokonya sendiri, sistem akan secara otomatis memblokir transaksi tersebut untuk mencegah kecurangan.

### 2. Penjual (Seller) Memproses Pesanan (Level 2, Level 3)
1. Keluar dari akun Buyer, lalu Login menggunakan akun **Seller** dari toko yang barangnya baru saja dibeli (misal: `techmart@seapedia.id`).
2. Di pojok kanan atas, klik **Dashboard Penjual** atau gunakan fitur *Switch Role* ke peran SELLER.
3. Buka menu **Pesanan** di navigasi kiri. Anda akan melihat pesanan baru dari Budi Santoso masuk dengan status `MENUNGGU_DIPROSES`.
4. Klik pesanan tersebut, lalu klik tombol **Proses Pesanan**.
5. Sistem (Level 2) akan memperbarui status pesanan menjadi `DIPROSES`.
6. Saat penjual sudah mengemas barang dan siap dikirim, klik tombol **Kirim Pesanan**.
7. Sistem mengubah status pesanan menjadi `DIKIRIM` dan secara otomatis mem-posting pekerjaan pengiriman (Job) ke bursa pengiriman bagi *Driver*.

### 3. Kurir (Driver) Mengambil & Menyelesaikan Pengiriman (Level 2)
1. Keluar dari akun Seller, lalu Login menggunakan akun **Driver** (`rudi.driver@seapedia.id`).
2. Anda akan otomatis masuk ke **Dashboard Driver**.
3. Buka menu **Job Board** (Daftar Pekerjaan). Pekerjaan pengiriman yang baru saja di-*trigger* oleh penjual akan muncul di sini.
4. Klik **Ambil Pekerjaan**. Pekerjaan tersebut sekarang masuk ke menu **Pengiriman Saya**.
5. Setelah pura-pura mengantarkan barang sampai ke tujuan, buka detail pekerjaan tersebut dan klik **Selesaikan Pengiriman**.
6. Sistem mencatat barang telah sampai, namun status pesanan di sisi pelanggan masih `DIKIRIM` sampai pelanggan melakukan konfirmasi akhir.

### 4. Pelanggan Mengonfirmasi Pesanan & Keuangan (Level 3, Level 5)
1. Keluar dari akun Driver, Login kembali menggunakan akun **Buyer** (`budi.santoso@gmail.com`).
2. Masuk ke halaman **Pesanan Saya**.
3. Klik tombol **Selesaikan Pesanan** pada pesanan yang statusnya `DIKIRIM`. Status akhir pesanan berubah menjadi `SELESAI`.
4. *Distribusi Dana & Komisi (Level 3)*: 
   - Saldo secara otomatis masuk ke **Dompet Penjual** setelah dipotong komisi platform (5%).
   - Ongkos kirim masuk ke **Dompet Driver** setelah dipotong biaya admin platform (10%).
   - Pembagian ini bisa diverifikasi secara *real-time* di Dashboard masing-masing (Seller & Driver Wallet).
5. *Review (Level 5)*: Setelah pesanan selesai, pengguna dapat mengisi penilaian (bintang 1-5) beserta komentar untuk produk tersebut. Penilaian ini akan memengaruhi rating agregat (rata-rata bintang) pada halaman detail produk di kemudian hari.

---

## Verifikasi Tambahan

**Sistem SLA (Service Level Agreement) Otomatis (Level 6)**
Sistem backend dilengkapi *cron job* dan validasi internal. Jika penjual tidak memproses pesanan lebih dari batas waktu SLA (contoh: 24 jam), atau *Driver* tidak menyelesaikan pengantaran (contoh: 72 jam), sistem dapat membatalkan pesanan dan mengembalikan dana ke dompet pembeli.

**Analytics & Dashboard Admin (Level 7)**
Masuk menggunakan akun **Admin** (`admin@seapedia.id`). Di halaman dashboard utama, Admin bisa melihat agregasi lalu lintas uang, total pengguna per role, total pesanan, serta statistik E-Wallet.

---
Dengan mengikuti alur di atas, Anda dapat membuktikan integrasi end-to-end yang solid antar seluruh komponen/level pada ekosistem SEAPEDIA. Selamat menguji!
