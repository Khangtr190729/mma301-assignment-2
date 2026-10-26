# Design Decision Record (DDR)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** Assignment 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trương Hoàng Khang (CE190729)  

---

Tài liệu này ghi nhận 7 quyết định kiến trúc và kỹ thuật cốt lõi (vượt mức tối thiểu 6 quyết định theo mục 3.2 Student Guide), lý do lựa chọn, đánh giá trade-off và phân tích tác động (impact analysis) khi yêu cầu thay đổi.

---

## 1. Quyết định Quản lý State (State Management Architecture)

- **Lựa chọn:** Context API đa tầng kết hợp `useMemo` và `useCallback`:
  1. `ThemeContext`: Quản lý chế độ sáng/tối và bảng màu toàn app.
  2. `CartContext`: Quản lý danh sách giỏ hàng, số lượng và dẫn xuất tổng tiền (derived totals).
  3. `WishlistContext`: Quản lý sản phẩm yêu thích và lịch sử đơn hàng đồng bộ Firebase.
  4. `NotificationContext`: Quản lý trạng thái cấp quyền và phát thông báo.
- **Lý do lựa chọn:**
  - Kế thừa trực tiếp kiến trúc từ Assignment 1, đảm bảo tính nhất quán và dễ giải thích trong buổi đánh giá.
  - Tách biệt rõ ràng các miền dữ liệu (domain separation), tránh tình trạng một thay đổi nhỏ ở Theme làm re-render toàn bộ Cart hay List.
  - Phù hợp với quy mô ứng dụng thương mại điện tử cấp độ Assignment, không đưa vào các thư viện bên ngoài phức tạp (Redux/Zustand) làm phình to bundle.
- **Giải pháp thay thế cân nhắc:** Redux Toolkit hoặc Zustand.
- **Đánh giá Trade-off:** Context API có thể gây re-render các consumer nếu không tối ưu. Do đó, toàn bộ derived selector (`subtotal`, `totalAmount`) đều được bọc trong `useMemo`, và các hàm cập nhật được bọc trong `useCallback`.
- **Tác động khi đổi yêu cầu:** Nếu cần chuyển sang Redux Toolkit, chỉ cần thay đổi tầng Provider và hook selector mà không cần sửa giao diện của các Screen.

---

## 2. Quyết định Cấu trúc Service & API (API / Service Structure)

- **Lựa chọn:** Tách tầng Service độc lập (`productService.js`, `firebaseService.js`, `notificationService.js`, `geminiService.js`) nằm giữa UI Screens và Remote Data Sources.
- **Lý do lựa chọn:**
  - Tuân thủ nguyên tắc Single Responsibility và Separation of Concerns (mục 3.1 Student Guide).
  - Screens chỉ nhận dữ liệu đã được chuẩn hóa (normalize) và gọi hàm, hoàn toàn không chứa URL cứng hay logic phân tích JSON thô.
  - Cho phép tích hợp cơ chế Offline Fallback an toàn (Safe Fallback Engine): nếu mất kết nối mạng hoặc API gặp lỗi, service tự động trả về dữ liệu dự phòng có cấu trúc tương đương để app không crash.
- **Giải pháp thay thế cân nhắc:** Gọi `fetch()` trực tiếp bên trong `useEffect` của từng Screen.
- **Đánh giá Trade-off:** Cần viết thêm lớp abstraction và kiểu dữ liệu chuẩn, nhưng bù lại mã nguồn cực kỳ sạch, dễ viết Unit Test và dễ tái sử dụng.
- **Tác động khi đổi yêu cầu:** Nếu chuyển từ DummyJSON sang backend thật của giảng viên cung cấp, chỉ cần đổi `PRODUCTS_BASE_URL` và bộ ánh xạ (mapping) trong `productService.js`, toàn bộ UI giữ nguyên 100%.

---

## 3. Quyết định Chiến lược Phân trang (Pagination Strategy)

- **Lựa chọn:** Phân trang vô hạn (Infinite Scrolling) bằng `FlatList` với cơ chế guard kép:
  1. `isLoadingMore`: Ngăn chặn phát request mới khi request trước chưa hoàn tất.
  2. `onEndReachedCalledDuringMomentum`: Dùng `useRef` kết hợp `onMomentumScrollBegin` để triệt tiêu hoàn toàn hiện tượng gọi lặp API nhiều lần khi cuộn trớn đến đáy danh sách.
  3. `newUnique` Set check: Loại bỏ sản phẩm trùng lặp ID trước khi nối mảng state.
- **Lý do lựa chọn:**
  - Trải nghiệm người dùng di động hiện đại (vuốt mượt mà không bị ngắt quãng).
  - Giải quyết triệt để lỗi phổ biến được nhấn mạnh trong mục 6 Student Guide: *"List gọi API lặp"*.
- **Giải pháp thay thế cân nhắc:** Phân trang kiểu nút bấm số trang (Page numbers 1, 2, 3).
- **Đánh giá Trade-off:** Yêu cầu quản lý vị trí cuộn và danh sách ID đã nạp cẩn thận hơn, nhưng đem lại điểm đánh giá cao về mặt kỹ thuật.
- **Tác động khi đổi yêu cầu:** Nếu chuyển sang phân trang bằng cursor (`cursor-based pagination`), chỉ cần lưu `nextCursor` trong state thay cho `skip`.

---

## 4. Quyết định Lưu trữ Bền vững (Persistence & Hydration)

- **Lựa chọn:** Sử dụng module tập trung `src/storage/appStorage.js` bọc quanh `@react-native-async-storage/async-storage` với Safe JSON Parsing và Fallback mặc định.
- **Lý do lựa chọn:**
  - Lưu trữ bền vững 4 trạng thái cốt lõi: Giỏ hàng (`cartItems`), Giao diện (`themeMode`), Gemini API Key, và Bản đệm ngoại tuyến (Offline Cache).
  - Khi người dùng tắt app hoàn toàn (kill app) và mở lại, dữ liệu được phục hồi tức thì trong quá trình khởi động (startup hydration).
  - Loại bỏ hoàn toàn lỗi crash app do dữ liệu rác (corrupted JSON string).
- **Giải pháp thay thế cân nhắc:** SQLite hoặc WatermelonDB.
- **Đánh giá Trade-off:** AsyncStorage lưu dạng key-value string nên không phù hợp với dữ liệu quan hệ phức tạp hàng nghìn bản ghi, nhưng hoàn hảo cho giỏ hàng và cài đặt của mobile app.
- **Tác động khi đổi yêu cầu:** Nếu chuyển sang lưu bằng SQLite, chỉ cần sửa đổi các hàm bên trong `appStorage.js`.

---

## 5. Quyết định Nghiệp vụ Firebase (Firebase Cloud Firestore Use Case)

- **Lựa chọn:** Sử dụng Firebase Web SDK (v11 modular) để triển khai đồng bộ 2 nghiệp vụ thực tế:
  1. `Wishlist`: Lưu trữ danh sách sản phẩm yêu thích lên Cloud Firestore.
  2. `Orders`: Ghi nhận lịch sử đơn đặt hàng (mã đơn, danh sách sản phẩm, số tiền, mốc thời gian `serverTimestamp`).
- **Lý do lựa chọn:**
  - Giải quyết bài toán nghiệp vụ thương mại điện tử thực tế: người dùng cần lưu lại sản phẩm để mua sau và xem lại các đơn đã đặt.
  - Sử dụng Web SDK modular giúp chạy mượt mà trên cả Expo Go, Android Native build, và Web mà không gặp xung đột linking native module.
  - Tích hợp cơ chế tự động chuyển đổi sang Local Persistence nếu người dùng chưa thiết lập Firebase config hoặc khi mất mạng, đảm bảo thỏa mãn ràng buộc Failure Constraints (mục 2.2).
- **Giải pháp thay thế cân nhắc:** Firebase Realtime Database hoặc Firebase Authentication đơn thuần.
- **Đánh giá Trade-off:** Firestore yêu cầu cấu hình rules chuẩn, nhưng cung cấp cấu trúc document/collection mạnh mẽ cho dữ liệu đơn hàng.
- **Tác động khi đổi yêu cầu:** Nếu giảng viên yêu cầu đổi sang lưu trữ giỏ hàng (Cart Sync) thay vì Wishlist, chỉ cần đổi tên collection và cấu trúc payload trong `firebaseService.js`.

---

## 6. Quyết định Tích hợp Gemini AI & Chống Ảo giác (Gemini AI Grounding & Anti-Hallucination)

- **Lựa chọn:** Tích hợp Google Gemini REST API trực tiếp (`fetch` chuẩn, không cài SDK ngoài) kết hợp Grounding trong danh mục thực tế và Bộ lọc kiểm chứng tính xác thực (Validation Engine):
  1. **Grounding Prompt:** Đưa 15 sản phẩm thực tế hiện có trong kho vào system prompt, yêu cầu AI CHỈ ĐƯỢC chọn sản phẩm từ danh mục này.
  2. **Validation Layer:** Khi AI trả về danh sách `recommendedProductIds`, hệ thống đối chiếu từng ID với mảng `catalogProducts` đang active.
  3. **Anti-Hallucination Guard:** Nếu AI trả về ID không tồn tại (ảo giác), app tự động loại bỏ ID giả đó, thông báo cảnh báo rõ ràng trên UI và chỉ hiển thị các sản phẩm có thật, có thể bấm "Xem chi tiết" và "Thêm vào giỏ".
  4. **Security First:** Không commit API key vào source code; cho phép nhập và lưu trong thiết bị hoặc cấu hình môi trường.
- **Lý do lựa chọn:**
  - Thỏa mãn chính xác tiêu chí R10 và câu hỏi interview mục 12.3: *"Nếu AI hallucinate product ID/name thì phát hiện thế nào?"*.
  - Biến AI thành tính năng thương mại hữu ích thực sự thay vì một khung chat hỏi đáp vu vơ không liên quan đến shop.
- **Giải pháp thay thế cân nhắc:** Chatbot hội thoại thông thường không truyền danh mục sản phẩm.
- **Đánh giá Trade-off:** Giới hạn số lượng sản phẩm truyền vào prompt để tiết kiệm token và đảm bảo tốc độ phản hồi nhanh, nhưng mang lại độ chính xác cao.
- **Tác động khi đổi yêu cầu:** Nếu cần chuyển sang tính năng So sánh 2 sản phẩm (Product Comparator), service đã có sẵn hàm `compareProducts(productA, productB)` sẵn sàng sử dụng.

---

## 7. Quyết định Quy trình Thông báo (Business Notification Workflow)

- **Lựa chọn:** Tích hợp `expo-notifications` với quy trình xử lý quyền hạn nghiêm ngặt (Permission Lifecycle):
  1. Kiểm tra trạng thái cấp quyền hiện tại trước khi thực hiện.
  2. Nếu quyền chưa được cấp (`undetermined`), ứng dụng hiển thị lời mời cấp quyền rõ ràng.
  3. Nếu người dùng từ chối (`denied`), ứng dụng vẫn hoàn tất đơn hàng bình thường, không crash, và hiển thị thông báo trạng thái hướng dẫn trong Cài đặt (đáp ứng tiêu chí TC 11).
  4. Khi quyền hợp lệ (`granted`), phát thông báo Local Notification ngay sau sự kiện Đặt hàng thành công (`ORD-XXXXXX`).
- **Lý do lựa chọn:**
  - Đảm bảo trải nghiệm mua sắm thực tế: người mua cần nhận xác nhận đơn hàng tức thì.
  - Đảm bảo ứng dụng chạy an toàn trên mọi thiết bị và hệ điều hành.
