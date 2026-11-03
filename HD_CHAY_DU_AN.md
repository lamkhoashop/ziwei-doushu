# HƯỚNG DẪN VẬN HÀNH DỰ ÁN TỬ VI ĐẨU SỐ (ZIWEI-DOUSHU)
## Hệ Thống An Sao Chính Tông Nghê Hải Hà & AI Agent Luận Giải

Dự án đã được cô lập hoàn toàn trong môi trường thư mục `E:\0AITool\ziwei-doushu`, Việt hóa 100% thuật ngữ học thuật Tử Vi Đẩu Số Việt Nam và tích hợp đầy đủ backend AI Agent hỗ trợ Streaming phản hồi tức thì.

---

### 1. CẤU HÌNH BIẾN MÔI TRƯỜNG (.env.local)

File cấu hình môi trường nằm tại `E:\0AITool\ziwei-doushu\.env.local`. Bạn có thể chỉnh sửa các tham số AI theo nhà cung cấp bạn muốn dùng:

#### Cấu hình mẫu cho OpenAI / OpenRouter / DeepSeek / Gemini:

```env
# 1. Cổng và URL ứng dụng (Cổng mặc định: 3005)
PORT=3005
NEXT_PUBLIC_SITE_URL=http://localhost:3005

# 2. Cấu hình AI Agent (Tương thích chuẩn OpenAI API)
# API Key của bạn (bắt buộc để kích hoạt AI luận giải)
AI_API_KEY=your_api_key_here

# Base URL của dịch vụ LLM
# - Dùng OpenAI:        https://api.openai.com/v1
# - Dùng DeepSeek:      https://api.deepseek.com/v1
# - Dùng OpenRouter:    https://openrouter.ai/api/v1
# - Dùng Gemini (OpenAI compat): https://generativelanguage.googleapis.com/v1beta/openai
AI_BASE_URL=https://api.openai.com/v1

# Tên mô hình AI muốn dùng
# Ví dụ: gpt-4o-mini, gpt-4o, deepseek-chat, google/gemini-2.0-flash-001, claude-3-5-sonnet...
AI_MODEL=gpt-4o-mini
```

> **Lưu ý:** Nếu chưa cấu hình `AI_API_KEY`, hệ thống vẫn cho phép an sao, xem chi tiết 14 chính tinh, xem cách cục bình thường. Khi bấm vào tính năng AI luận giải, giao diện sẽ nhắc bạn bổ sung khóa API vào `.env.local`.

---

### 2. LỆNH KHỞI ĐỘNG SERVER PHÁT TRIỂN (DEVELOPMENT)

Chạy lệnh sau tại thư mục `E:\0AITool\ziwei-doushu`:

```bash
npm run dev
```

- Server phát triển sẽ khởi động độc lập trên cổng **`3005`**:  
  👉 **`http://localhost:3005`**
- Hoàn toàn không xung đột với các tiến trình chạy cổng `3000` khác trên máy.

---

### 3. LỆNH ĐÓNG GÓI VÀ CHẠY PRODUCTION

Khi muốn chạy ở chế độ tối ưu hiệu năng cao:

```bash
# Bước 1: Build mã nguồn tối ưu hóa
npm run build

# Bước 2: Khởi chạy ứng dụng production (trên cổng 3005)
npm start
```

---

### 4. LỆNH KIỂM THỬ VÀ BẢO TOÀN THUẬT TOÁN

Dự án sở hữu bộ kiểm thử hồi quy 768 lá số mẫu và 10 kịch bản ngặt nghèo về thiên văn, giờ mặt trời thực và biên giới Lập Xuân:

```bash
# Kiểm tra toàn vẹn kiểu dữ liệu TypeScript (0 lỗi)
npm run typecheck

# Chạy toàn bộ 10 bộ kiểm thử thuật toán an sao (100% Passed)
npm test
```

---

### 5. CÁC TÍNH NĂNG ĐÃ HOÀN TẤT TRONG DỰ ÁN

1. **Hệ Thống An Sao & Giao Diện Chuẩn Việt Học:**
   - Đầy đủ 12 Cung (Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ).
   - 10 Can & 12 Chi (Giáp, Ất... Quý; Tý, Sửu... Hợi).
   - 14 Chính tinh và toàn bộ hệ thống Phụ tinh, Lục Cát, Lục Sát, Đào hoa, Hình tinh.
   - Thước đo độ sáng tinh diệu: Miếu, Vượng, Đắc, Lợi, Bình, Bất, Hãm.
   - Bảng Tứ Hóa: Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ.
   - Tự động nhận diện hơn 40 cách cục kinh điển (Tử Phủ đồng cung, Sát Phá Tham, Cơ Nguyệt Đồng Lương, Thạch Trung Ẩn Ngọc, v.v.).
   - Bộ chọn địa phương tính Giờ Mặt Trời Thực (True Solar Time) tích hợp sẵn 34 tỉnh thành và kinh độ trắc địa Việt Nam (GMT+7).

2. **AI Agent Backend Hoàn Chỉnh:**
   - **`/api/interpret`**: Nhận toàn bộ cấu trúc lá số, phân tích chuyên sâu theo trường phái Thiên Kỷ của Tôn sư Nghê Hải Hà. Cung cấp luận giải 6 chiều: Mệnh cách, Điểm mạnh/yếu, Sự nghiệp & Công danh, Tài bạch & Quản lý tiền bạc, Tình duyên & Gia đạo, Lời khuyên tu dưỡng tri mệnh tạo vận.
   - **`/api/heming`**: Nhận dữ liệu 2 lá số, so sánh tương quan Cung Phu Thê, độ tương hợp Mệnh/Thân và tương tác tam phương tứ chính; đưa ra lời khuyên hôn nhân và hợp tác kinh doanh.
   - Hỗ trợ **Server-Sent Events (SSE)** truyền dữ liệu luồng trực tiếp (Streaming) mượt mà dạng gõ chữ theo thời gian thực.
