# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN TỬ VI ĐẨU SỐ LÊN MÁY CHỦ PROXMOX

Dự án này cực kỳ nhẹ (chỉ tốn khoảng ~150MB RAM), hoàn toàn tương thích và chạy siêu mượt trên node **hasu (Intel N200 / 16GB RAM)** của bạn.

Dưới đây là 2 cách triển khai tối ưu nhất dựa trên các máy ảo (VM) bạn đang có sẵn trên Proxmox:

---

### PHƯƠNG ÁN 1: TRIỂN KHAI QUA DOCKER (KHUYÊN DÙNG NHẤT TRÊN VM 100 DOCKER-HOST)

Vì trên Proxmox bạn đã có sẵn VM **`100 (docker-host)`**, đây là cách gọn gàng, tự động khởi động cùng máy chủ và không làm rác hệ điều hành.

#### Bước 1: Sao chép thư mục dự án lên `docker-host`
Từ máy tính của bạn, dùng phần mềm (như WinSCP, FileZilla hoặc lệnh `scp`) copy thư mục `E:\0AITool\ziwei-doushu` vào máy ảo `docker-host` (ví dụ đặt tại `/opt/ziwei-doushu` hoặc `~/ziwei-doushu`).

#### Bước 2: Cấu hình file `.env.local`
Mở file `.env.local` trên server và điền cấu hình (hỗ trợ điền cùng lúc 2 API Key OpenRouter để chia tải):

```env
# Điền 2 key OpenRouter cách nhau bởi dấu phẩy để hệ thống tự động xoay vòng giảm tải
AI_API_KEY=sk-or-v1-key1...,sk-or-v1-key2...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free

PORT=3005
NEXT_PUBLIC_SITE_URL=http://localhost:3005
```

#### Bước 3: Khởi chạy bằng Docker Compose
Trong terminal của VM `docker-host`, di chuyển vào thư mục dự án và chạy:

```bash
cd /opt/ziwei-doushu
docker compose up -d --build
```

- Docker sẽ tự động build image siêu nhẹ bằng công nghệ standalone (chỉ chiếm ~120MB).
- Container sẽ tự chạy ngầm và tự khởi động lại nếu máy chủ Proxmox reboot (`restart: always`).
- Truy cập nội bộ mạng LAN: `http://<IP_CỦA_DOCKER_HOST>:3005`

---

### PHƯƠNG ÁN 2: CHẠY TRỰC TIẾP BẰNG PM2 TRÊN VM 101 (UBUNTULTS)

Nếu bạn muốn chạy trực tiếp bằng Node.js trên máy ảo Ubuntu `101 (UnbutuLTS)`:

#### Bước 1: Cài đặt Node.js 20 & PM2 trên Ubuntu (nếu chưa có)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### Bước 2: Build và chạy ứng dụng
```bash
cd ~/ziwei-doushu
npm install
npm run build

# Chạy ngầm bằng PM2
pm2 start npm --name "ziwei-doushu" -- start

# Lưu tiến trình để tự khởi động khi bật máy
pm2 save
pm2 startup
```

---

### CÁCH ĐƯA RA INTERNET AN TOÀN BẰNG CLOUDFLARE TUNNEL (MIỄN PHÍ 100%)
Để bạn và người thân có thể truy cập từ điện thoại ngoài đường (4G/5G) mà **không cần mở port modem (NAT)**, **không sợ bị lộ IP nhà** và **có sẵn chứng chỉ HTTPS bảo mật**:

1. Đăng ký tài khoản miễn phí tại [dash.cloudflare.com](https://dash.cloudflare.com) và trỏ 1 tên miền của bạn về Cloudflare.
2. Vào mục **Zero Trust** ➔ **Networks** ➔ **Tunnels** ➔ Bấm **Create a Tunnel**.
3. Chọn cài đặt qua Docker (Cloudflare sẽ cung cấp cho bạn 1 dòng lệnh `docker run cloudflare/cloudflared...`). Chạy dòng lệnh đó trên VM `docker-host`.
4. Trong phần cài đặt **Public Hostname**:
   - Subdomain: `tuvi` (ví dụ `tuvi.yourdomain.com`).
   - Service: Chọn **HTTP** và điền URL: `localhost:3005` (hoặc IP nội bộ: `http://192.168.x.x:3005`).
5. Bấm **Save**.

Ngay lập tức, bạn đã có một website Tử Vi AI chạy trực tiếp từ con Mini PC Intel N200 ở nhà ra toàn thế giới với tốc độ cao, có khóa bảo mật xanh và chống DDoS hoàn toàn miễn phí!
