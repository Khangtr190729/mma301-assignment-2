# Test Matrix (Ma trận kiểm thử chi tiết)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** Assignment 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trương Hoàng Khang (CE190729)  

---

Ma trận kiểm thử bao gồm đầy đủ **15 test cases chuẩn** theo đúng quy định tại mục 5 (Student Guide), phân bổ đủ các nhóm: **API, Danh sách (List), Phân trang (Pagination), Tìm kiếm (Search), Giỏ hàng (Cart), Lưu trữ (Persistence), Firebase, Thông báo (Notification), Trí tuệ nhân tạo (Gemini AI), và Đóng gói (Release)**.

---

| # | Nhóm (Group) | Case ID | Kịch bản / Thao tác kiểm thử (Test Scenario) | Dữ liệu đầu vào (Input Data) | Kết quả mong đợi (Expected Result) | Kết quả thực tế (Actual Result) | Đánh giá (Pass/Fail) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| **1** | **API** | `TC_API_01` | **API Success:** Khởi động ứng dụng và tải danh mục sản phẩm từ Remote REST API | URL: `https://dummyjson.com/products?limit=10&skip=0` | Trả về HTTP 200, hiển thị danh sách sản phẩm dạng lưới 2 cột kèm ảnh, giá, rating | Danh sách sản phẩm nạp đầy đủ, hiển thị mượt mà | **PASS** |
| **2** | **API** | `TC_API_02` | **Network Error & Retry:** Giả lập mất mạng hoặc URL API không hợp lệ | Ngắt Wi-Fi / bật chế độ máy bay khi đang tải | Không crash app; hiển thị ErrorState kèm nút "Thử lại", tự động chuyển fallback an toàn | Hiển thị màn hình lỗi thân thiện + nút Thử lại | **PASS** |
| **3** | **List** | `TC_LIST_01` | **Empty State:** Danh mục không có sản phẩm hoặc kết quả lọc bằng 0 | Lọc danh mục không tồn tại hoặc danh sách rỗng | Hiển thị EmptyState trực quan với icon và nút "Xóa bộ lọc / Khám phá ngay" | Hiển thị EmptyState rõ ràng, có nút hành động | **PASS** |
| **4** | **Pagination** | `TC_PAG_01` | **Infinite Scroll End:** Cuộn liên tục xuống đáy danh sách sản phẩm | Cuộn FlatList chạm ngưỡng `onEndReached` (0.4) | Tải tiếp trang tiếp theo mà không gọi lặp request; dừng nạp khi đã tải hết tổng số sản phẩm | Guard `onMomentumScrollBegin` chặn trùng request thành công | **PASS** |
| **5** | **Search** | `TC_SRCH_01` | **Hit & Miss Search:** Tìm kiếm theo từ khóa có kết quả và từ khóa vô nghĩa | 1. `"phone"` hoặc `"beauty"`<br>2. `"xyz999999"` | 1. Hiển thị danh sách sản phẩm liên quan<br>2. Hiển thị EmptyState "Không tìm thấy sản phẩm" | Lọc đúng sản phẩm; từ khóa lạ hiển thị no-result chuẩn | **PASS** |
| **6** | **Cart** | `TC_CART_01` | **Add Same Item:** Thêm cùng 1 sản phẩm vào giỏ hàng 2 lần | Bấm nút "+ Thêm" trên cùng 1 sản phẩm 2 lần | Số lượng (quantity) tăng lên 2, không tạo thêm dòng mới; tổng tiền nhân đôi chính xác | Quantity cập nhật thành 2, tổng tiền tăng đúng | **PASS** |
| **7** | **Cart** | `TC_CART_02` | **Quantity 0 & Remove:** Giảm số lượng về 0 hoặc bấm nút xóa (X) | Bấm dấu "−" khi số lượng đang là 1 hoặc bấm nút Xóa | Sản phẩm được xóa khỏi giỏ hàng ngay lập tức; tổng tiền tự động tính lại về 0 | Dòng sản phẩm biến mất, derived totals giảm tương ứng | **PASS** |
| **8** | **Persistence** | `TC_PERS_01` | **Cold Start Restart:** Thêm hàng vào giỏ, đổi theme Tối, đóng app hoàn toàn và mở lại | Kill process ứng dụng từ task switcher | Dữ liệu giỏ hàng, số lượng và theme Tối được khôi phục nguyên vẹn từ AsyncStorage | Hydrate thành công 100%, không mất dữ liệu | **PASS** |
| **9** | **Firebase** | `TC_FIRE_01` | **Write & Read Cloud:** Bấm tim yêu thích một sản phẩm hoặc Đặt hàng | Sản phẩm ID #1 (Essence Mascara) | Ghi bản ghi lên collection `wishlists`/`orders`, tab Wishlist đọc và hiển thị đầy đủ | Ghi và đọc dữ liệu Firestore thành công | **PASS** |
| **10** | **Firebase** | `TC_FIRE_02` | **Firebase Error / Offline:** Ngắt mạng hoặc quy tắc Firestore bị từ chối | Tắt mạng khi bấm Đặt hàng hoặc Yêu thích | Try-catch bắt ngoại lệ; tự động lưu cục bộ (Local Resilient Fallback), app hoạt động trơn tru | Không bị crash; hiển thị banner chế độ lưu trữ an toàn | **PASS** |
| **11** | **Notification** | `TC_NOTIF_01` | **Permission Denied:** Người dùng từ chối cấp quyền gửi thông báo | Chọn "Don't allow" khi hộp thoại xin quyền xuất hiện | Ứng dụng không bị crash; trạng thái ghi nhận `denied`, đơn hàng vẫn đặt thành công | Giao diện hiển thị rõ trạng thái "Chưa cấp quyền" | **PASS** |
| **12** | **Notification** | `TC_NOTIF_02` | **Allowed Event Notification:** Cấp quyền thông báo và hoàn tất đơn hàng | Chọn "Allow" và nhấn "Xác nhận đặt hàng" | Phát thông báo cục bộ tức thì: "🎉 Đặt hàng thành công! Đơn hàng #ORD-XXXXXX..." | Thiết bị nhận được thông báo kèm âm thanh | **PASS** |
| **13** | **Gemini AI** | `TC_AI_01` | **Valid Grounded Context:** Nhập câu hỏi mua sắm với danh mục thực tế | "Gợi ý mỹ phẩm dưỡng da giá dưới $20" | AI trả về lời khuyên + danh sách ID sản phẩm có thật; app xác thực và hiển thị thẻ sản phẩm | Thẻ đề xuất hiển thị chuẩn, có nút Chi tiết và Thêm vào giỏ | **PASS** |
| **14** | **Gemini AI** | `TC_AI_02` | **Anti-Hallucination & Fallback:** Giả lập AI trả về ID bịa đặt hoặc mất mạng | ID sản phẩm giả lập `9999` hoặc ngắt API Key | Hệ thống phát hiện ID ảo giác, tự động loại bỏ và thay bằng sản phẩm thực tế phù hợp | Badge cảnh báo hiển thị rõ; app không render thẻ rác | **PASS** |
| **15** | **Release** | `TC_REL_01` | **Release Build Verification:** Đóng gói ứng dụng chạy độc lập (Standalone) | Chạy lệnh `npx expo export` | Toàn bộ 642 modules được bundle thành công không lỗi, sẵn sàng đóng gói APK/AAB | Bundling thành công 100% trong 26 giây | **PASS** |
