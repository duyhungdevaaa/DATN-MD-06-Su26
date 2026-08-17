# Báo cáo Rà soát & Chuẩn hóa Toàn diện Văn bản / Thuật ngữ (Copywriting Audit & Polish)

Đã tiến hành rà soát toàn bộ các màn hình trên ứng dụng Android (`app/`) và trang Quản trị Web Admin (`admin-web/`), xóa bỏ các cụm từ vô nghĩa, mô tả sáo rỗng hoặc không đúng chức năng thực tế.

---

## 1. Các hạng mục rà soát và tinh chỉnh trên Android App

| Vị trí / Màn hình | Trước khi sửa | Sau khi chuẩn hóa / Xử lý |
| :--- | :--- | :--- |
| **Giỏ hàng (`activity_cart.xml`)** | `Nhận 0 Trendify Xu` *(chữ thừa, không có tính năng tương ứng)* | **Đã xóa bỏ hoàn toàn**, giữ thanh thanh toán gọn gàng, rõ ràng. |
| **Hồ sơ cá nhân (`fragment_profile.xml`)** | `Trendify Xu` & `Kho Voucher` *(không có liên kết)* | Thay bằng các tiện ích thực tế: **Yêu thích** *(chuyển sang tab Yêu thích)*, **Ví Trendify**, **Mã giảm giá** *(mở danh sách voucher)*, **Sổ địa chỉ** *(mở quản lý địa chỉ)*. |
| **Kết quả đặt hàng (`activity_order_success.xml`)** | `Sự lựa chọn của bạn thể hiện gu thẩm mỹ hoàn hảo...` *(câu sáo rỗng)* & `ic_favorite` cho địa chỉ | Sửa thành: `Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được ghi nhận và đang được chuẩn bị để giao sớm nhất.` và đổi icon sang `ic_location` chuẩn xác. |
| **Đăng nhập (`activity_login.xml`)** | `Đăng nhập để tiếp tục hành trình của bạn.` | `Đăng nhập tài khoản để tiếp tục mua sắm.` |
| **Đăng ký (`activity_register.xml`)** | `Tạo tài khoản để bắt đầu hành trình của bạn.` | `Đăng ký tài khoản để trải nghiệm mua sắm tiện lợi.` |

---

## 2. Các hạng mục rà soát và tinh chỉnh trên Web Admin

| Vị trí / Component | Trước khi sửa | Sau khi chuẩn hóa |
| :--- | :--- | :--- |
| **Tổng quan (`DashboardView.tsx`)** | Các từ lủng củng như `Doanh số chuẩn`, `Cộng đồng khách hàng`, số lẻ trục Y `13.6 Tr` | Chuẩn hóa 100% thuật ngữ: `Doanh thu thuần`, `Giá trị TB/Đơn (AOV)`, `Mặt hàng tồn kho`, `Cảnh báo tồn kho`, tự động làm tròn trục Y số đẹp (`Nice Round Numbers`). |
| **Mã giảm giá (`VoucherListView.tsx`)** | Hiển thị dạng thẻ lưới cồng kềnh | Trình bày dạng **Bảng danh sách chuẩn mực (Table List)** với đầy đủ cột mã, mức giảm (% / tiền mặt), giảm tối đa, hạn dùng, trạng thái và thao tác nhanh. |
| **Chi tiết đơn hàng (`OrderDetailView.tsx`)** | Tên hàm `handlePrintMock` | Chuẩn hóa thành `handlePrintOrder` kích hoạt lệnh in trực tiếp của trình duyệt (`window.print()`). |

---

## 3. Kết quả kiểm thử & Biên dịch
- **Android App**: `./gradlew assembleDebug` ➔ **`BUILD SUCCESSFUL in 32s`**.
- **Web Admin**: `npm run build` ➔ **`built in 5.91s`**, deploy Firebase Hosting thành công tại **[https://ketnoifirebase-3a966.web.app](https://ketnoifirebase-3a966.web.app)**.
