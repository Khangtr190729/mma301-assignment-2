# Debug Log (Nhật ký gỡ lỗi thực tế)

**Học phần:** MMA301 – Multiplatform Mobile App Development  
**Assignment:** Assignment 02 – Integrated E-Commerce Mobile App  
**Sinh viên:** Trương Hoàng Khang (CE190729)  

---

Quy trình debug tuân thủ chuẩn 5 bước của kỹ sư phần mềm (theo mục 6.1 Student Guide):
1. **Mô tả triệu chứng** quan sát được trên giao diện hoặc console log.
2. **Khoanh vùng** screen / component / state / service liên quan.
3. **Kiểm tra** input / state hiện tại.
4. **Kiểm tra** điểm biến đổi (transformation) / lời gọi bất đồng bộ (async call).
5. **Sửa đổi nhỏ nhất (minimal fix)** → chạy lại case → kiểm tra hồi quy (regression).

---

## Lỗi 1: FlatList gọi API phân trang lặp vô hạn khi người dùng cuộn nhanh đến đáy danh sách

- **Triệu chứng (Symptom):** Khi mở `ProductListScreen` và cuộn nhanh xuống đáy danh sách sản phẩm, console liên tục bắn hàng chục request `GET /products?limit=10&skip=...` trong vòng 1-2 giây. Danh sách sản phẩm bị chớp giật liên tục, spinner tải thêm nhảy loạn và xuất hiện các sản phẩm trùng lặp mã ID.
- **Giả thuyết (Hypothesis):** Callback `onEndReached` của `FlatList` bị kích hoạt nhiều lần liên tiếp khi quán tính cuộn (momentum scroll) của màn hình vẫn đang trượt qua ngưỡng `onEndReachedThreshold`, trong khi request trước đó chưa kịp hoàn tất cập nhật state `isLoadingMore`.
- **Cách kiểm tra (Investigation):**
  - Đặt log `console.log('[ProductList] onEndReached triggered, skip:', products.length)` trong hàm `handleLoadMore`.
  - Mở Network tab hoặc console: phát hiện `onEndReached` bị gọi đến 6 lần chỉ trong một lần quẹt ngón tay.
  - Kiểm tra điều kiện if trong `handleLoadMore`: chỉ mới có điều kiện kiểm tra `products.length < totalCount`, chưa có cờ chốt khóa quán tính.
- **Nguyên nhân gốc rễ (Root Cause):** Trong React Native, sự kiện `onEndReached` có thể phát tín hiệu liên tục chừng nào vị trí cuộn vẫn nằm trong ngưỡng tính toán trước khi trớn cuộn dừng hẳn. Việc chỉ dùng biến state `isLoadingMore` bị trễ do cơ chế cập nhật bất đồng bộ của React state.
- **Cách sửa đổi nhỏ nhất (Minimal Fix):**
  Sử dụng một biến `useRef` lưu cờ quán tính `onEndReachedCalledDuringMomentum` kết hợp với prop `onMomentumScrollBegin` của FlatList:
  ```javascript
  // src/screens/ProductListScreen.jsx
  const onEndReachedCalledDuringMomentum = useRef(true);

  const handleLoadMore = () => {
    // Chỉ tải khi người dùng đã bắt đầu một lượt vuốt mới và request trước đã xong
    if (
      !onEndReachedCalledDuringMomentum.current &&
      !isLoadingMore &&
      !isLoading &&
      products.length < totalCount
    ) {
      setIsLoadingMore(true);
      onEndReachedCalledDuringMomentum.current = true; // Khóa ngay lập tức
      fetchCatalog({ reset: false });
    }
  };

  // Trong FlatList JSX:
  <FlatList
    // ...
    onEndReached={handleLoadMore}
    onEndReachedThreshold={0.4}
    onMomentumScrollBegin={() => {
      onEndReachedCalledDuringMomentum.current = false; // Mở khóa khi bắt đầu vuốt
    }}
  />
  ```
- **Kiểm tra lại (Retest):** Cuộn danh sách với tốc độ cao xuống đáy nhiều lần liên tiếp. Kết quả: Mỗi lần chạm đáy chỉ kích hoạt duy nhất 1 request `GET /products`, danh sách nối tiếp mượt mà, không trùng ID, không giật lag. Đánh giá: **PASS**.

---

## Lỗi 2: Tổng tiền trong giỏ hàng (Cart Total) hiển thị sai lệch chuỗi ký tự hoặc sai số thập phân (NaN / Floating Point Precision)

- **Triệu chứng (Symptom):** Khi thêm sản phẩm có giá lẻ (ví dụ: `$9.99` và `$19.99`), thay vì tính ra `$29.98`, dòng hiển thị tổng tiền lại ra chuỗi lạ `$9.9919.99` hoặc số thập phân bị trôi dấu phẩy `$29.980000000000004`. Thậm chí khi một sản phẩm từ API trả về `price` dạng string `"14.5"`, app hiển thị lỗi `NaN`.
- **Giả thuyết (Hypothesis):** Phép toán cộng tổng tiền trong bộ dẫn xuất `useMemo` đang thực hiện phép cộng trên kiểu dữ liệu chuỗi (string concatenation) thay vì kiểu số (number addition), đồng thời thiếu cơ chế làm tròn tiền tệ 2 chữ số thập phân chuẩn.
- **Cách kiểm tra (Investigation):**
  - Mở `src/context/CartContext.jsx`.
  - Đặt `console.log('Item price type:', typeof item.price, item.price)`.
  - Phát hiện một số API mock hoặc đối tượng truyền từ màn hình chi tiết mang `price` là chuỗi `"9.99"`. Phép toán `rawSubtotal += item.price * qty` khi kết hợp với các chuỗi khác bị ép kiểu không an toàn.
- **Nguyên nhân gốc rễ (Root Cause):** Dữ liệu `price` từ remote API không được ép kiểu cưỡng bức sang `Number` trước khi tính toán số học, và JavaScript gặp vấn đề sai số dấu phẩy động chuẩn IEEE 754 đối với phép nhân/chia phần trăm giảm giá.
- **Cách sửa đổi nhỏ nhất (Minimal Fix):**
  Ép kiểu tường minh bằng `Number(item.price) || 0` và làm tròn số học chuẩn 2 chữ số thập phân (`Math.round(val * 100) / 100`):
  ```javascript
  // src/context/CartContext.jsx
  const { totalItems, subtotal, discount, shipping, totalAmount } = useMemo(() => {
    let itemsCount = 0;
    let rawSubtotal = 0;
    let totalDiscount = 0;

    cartItems.forEach((item) => {
      const qty = item.quantity || 1;
      const price = Number(item.price) || 0; // Ép kiểu an toàn
      itemsCount += qty;
      rawSubtotal += price * qty;

      if (item.discountPercentage && item.discountPercentage > 0) {
        const savedPerItem = (price * item.discountPercentage) / 100;
        totalDiscount += savedPerItem * qty;
      }
    });

    const computedShipping = itemsCount === 0 || rawSubtotal > 50 ? 0 : 4.99;
    const finalTotal = Math.max(0, rawSubtotal - totalDiscount + computedShipping);

    return {
      totalItems: itemsCount,
      subtotal: Math.round(rawSubtotal * 100) / 100,
      discount: Math.round(totalDiscount * 100) / 100,
      shipping: computedShipping,
      totalAmount: Math.round(finalTotal * 100) / 100,
    };
  }, [cartItems]);
  ```
- **Kiểm tra lại (Retest):** Thêm 3 sản phẩm có giá lẻ: `$9.99`, `$19.99`, `$14.99`. Tổng phụ hiển thị chính xác `$44.97`, giảm giá tính đúng, phí ship `$4.99` tự động cộng vào đúng tổng thanh toán. Đánh giá: **PASS**.
