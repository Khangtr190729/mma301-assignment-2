# Nhật ký sử dụng AI có kiểm soát (AI Usage Log)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** Assignment 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trương Hoàng Khang (CE190729)  

---

Tuân thủ nghiêm ngặt **Chính sách Trung thực Học thuật và Sử dụng AI có kiểm soát** (mục 0.2 và mục 9 Student Guide). Quy trình thực hiện gồm 6 bước: **Ask → Inspect → Adapt → Run → Explain → Record**. Sinh viên hoàn toàn làm chủ mã nguồn, tự kiểm chứng và sẵn sàng giải thích/sửa đổi trực tiếp trong buổi phỏng vấn.

---

## Bảng nhật ký sử dụng AI (AI Usage Log Matrix)

| # | Nhiệm vụ / Prompt / Tài liệu tham khảo | Mục đích | Output của AI đề xuất | Phần sinh viên đã điều chỉnh & cải tiến | Cách thức sinh viên đã kiểm chứng |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | *"Thiết kế kiến trúc Service cho việc gọi API phân trang Remote Product Catalog bằng React Native"* | Xây dựng module `productService.js` độc lập với UI, hỗ trợ phân trang và tìm kiếm | AI gợi ý class dùng `axios` và gọi trực tiếp `axios.get(url)` | - Bỏ thư viện `axios` để dùng `fetch` có sẵn nhằm tối ưu dung lượng bundle.<br>- Bổ sung `AbortController` với timeout 10 giây để chống treo mạng.<br>- Viết thêm bộ lọc Offline Fallback (`FALLBACK_PRODUCTS`) để app không crash khi mất mạng. | Chạy PowerShell thử lệnh `Invoke-RestMethod` với API DummyJSON, sau đó ngắt mạng để kiểm tra chế độ fallback tự động. |
| **2** | *"Tối ưu hóa FlatList để không bị gọi lặp request onEndReached khi cuộn trớn"* | Khắc phục lỗi `onEndReached` bắn request liên tục (mục 6 Student Guide) | AI đề xuất đặt `onEndReachedThreshold={0.5}` và kiểm tra `!loading` | - Nhận thấy chỉ kiểm tra `!loading` vẫn bị lọt request do state bất đồng bộ.<br>- Sinh viên chủ động thêm biến `useRef(onEndReachedCalledDuringMomentum)` kết hợp với sự kiện `onMomentumScrollBegin`. | Mở console log và cuộn nhanh FlatList nhiều lần; xác nhận chỉ có đúng 1 request được phát mỗi khi chạm đáy danh sách. |
| **3** | *"Viết bộ tính toán Derived Totals cho giỏ hàng trong React Context"* | Đảm bảo tính toán tổng tiền, thuế, giảm giá là Single Source of Truth theo CLO9 | AI gợi ý lưu `totalPrice` vào state cùng với `cartItems` mỗi khi thêm/xóa | - **Từ chối đề xuất lưu state thừa** của AI vì vi phạm nguyên tắc Single Source of Truth.<br>- Chuyển sang sử dụng `useMemo` tính toán động (derived state) từ mảng `cartItems`.<br>- Thêm ép kiểu an toàn `Number(price)` và làm tròn 2 chữ số thập phân. | Chạy kiểm thử test case `TC_CART_01` và `TC_CART_02`: thêm 2 sản phẩm cùng loại, giảm số lượng về 0; tổng tiền tính chính xác tuyệt đối. |
| **4** | *"Tích hợp Google Gemini REST API vào ứng dụng E-Commerce với Anti-Hallucination Guard"* | Xây dựng trợ lý mua sắm AI gắn chặt với danh mục thực tế (R10), không dùng chatbot chung chung | AI gợi ý cài đặt `@google/generative-ai` và viết prompt trò chuyện thông thường | - Sử dụng gọi `fetch` trực tiếp vào REST endpoint của Google thay vì cài thêm thư viện nặng.<br>- Đưa danh mục 15 sản phẩm thực tế vào system prompt để neo ngữ cảnh (grounding).<br>- Viết thuật toán kiểm chứng ID: duyệt mảng kết quả của AI, đối chiếu với `catalogProducts.find(p => p.id === rec.id)`, loại bỏ ID ảo giác và fallback an toàn. | Gửi prompt test với sản phẩm không tồn tại, kiểm tra badge phát hiện ID ảo giác hoạt động chuẩn xác trên UI `AiAssistantScreen`. |
| **5** | *"Thiết lập đồng bộ dữ liệu Wishlist và Orders với Firebase Cloud Firestore"* | Triển khai use case Firebase có giá trị nghiệp vụ thực tế (R08) | AI đưa ra đoạn mã dùng `firebase/firestore` với cấu hình hardcode API key vào file | - **Từ chối hardcode secret** theo mục 0.2 Student Guide; tách biệt `firebaseConfig.js` dùng config an toàn và cho phép mở rộng.<br>- Bổ sung tầng bọc try-catch: nếu mạng ngắt hoặc Firebase lỗi quyền, tự động lưu xuống AsyncStorage cục bộ (Resilient Fallback). | Kiểm tra tính năng Yêu thích và Đặt hàng khi có mạng và khi tắt mạng; dữ liệu vẫn được ghi nhớ và hiển thị trên giao diện. |
