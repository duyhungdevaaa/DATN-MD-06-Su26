package fpoly.DatnMD06Su26.trendify.activity;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import fpoly.DatnMD06Su26.trendify.R;

public class OrderConfirmActivity extends AppCompatActivity {
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.helper.CartManager;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;
import fpoly.DatnMD06Su26.trendify.model.CartItem;
import fpoly.DatnMD06Su26.trendify.model.Voucher;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.FirebaseFirestore;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Log;

public class OrderConfirmActivity extends AppCompatActivity {

    private static final long SHIPPING_FEE = 30000;
    private static final String PAYOS_BACKEND_URL = "https://backendpayos.onrender.com/api/payment/create";

    private ProgressBar progressBar;
    private CartManager cartManager;
    private TextView tvShippingAddress;
    private TextView tvSubtotal;
    private TextView tvDiscount;
    private TextView tvTotal;
    private TextView tvPaymentMethod;
    private TextInputEditText etVoucherCode;
    private MaterialButton btnApplyVoucher;
    private TextView tvVoucherMessage;
    private Voucher appliedVoucher;
    private long appliedDiscount;
    private String paymentMethod = "Thẻ tín dụng";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_confirm);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        cartManager = new CartManager();
        progressBar = findViewById(R.id.progressBar);
        tvShippingAddress = findViewById(R.id.tvShippingAddress);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvDiscount = findViewById(R.id.tvDiscount);
        tvTotal = findViewById(R.id.tvTotal);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        etVoucherCode = findViewById(R.id.etVoucherCode);
        btnApplyVoucher = findViewById(R.id.btnApplyVoucher);
        tvVoucherMessage = findViewById(R.id.tvVoucherMessage);

        btnApplyVoucher.setOnClickListener(v -> applyVoucherCode());

        String shippingAddress = getIntent().getStringExtra("shipping_address");
        String selectedPaymentMethod = getIntent().getStringExtra("payment_method");
        if (selectedPaymentMethod != null && !selectedPaymentMethod.isEmpty()) {
            paymentMethod = selectedPaymentMethod;
        }
        if (shippingAddress != null && !shippingAddress.isEmpty()) {
            tvShippingAddress.setText(shippingAddress);
        }
        if (tvPaymentMethod != null) {
            tvPaymentMethod.setText(paymentMethod);
        }
        if (tvDiscount != null) {
            tvDiscount.setText("-0đ");
        }
        loadOrderSummary();

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());
        findViewById(R.id.btnPlaceOrder).setOnClickListener(v -> placeOrder());
    }

    private void loadOrderSummary() {
        cartManager.loadCart(new CartManager.CartLoadCallback() {
            @Override
            public void onLoaded(List<CartItem> items) {
                updateSummary(items);
            }

            @Override
            public void onFailure(String error) {
                // Không cần hiển thị lỗi cho bản tóm tắt đơn hàng
            }
        });
    }

    private void applyVoucherCode() {
        String code = etVoucherCode != null ? etVoucherCode.getText().toString().trim() : "";
        if (code.isEmpty()) {
            if (tvVoucherMessage != null) {
                tvVoucherMessage.setText("Vui lòng nhập mã voucher");
            }
            return;
        }
        if (progressBar != null) {
            progressBar.setVisibility(View.VISIBLE);
        }
        btnApplyVoucher.setEnabled(false);
        FirestoreHelper.validateVoucher(code, new FirestoreHelper.VoucherCallback() {
            @Override
            public void onLoaded(Voucher voucher) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
                appliedVoucher = voucher;
                appliedDiscount = 0;
                cartManager.loadCart(new CartManager.CartLoadCallback() {
                    @Override
                    public void onLoaded(List<CartItem> items) {
                        updateSummary(items);
                        if (tvVoucherMessage != null) {
                            tvVoucherMessage.setText("Đã áp dụng voucher: " + voucher.getCode());
                        }
                    }

                    @Override
                    public void onFailure(String error) {
                        if (tvVoucherMessage != null) {
                            tvVoucherMessage.setText("Không thể cập nhật voucher ngay bây giờ");
                        }
                    }
                });
                btnApplyVoucher.setEnabled(true);
            }

            @Override
            public void onFailure(String error) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
                appliedVoucher = null;
                appliedDiscount = 0;
                if (tvVoucherMessage != null) {
                    tvVoucherMessage.setText(error);
                }
                cartManager.loadCart(new CartManager.CartLoadCallback() {
                    @Override
                    public void onLoaded(List<CartItem> items) {
                        updateSummary(items);
                    }
                    @Override
                    public void onFailure(String innerError) {
                        // ignore
                    }
                });
                btnApplyVoucher.setEnabled(true);
            }
        });
    }

    private void updateSummary(List<CartItem> items) {
        long subtotal = 0;
        for (CartItem item : items) {
            subtotal += item.getPriceAsLong() * item.getQuantity();
        }
        appliedDiscount = appliedVoucher != null ? appliedVoucher.calculateDiscount(subtotal) : 0;
        long total = subtotal + SHIPPING_FEE - appliedDiscount;
        if (total < 0) {
            total = 0;
        }
        if (tvSubtotal != null) {
            tvSubtotal.setText(formatCurrency(subtotal));
        }
        if (tvDiscount != null) {
            tvDiscount.setText("-" + formatCurrency(appliedDiscount));
        }
        if (tvTotal != null) {
            tvTotal.setText(formatCurrency(total));
        }
    }

    private void placeOrder() {
        Log.d("PayOSIntegration", "placeOrder() được gọi");
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        findViewById(R.id.btnPlaceOrder).setEnabled(false);

        // Load giỏ hàng rồi lưu đơn hàng
        Log.d("PayOSIntegration", "Đang gọi cartManager.loadCart...");
        cartManager.loadCart(new CartManager.CartLoadCallback() {
            @Override
            public void onLoaded(List<CartItem> items) {
                Log.d("PayOSIntegration", "cartManager.loadCart.onLoaded() được gọi. Số lượng sản phẩm: " + items.size());
                if (items.isEmpty()) {
                    Toast.makeText(OrderConfirmActivity.this, "Giỏ hàng trống", Toast.LENGTH_SHORT).show();
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    return;
                }
                Log.d("PayOSIntegration", "Phương thức thanh toán đã chọn: " + paymentMethod);
                if ("Chuyển khoản ngân hàng".equals(paymentMethod)) {
                    Log.d("PayOSIntegration", "Gọi createPayOSPaymentLink...");
                    createPayOSPaymentLink(items);
                } else {
                    Log.d("PayOSIntegration", "Gọi saveOrderToFirestore...");
                    saveOrderToFirestore(items);
                }
            }
            @Override
            public void onFailure(String error) {
                Log.e("PayOSIntegration", "cartManager.loadCart.onFailure() được gọi. Lỗi: " + error);
                Toast.makeText(OrderConfirmActivity.this, "Lỗi: " + error, Toast.LENGTH_SHORT).show();
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                findViewById(R.id.btnPlaceOrder).setEnabled(true);
            }
        });
    }

    private void saveOrderToFirestore(List<CartItem> items) {
        String uid     = SessionManager.getInstance().getUserId();
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String date    = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(new Date());

        long subtotal = 0;
        for (CartItem item : items) {
            subtotal += item.getPriceAsLong() * item.getQuantity();
        }
        appliedDiscount = appliedVoucher != null ? appliedVoucher.calculateDiscount(subtotal) : 0;
        long total = subtotal + SHIPPING_FEE - appliedDiscount;
        long originalTotal = subtotal + SHIPPING_FEE;
        if (total < 0) {
            total = 0;
        }

        Map<String, Object> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("userId", uid);
        order.put("date", date);
        order.put("createdAt", Timestamp.now());
        order.put("status", "Đang xử lý");
        order.put("subtotal", subtotal);
        order.put("shippingFee", SHIPPING_FEE);
        order.put("discountAmount", appliedDiscount);
        order.put("originalTotal", originalTotal);
        order.put("total", total);
        order.put("paymentMethod", paymentMethod);
        if (appliedVoucher != null) {
            order.put("voucherId", appliedVoucher.getVoucherId());
            order.put("voucherCode", appliedVoucher.getCode());
            order.put("discountRate", appliedVoucher.getDiscountRate());
        }
        String shippingAddress = getIntent().getStringExtra("shipping_address");
        if (shippingAddress != null && !shippingAddress.isEmpty()) {
            order.put("shippingAddress", shippingAddress);
        }
        order.put("items", items); // Firestore tự serialize list

        FirebaseFirestore.getInstance()
                .collection("orders")
                .document(orderId)
                .set(order)
                .addOnSuccessListener(v -> {
                    // Xóa giỏ hàng sau khi đặt thành công
                    cartManager.clearCart(new CartManager.CartCallback() {
                        @Override public void onSuccess() {
                            if (progressBar != null) progressBar.setVisibility(View.GONE);
                            Intent intent = new Intent(OrderConfirmActivity.this, OrderSuccessActivity.class);
                            intent.putExtra("order_id", orderId);
                            startActivity(intent);
                            finish();
                        }
                        @Override public void onFailure(String error) {
                            // Đơn đã lưu, giỏ chưa xóa được — vẫn chuyển màn
                            if (progressBar != null) progressBar.setVisibility(View.GONE);
                            Intent intent = new Intent(OrderConfirmActivity.this, OrderSuccessActivity.class);
                            intent.putExtra("order_id", orderId);
                            startActivity(intent);
                            finish();
                        }
                    });
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    Toast.makeText(this, "Đặt hàng thất bại: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }

    private void saveOrderWithPaymentLink(List<CartItem> items, String checkoutUrl, String paymentLinkId, long orderCode, String qrCode, String accountNumber, String accountName, String description, String bin) {
        String uid     = SessionManager.getInstance().getUserId();
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String date    = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(new Date());

        long subtotal = 0;
        for (CartItem item : items) {
            subtotal += item.getPriceAsLong() * item.getQuantity();
        }
        appliedDiscount = appliedVoucher != null ? appliedVoucher.calculateDiscount(subtotal) : 0;
        long total = subtotal + SHIPPING_FEE - appliedDiscount;
        long originalTotal = subtotal + SHIPPING_FEE;
        if (total < 0) {
            total = 0;
        }
        final long finalTotalAmount = total;

        Map<String, Object> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("orderCode", orderCode);
        order.put("userId", uid);
        order.put("date", date);
        order.put("createdAt", Timestamp.now());
        order.put("status", "Chờ thanh toán");
        order.put("subtotal", subtotal);
        order.put("shippingFee", SHIPPING_FEE);
        order.put("discountAmount", appliedDiscount);
        order.put("originalTotal", originalTotal);
        order.put("total", total);
        order.put("paymentMethod", paymentMethod);
        order.put("paymentLinkId", paymentLinkId);
        order.put("paymentLinkUrl", checkoutUrl);
        order.put("paymentStatus", "PENDING");
        if (appliedVoucher != null) {
            order.put("voucherId", appliedVoucher.getVoucherId());
            order.put("voucherCode", appliedVoucher.getCode());
            order.put("discountRate", appliedVoucher.getDiscountRate());
        }
        String shippingAddress = getIntent().getStringExtra("shipping_address");
        if (shippingAddress != null && !shippingAddress.isEmpty()) {
            order.put("shippingAddress", shippingAddress);
        }
        order.put("items", items);

        FirebaseFirestore.getInstance()
                .collection("orders")
                .document(orderId)
                .set(order)
                .addOnSuccessListener(v -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    
                    Intent paymentIntent = new Intent(OrderConfirmActivity.this, PayOSPaymentActivity.class);
                    paymentIntent.putExtra("qrCode", qrCode);
                    paymentIntent.putExtra("orderCode", orderCode);
                    paymentIntent.putExtra("orderId", orderId);
                    paymentIntent.putExtra("checkoutUrl", checkoutUrl);
                    paymentIntent.putExtra("amount", finalTotalAmount);
                    paymentIntent.putExtra("accountNumber", accountNumber);
                    paymentIntent.putExtra("accountName", accountName);
                    paymentIntent.putExtra("description", description);
                    paymentIntent.putExtra("bin", bin);
                    
                    startActivity(paymentIntent);
                    finish();
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    Toast.makeText(this, "Đặt hàng thất bại: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }

    private void createPayOSPaymentLink(List<CartItem> items) {
        Log.d("PayOSIntegration", "Bắt đầu tạo link thanh toán PayOS");
        long subtotal = 0;
        for (CartItem item : items) {
            subtotal += item.getPriceAsLong() * item.getQuantity();
        }
        appliedDiscount = appliedVoucher != null ? appliedVoucher.calculateDiscount(subtotal) : 0;
        long total = subtotal + SHIPPING_FEE - appliedDiscount;
        if (total < 0) {
            total = 0;
        }
        final long finalTotal = total;
        final long orderCodeVal = System.currentTimeMillis() / 1000;

        Log.d("PayOSIntegration", "Thông tin thanh toán: total=" + finalTotal + ", orderCode=" + orderCodeVal);

        new Thread(() -> {
            try {
                JSONObject payload = new JSONObject();
                payload.put("orderCode", orderCodeVal);
                payload.put("amount", finalTotal);
                payload.put("description", "Thanh toán đơn hàng " + orderCodeVal);
                payload.put("returnUrl", "https://ketnoifirebase-3a966.web.app");
                payload.put("cancelUrl", "https://ketnoifirebase-3a966.web.app");

                JSONArray itemsJson = new JSONArray();
                for (CartItem item : items) {
                    JSONObject itemJson = new JSONObject();
                    itemJson.put("name", item.getName());
                    itemJson.put("quantity", item.getQuantity());
                    itemJson.put("price", item.getPriceAsLong());
                    itemsJson.put(itemJson);
                }
                payload.put("items", itemsJson);

                Log.d("PayOSIntegration", "Payload gửi backend: " + payload.toString());
                Log.d("PayOSIntegration", "Gửi request tới URL: " + PAYOS_BACKEND_URL);

                URL url = new URL(PAYOS_BACKEND_URL);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(15000);
                connection.setDoOutput(true);

                Log.d("PayOSIntegration", "Đang mở stream kết nối...");
                try (OutputStream os = connection.getOutputStream()) {
                    os.write(payload.toString().getBytes("UTF-8"));
                }
                Log.d("PayOSIntegration", "Đã viết dữ liệu vào stream, đang đợi response code...");

                int responseCode = connection.getResponseCode();
                Log.d("PayOSIntegration", "HTTP Response Code: " + responseCode);

                if (responseCode != HttpURLConnection.HTTP_OK && responseCode != HttpURLConnection.HTTP_CREATED) {
                    Log.e("PayOSIntegration", "Yêu cầu thất bại, đang đọc stream lỗi...");
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(connection.getErrorStream(), "UTF-8"));
                    StringBuilder errorBuilder = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorBuilder.append(errorLine);
                    }
                    String errorMsg = errorBuilder.toString();
                    Log.e("PayOSIntegration", "Nội dung lỗi từ backend: " + errorMsg);
                    throw new Exception("Backend PayOS lỗi: " + responseCode + " " + errorMsg);
                }

                Log.d("PayOSIntegration", "Yêu cầu thành công, đang đọc response stream...");
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
                StringBuilder responseBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    responseBuilder.append(line);
                }
                String responseStr = responseBuilder.toString();
                Log.d("PayOSIntegration", "Response từ backend: " + responseStr);

                JSONObject responseJson = new JSONObject(responseStr);
                JSONObject dataJson = responseJson.optJSONObject("data");
                String checkoutUrl = "";
                String paymentLinkId = "";
                String qrCode = "";
                String accountNumber = "";
                String accountName = "";
                String description = "";
                String bin = "";
                long responseOrderCode = 0;
                if (dataJson != null) {
                    checkoutUrl = dataJson.optString("checkoutUrl");
                    paymentLinkId = dataJson.optString("paymentLinkId");
                    qrCode = dataJson.optString("qrCode");
                    responseOrderCode = dataJson.optLong("orderCode");
                    accountNumber = dataJson.optString("accountNumber");
                    accountName = dataJson.optString("accountName");
                    description = dataJson.optString("description");
                    bin = dataJson.optString("bin");
                }

                Log.d("PayOSIntegration", "Parsed data: checkoutUrl=" + checkoutUrl + ", paymentLinkId=" + paymentLinkId + ", responseOrderCode=" + responseOrderCode);

                if (checkoutUrl.isEmpty()) {
                    throw new Exception("checkoutUrl không tồn tại trong phản hồi backend");
                }

                final String finalCheckoutUrl = checkoutUrl;
                final String finalPaymentLinkId = paymentLinkId;
                final long finalOrderCode = responseOrderCode != 0 ? responseOrderCode : orderCodeVal;
                final String finalQrCode = qrCode;
                final String finalAccountNumber = accountNumber;
                final String finalAccountName = accountName;
                final String finalDescription = description;
                final String finalBin = bin;

                Log.d("PayOSIntegration", "Chuyển sang UI thread để lưu đơn hàng và chuyển hướng...");
                runOnUiThread(() -> saveOrderWithPaymentLink(items, finalCheckoutUrl, finalPaymentLinkId, finalOrderCode, finalQrCode, finalAccountNumber, finalAccountName, finalDescription, finalBin));
            } catch (Exception e) {
                Log.e("PayOSIntegration", "Lỗi xảy ra trong tiến trình tạo link PayOS", e);
                runOnUiThread(() -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    Toast.makeText(this, "Không thể tạo link PayOS: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            }
        }).start();
    }

    private String formatCurrency(long value) {
        return String.format("%,dđ", value).replace(",", ".");
    }
}
