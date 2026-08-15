package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.LayoutInflater;
import android.widget.LinearLayout;
import android.net.Uri;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ImageView;
import android.widget.Button;
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
import com.bumptech.glide.Glide;

public class OrderConfirmActivity extends AppCompatActivity {

    private long shippingFee = 30000; // Mặc định nếu không tính được phí
    private int selectedDistrictId = -1;
    private String selectedWardCode = "";
    private static final String PAYOS_BACKEND_URL = "https://backendpayos.onrender.com/api/payment/create";

    private ProgressBar progressBar;
    private CartManager cartManager;
    private TextView tvShippingAddress;
    private TextView tvSubtotal;
    private TextView tvShippingFee;
    private TextView tvDiscount;
    private TextView tvTotal;
    private TextView tvPaymentMethod;
    private android.widget.EditText etVoucherCode;
    private TextView btnApplyVoucher;
    private TextView tvVoucherMessage;
    private Voucher appliedVoucher;
    private long appliedDiscount;
    private String paymentMethod = "Thẻ tín dụng";
    
    // Wallet
    private android.widget.CheckBox cbUseWallet;
    private TextView tvWalletBalanceOption;
    private long userWalletBalance = 0;
    private boolean isWalletUsed = false;
    private long walletAmountUsed = 0;
    
    // UI details
    private TextView tvDetailSubtotal;
    private TextView tvDetailShipping;
    private TextView tvDetailTotal;

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
        tvShippingFee = findViewById(R.id.tvShippingFee);
        tvDiscount = findViewById(R.id.tvDiscount);
        tvTotal = findViewById(R.id.tvTotal);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        etVoucherCode = findViewById(R.id.etVoucherCode);
        btnApplyVoucher = findViewById(R.id.btnApplyVoucher);
        tvVoucherMessage = findViewById(R.id.tvVoucherMessage);
        
        tvDetailSubtotal = findViewById(R.id.tvDetailSubtotal);
        tvDetailShipping = findViewById(R.id.tvDetailShipping);
        tvDetailTotal = findViewById(R.id.tvDetailTotal);
        
        cbUseWallet = findViewById(R.id.cbUseWallet);
        tvWalletBalanceOption = findViewById(R.id.tvWalletBalanceOption);

        if (cbUseWallet != null) {
            cbUseWallet.setOnCheckedChangeListener((buttonView, isChecked) -> {
                isWalletUsed = isChecked;
                cartManager.loadCart(new CartManager.CartLoadCallback() {
                    @Override
                    public void onLoaded(List<CartItem> allItems) {
                        List<CartItem> items = filterSelectedItems(allItems);
                        updateSummary(items);
                    }
                    @Override
                    public void onFailure(String error) {}
                });
            });
        }
        
        loadWalletBalance();

        btnApplyVoucher.setOnClickListener(v -> applyVoucherCode());

        String shippingAddressExtra = getIntent().getStringExtra("shipping_address");
        String selectedPaymentMethod = getIntent().getStringExtra("payment_method");
        if (selectedPaymentMethod != null && !selectedPaymentMethod.isEmpty()) {
            paymentMethod = selectedPaymentMethod;
        }

        String displayAddress = shippingAddressExtra;
        if (shippingAddressExtra != null && shippingAddressExtra.contains("|||")) {
            String[] parts = shippingAddressExtra.split("\\|\\|\\|");
            if (parts.length >= 4) {
                try {
                    selectedDistrictId = Integer.parseInt(parts[1]);
                } catch (Exception e) {}
                selectedWardCode = parts[2];
                displayAddress = parts[3];
            }
        }

        if (displayAddress != null && !displayAddress.isEmpty()) {
            tvShippingAddress.setText(displayAddress);
        }
        if (tvPaymentMethod != null) {
            tvPaymentMethod.setText(paymentMethod);
        }
        if (tvDiscount != null) {
            tvDiscount.setText("-0đ");
        }
        loadOrderSummary();

        View btnSelectVoucher = findViewById(R.id.btnSelectVoucher);
        if (btnSelectVoucher != null) {
            btnSelectVoucher.setOnClickListener(v -> {
                android.content.Intent intent = new android.content.Intent(this, VoucherListActivity.class);
                startActivityForResult(intent, 2002);
            });
        }

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());
        findViewById(R.id.btnPlaceOrder).setOnClickListener(v -> placeOrder());
    }

    private void loadWalletBalance() {
        FirestoreHelper.loadUserProfile(new FirestoreHelper.ProfileCallback() {
            @Override
            public void onLoaded(UserProfile profile) {
                userWalletBalance = profile.getWalletBalance();
                if (tvWalletBalanceOption != null) {
                    tvWalletBalanceOption.setText("Số dư: " + formatCurrency(userWalletBalance));
                }
                if (userWalletBalance <= 0 && cbUseWallet != null) {
                    cbUseWallet.setEnabled(false);
                }
            }
            @Override
            public void onFailure(String error) {
                Log.e("OrderConfirm", "Không thể tải số dư ví: " + error);
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 2002 && resultCode == RESULT_OK && data != null) {
            String code = data.getStringExtra("selected_voucher_code");
            if (code != null && !code.isEmpty()) {
                if (etVoucherCode != null) {
                    etVoucherCode.setText(code);
                    applyVoucherCode();
                }
            }
        }
    }

    private List<CartItem> filterSelectedItems(List<CartItem> allItems) {
        java.util.ArrayList<String> selectedIds = getIntent().getStringArrayListExtra("SELECTED_CART_ITEM_IDS");
        if (selectedIds == null || selectedIds.isEmpty()) return allItems;
        List<CartItem> filtered = new java.util.ArrayList<>();
        for (CartItem item : allItems) {
            if (selectedIds.contains(item.getCartItemId())) {
                filtered.add(item);
            }
        }
        return filtered;
    }

    private void loadOrderSummary() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        cartManager.loadCart(new CartManager.CartLoadCallback() {
            @Override
            public void onLoaded(List<CartItem> allItems) {
                List<CartItem> items = filterSelectedItems(allItems);
                calculateShippingFee(items, new Runnable() {
                    @Override
                    public void run() {
                        updateSummary(items);
                        if (progressBar != null) progressBar.setVisibility(View.GONE);
                    }
                });
            }

            @Override
            public void onFailure(String error) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
            }
        });
    }

    private void calculateShippingFee(List<CartItem> items, Runnable onComplete) {
        if (selectedDistrictId == -1 || selectedWardCode == null || selectedWardCode.isEmpty() || items.isEmpty()) {
            shippingFee = 0;
            onComplete.run();
            return;
        }

        long totalWeight = 0;
        for (CartItem item : items) {
            totalWeight += 200 * item.getQuantity(); // Giả sử mỗi sản phẩm 200g
        }
        if (totalWeight < 10) totalWeight = 200;

        final long finalTotalWeight = totalWeight;

        new Thread(() -> {
            try {
                JSONObject payload = new JSONObject();
                payload.put("service_type_id", 2);
                payload.put("from_district_id", 1482); // Quận Bắc Từ Liêm, Hà Nội
                payload.put("from_ward_code", "11013"); // Phường Xuân Tảo, Bắc Từ Liêm
                payload.put("to_district_id", selectedDistrictId);
                payload.put("to_ward_code", selectedWardCode);
                payload.put("height", 10);
                payload.put("length", 10);
                payload.put("weight", finalTotalWeight);
                payload.put("width", 10);
                payload.put("insurance_value", 0);

                URL url = new URL("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("Token", "ecefb2fb-7203-11f1-a973-aee5264794df");
                conn.setRequestProperty("ShopId", "200902");
                conn.setDoOutput(true);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes("UTF-8"));
                }

                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    
                    JSONObject responseJson = new JSONObject(sb.toString());
                    if (responseJson.has("data") && !responseJson.isNull("data")) {
                        JSONObject data = responseJson.getJSONObject("data");
                        shippingFee = data.getLong("total");
                    } else {
                        shippingFee = -1;
                    }
                } else {
                    shippingFee = -1;
                }
            } catch (Exception e) {
                Log.e("GHN", "Lỗi tính phí ship", e);
                shippingFee = -1;
            } finally {
                runOnUiThread(() -> {
                    if (shippingFee == -1) {
                        shippingFee = 0;
                        Toast.makeText(OrderConfirmActivity.this, "Không thể tính phí vận chuyển. Vui lòng thử lại sau.", Toast.LENGTH_LONG).show();
                    }
                    onComplete.run();
                });
            }
        }).start();
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
                    public void onLoaded(List<CartItem> allItems) {
                        List<CartItem> items = filterSelectedItems(allItems);
                        calculateShippingFee(items, () -> {
                            updateSummary(items);
                            if (tvVoucherMessage != null) {
                                tvVoucherMessage.setText("Đã áp dụng voucher: " + voucher.getCode());
                            }
                        });
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
                    public void onLoaded(List<CartItem> allItems) {
                        List<CartItem> items = filterSelectedItems(allItems);
                        calculateShippingFee(items, () -> updateSummary(items));
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
        long total = subtotal + shippingFee - appliedDiscount;
        if (total < 0) {
            total = 0;
        }
        
        walletAmountUsed = 0;
        boolean useWallet = isWalletUsed || "Ví TrendifyPay".equals(paymentMethod);
        if (useWallet && userWalletBalance > 0) {
            if (userWalletBalance >= total) {
                walletAmountUsed = total;
                total = 0;
            } else {
                walletAmountUsed = userWalletBalance;
                total -= userWalletBalance;
            }
        }
        
        if (tvSubtotal != null) {
            tvSubtotal.setText(formatCurrency(subtotal));
        }
        if (tvShippingFee != null) {
            tvShippingFee.setText(formatCurrency(shippingFee));
        }
        if (tvDiscount != null) {
            tvDiscount.setText("-" + formatCurrency(appliedDiscount));
        }
        if (tvTotal != null) {
            tvTotal.setText(formatCurrency(total));
        }
        
        // Update Chi tiết thanh toán block
        if (tvDetailSubtotal != null) {
            tvDetailSubtotal.setText(formatCurrency(subtotal));
        }
        if (tvDetailShipping != null) {
            tvDetailShipping.setText(formatCurrency(shippingFee));
        }
        if (tvDetailTotal != null) {
            tvDetailTotal.setText(formatCurrency(total));
        }

        // Render dynamic product items
        LinearLayout container = findViewById(R.id.llProductContainer);
        if (container != null) {
            container.removeAllViews();
            LayoutInflater inflater = LayoutInflater.from(this);
            for (CartItem item : items) {
                View itemView = inflater.inflate(R.layout.item_checkout_product, container, false);
                
                ImageView ivProductImage = itemView.findViewById(R.id.ivProductImage);
                TextView tvProductName = itemView.findViewById(R.id.tvProductName);
                TextView tvProductVariant = itemView.findViewById(R.id.tvProductVariant);
                TextView tvProductPrice = itemView.findViewById(R.id.tvProductPrice);
                TextView tvProductQuantity = itemView.findViewById(R.id.tvProductQuantity);
                
                if (tvProductName != null) tvProductName.setText(item.getName());
                
                if (tvProductVariant != null) {
                    StringBuilder variant = new StringBuilder("Phân loại hàng: ");
                    boolean hasVariant = false;
                    if (item.getSize() != null && !item.getSize().isEmpty()) {
                        variant.append(item.getSize());
                        hasVariant = true;
                    }
                    if (item.getColor() != null && !item.getColor().isEmpty()) {
                        if (hasVariant) variant.append(", ");
                        variant.append(item.getColor());
                        hasVariant = true;
                    }
                    if (hasVariant) {
                        tvProductVariant.setVisibility(View.VISIBLE);
                        tvProductVariant.setText(variant.toString());
                    } else {
                        tvProductVariant.setVisibility(View.GONE);
                    }
                }
                
                if (tvProductPrice != null) {
                    tvProductPrice.setText(formatCurrency(item.getPriceAsLong()));
                }
                
                if (tvProductQuantity != null) {
                    tvProductQuantity.setText("x" + item.getQuantity());
                }
                
                if (ivProductImage != null && item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                    Glide.with(this)
                            .load(item.getImageUrl())
                            .centerCrop()
                            .into(ivProductImage);
                }
                
                container.addView(itemView);
            }
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
            public void onLoaded(List<CartItem> allItems) {
                List<CartItem> items = filterSelectedItems(allItems);
                Log.d("PayOSIntegration", "cartManager.loadCart.onLoaded() được gọi. Số lượng sản phẩm: " + items.size());
                if (items.isEmpty()) {
                    Toast.makeText(OrderConfirmActivity.this, "Giỏ hàng trống", Toast.LENGTH_SHORT).show();
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    return;
                }
                if (shippingFee <= 0) {
                    Toast.makeText(OrderConfirmActivity.this, "Không thể tính phí vận chuyển hoặc địa chỉ không hợp lệ. Vui lòng kiểm tra lại.", Toast.LENGTH_LONG).show();
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    findViewById(R.id.btnPlaceOrder).setEnabled(true);
                    return;
                }
                Log.d("PayOSIntegration", "Phuong thuc thanh toan da chon: " + paymentMethod);
                
                long subtotal = 0;
                for (CartItem item : items) {
                    subtotal += item.getPriceAsLong() * item.getQuantity();
                }
                long total = subtotal + shippingFee - appliedDiscount;
                if (total < 0) total = 0;
                if (walletAmountUsed > 0) total -= walletAmountUsed;
                
                if ("Ví TrendifyPay".equals(paymentMethod)) {
                    if (total > 0) {
                        Toast.makeText(OrderConfirmActivity.this, "Số dư ví không đủ để thanh toán toàn bộ đơn hàng!", Toast.LENGTH_LONG).show();
                        if (progressBar != null) progressBar.setVisibility(View.GONE);
                        findViewById(R.id.btnPlaceOrder).setEnabled(true);
                        return;
                    }
                    Log.d("PayOSIntegration", "Goi saveOrderToFirestore...");
                    saveOrderToFirestore(items);
                } else if ("Chuyển khoản ngân hàng".equals(paymentMethod) || "ZaloPay".equals(paymentMethod) || "MoMo".equals(paymentMethod)) {
                    if (total == 0) {
                        saveOrderToFirestore(items);
                    } else {
                        Log.d("PayOSIntegration", "Goi createPayOSPaymentLink...");
                        createPayOSPaymentLink(items);
                    }
                } else {
                    Log.d("PayOSIntegration", "Goi saveOrderToFirestore...");
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
        long total = subtotal + shippingFee - appliedDiscount;
        long originalTotal = subtotal + shippingFee;
        if (total < 0) {
            total = 0;
        }

        String rawShippingAddress = getIntent().getStringExtra("shipping_address");
        String customerName = "Khách hàng";
        String phone = "";
        String cleanAddress = rawShippingAddress != null ? rawShippingAddress : "";

        if (rawShippingAddress != null && rawShippingAddress.contains("|||")) {
            String[] parts = rawShippingAddress.split("\\|\\|\\|");
            if (parts.length >= 4) {
                cleanAddress = parts[3];
            }
        }

        if (cleanAddress != null && cleanAddress.contains(" - ")) {
            try {
                int dashIdx = cleanAddress.indexOf(" - ");
                String namePart = cleanAddress.substring(0, dashIdx);
                if (namePart.contains(": ")) {
                    customerName = namePart.substring(namePart.indexOf(": ") + 2).trim();
                } else {
                    customerName = namePart.trim();
                }
                int newlineIdx = cleanAddress.indexOf("\n", dashIdx);
                if (newlineIdx > dashIdx) {
                    phone = cleanAddress.substring(dashIdx + 3, newlineIdx).trim();
                }
            } catch (Exception e) {}
        }

        String finalPaymentMethod = paymentMethod;
        long grandTotalNeeded = subtotal + shippingFee - appliedDiscount;
        if (walletAmountUsed > 0 && walletAmountUsed >= grandTotalNeeded) {
            finalPaymentMethod = "Ví TrendifyPay";
        }

        Map<String, Object> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("userId", uid);
        order.put("customerName", customerName);
        order.put("phone", phone);
        order.put("address", cleanAddress);
        order.put("shippingAddress", cleanAddress);
        order.put("date", date);
        order.put("createdAt", Timestamp.now());
        order.put("status", "Chờ xác nhận");
        order.put("subtotal", subtotal);
        order.put("shippingFee", shippingFee);
        order.put("discountAmount", appliedDiscount);
        order.put("walletAmountUsed", walletAmountUsed);
        order.put("originalTotal", originalTotal);
        order.put("total", total);
        order.put("paymentMethod", finalPaymentMethod);
        if (appliedVoucher != null) {
            order.put("voucherId", appliedVoucher.getVoucherId());
            order.put("voucherCode", appliedVoucher.getCode());
            order.put("discountRate", appliedVoucher.getDiscountRate());
        }
        order.put("items", items);

        final String finalAddress = cleanAddress;
        FirebaseFirestore.getInstance()
                .collection("orders")
                .document(orderId)
                .set(order)
                .addOnSuccessListener(v -> {
                    deductProductStock(items);
                    if (walletAmountUsed > 0) {
                        deductWalletBalance(walletAmountUsed);
                    }
                    // Xóa giỏ hàng sau khi đặt thành công
                    java.util.ArrayList<String> selectedIds = getIntent().getStringArrayListExtra("SELECTED_CART_ITEM_IDS");
                    cartManager.clearSelectedItems(selectedIds, new CartManager.CartCallback() {
                        @Override public void onSuccess() {
                            if (progressBar != null) progressBar.setVisibility(View.GONE);
                            Intent intent = new Intent(OrderConfirmActivity.this, OrderSuccessActivity.class);
                            intent.putExtra("order_id", orderId);
                            intent.putExtra("shipping_address", finalAddress);
                            intent.putExtra("payment_method", paymentMethod);
                            startActivity(intent);
                            finish();
                        }
                        @Override public void onFailure(String error) {
                            // Đơn đã lưu, giỏ chưa xóa được — vẫn chuyển màn
                            if (progressBar != null) progressBar.setVisibility(View.GONE);
                            Intent intent = new Intent(OrderConfirmActivity.this, OrderSuccessActivity.class);
                            intent.putExtra("order_id", orderId);
                            intent.putExtra("shipping_address", finalAddress);
                            intent.putExtra("payment_method", paymentMethod);
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

    private void deductWalletBalance(long amount) {
        String uid = SessionManager.getInstance().getUserId();
        if (uid == null) return;
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        db.collection("users").document(uid).update("walletBalance", com.google.firebase.firestore.FieldValue.increment(-amount))
          .addOnSuccessListener(aVoid -> Log.d("OrderConfirm", "Đã trừ tiền trong ví: " + amount))
          .addOnFailureListener(e -> Log.e("OrderConfirm", "Lỗi trừ tiền trong ví: ", e));
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
        long total = subtotal + shippingFee - appliedDiscount;
        long originalTotal = subtotal + shippingFee;
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
        order.put("status", "Chờ xác nhận");
        order.put("subtotal", subtotal);
        order.put("shippingFee", shippingFee);
        order.put("discountAmount", appliedDiscount);
        order.put("walletAmountUsed", walletAmountUsed);
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
                    deductProductStock(items);
                    if (walletAmountUsed > 0) {
                        deductWalletBalance(walletAmountUsed);
                    }
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
                    paymentIntent.putExtra("shipping_address", shippingAddress);
                    
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
        long total = subtotal + shippingFee - appliedDiscount;
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

    private void deductProductStock(List<CartItem> items) {
        if (items == null || items.isEmpty()) return;
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        for (CartItem item : items) {
            String prodId = item.getProductId();
            if (prodId == null || prodId.isEmpty()) continue;
            
            db.collection("products").document(prodId).get()
                .addOnSuccessListener(documentSnapshot -> {
                    if (!documentSnapshot.exists()) return;
                    
                    ProductItem product = documentSnapshot.toObject(ProductItem.class);
                    if (product == null) return;
                    
                    // Deduct overall quantity
                    int newQty = Math.max(0, product.getQuantity() - item.getQuantity());
                    product.setQuantity(newQty);
                    
                    // Deduct variant quantity
                    List<ProductItem.Variant> variants = product.getVariants();
                    if (variants != null && !variants.isEmpty()) {
                        String selectedSz = item.getSize();
                        String selectedCl = item.getColor();
                        if (selectedSz != null && selectedCl != null) {
                            for (ProductItem.Variant var : variants) {
                                if (var.getSize().equalsIgnoreCase(selectedSz) && var.getColor().equalsIgnoreCase(selectedCl)) {
                                    int varQty = Math.max(0, var.getQuantity() - item.getQuantity());
                                    var.setQuantity(varQty);
                                    break;
                                }
                            }
                        }
                    }
                    
                    int newSold = product.getSold() + item.getQuantity();
                    
                    documentSnapshot.getReference().update(
                        "quantity", newQty,
                        "variants", variants,
                        "sold", newSold
                    )
                        .addOnSuccessListener(aVoid -> Log.d("StockUpdate", "Deducted stock for " + prodId + " successfully"))
                        .addOnFailureListener(e -> Log.e("StockUpdate", "Failed to write back stock for " + prodId + ": " + e.getMessage()));
                });
        }
    }

    private String formatCurrency(long value) {
        return String.format("%,dđ", value).replace(",", ".");
    }}
