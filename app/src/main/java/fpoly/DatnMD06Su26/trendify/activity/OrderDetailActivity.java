package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import android.widget.Toast;

public class OrderDetailActivity extends AppCompatActivity {

    private OrderDetailItemAdapter adapter;
    private TextView tvOrderId;
    private TextView tvOrderStatus;
    private TextView tvOrderDate;
    private TextView tvShippingAddress;
    private TextView tvPaymentMethod;
    private TextView tvSubtotal;
    private TextView tvShippingFee;
    private TextView tvDiscount;
    private TextView tvTotal;
    private TextView tvPaymentStatus;
    private ImageView ivBack;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_detail);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        ivBack = findViewById(R.id.ivBack);
        tvOrderId = findViewById(R.id.tvOrderId);
        tvOrderStatus = findViewById(R.id.tvOrderStatus);
        tvOrderDate = findViewById(R.id.tvOrderDate);
        tvShippingAddress = findViewById(R.id.tvShippingAddress);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvShippingFee = findViewById(R.id.tvShippingFee);
        tvDiscount = findViewById(R.id.tvDiscount);
        tvTotal = findViewById(R.id.tvTotal);
        tvPaymentStatus = findViewById(R.id.tvPaymentStatus);
        progressBar = findViewById(R.id.progressBar);

        ivBack.setOnClickListener(v -> finish());

        RecyclerView rvItems = findViewById(R.id.rvOrderItems);
        adapter = new OrderDetailItemAdapter();
        adapter.setOnRateClickListener((item, position) -> {
            showRatingDialog(getIntent().getStringExtra("orderId"), item, position);
        });
        rvItems.setLayoutManager(new LinearLayoutManager(this));
        rvItems.setAdapter(adapter);

        loadOrderDetails();
    }

    private void loadOrderDetails() {
        String orderId = getIntent().getStringExtra("orderId");
        if (orderId == null || orderId.isEmpty()) {
            finish();
            return;
        }

        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);

        FirebaseFirestore.getInstance()
                .collection("orders")
                .whereEqualTo("orderId", orderId)
                .get()
                .addOnSuccessListener(snapshot -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    if (snapshot.isEmpty()) {
                        finish();
                        return;
                    }

                    var doc = snapshot.getDocuments().get(0);
                    String status = doc.getString("status");
                    String date = doc.getString("date");
                    String address = doc.getString("shippingAddress");
                    if (address != null && address.contains("|||")) {
                        String[] parts = address.split("\\|\\|\\|");
                        if (parts.length > 0) {
                            address = parts[parts.length - 1].trim();
                        }
                    }
                    String paymentMethod = doc.getString("paymentMethod");
                    String paymentStatus = doc.getString("paymentStatus");
                    Long total = doc.getLong("total");
                    Long shippingFee = doc.getLong("shippingFee");
                    Long discount = doc.getLong("discount");
                    List<?> itemsData = (List<?>) doc.get("items");

                    if (date == null) {
                        Timestamp timestamp = doc.getTimestamp("createdAt");
                        if (timestamp != null) {
                            date = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(timestamp.toDate());
                        } else {
                            date = "";
                        }
                    }

                    tvOrderId.setText(orderId);
                    tvOrderStatus.setText(status != null ? status : "");
                    tvOrderDate.setText(date != null ? date : "");
                    tvShippingAddress.setText(address != null ? address : "Chưa có địa chỉ");
                    tvPaymentMethod.setText(paymentMethod != null ? paymentMethod : "Chưa có phương thức thanh toán");

                    // Set payment status display
                    String displayPaymentStatus = "Chưa thanh toán";
                    int paymentStatusColor = 0xFFF44336; // Red by default

                    if ("Chuyển khoản ngân hàng".equals(paymentMethod)) {
                        if ("PAID".equals(paymentStatus)) {
                            displayPaymentStatus = "Đã thanh toán (Qua PayOS)";
                            paymentStatusColor = 0xFF4CAF50; // Green
                        } else {
                            displayPaymentStatus = "Chờ thanh toán (Chuyển khoản)";
                            paymentStatusColor = 0xFFFF9800; // Orange
                        }
                    } else if ("COD".equals(paymentMethod)) {
                        if ("Đã giao".equals(status)) {
                            displayPaymentStatus = "Đã thanh toán (Thu hộ COD)";
                            paymentStatusColor = 0xFF4CAF50; // Green
                        } else {
                            displayPaymentStatus = "Thanh toán khi nhận hàng (COD)";
                            paymentStatusColor = 0xFF2196F3; // Blue
                        }
                    } else {
                        if (paymentMethod != null && !paymentMethod.isEmpty()) {
                            displayPaymentStatus = paymentMethod;
                        }
                    }

                    if (tvPaymentStatus != null) {
                        tvPaymentStatus.setText("Trạng thái thanh toán: " + displayPaymentStatus);
                        tvPaymentStatus.setTextColor(paymentStatusColor);
                    }

                    // Set status badge color based on status
                    if (status != null) {
                        if (status.equals("Đã giao")) {
                            tvOrderStatus.setTextColor(0xFF4CAF50); // Green
                        } else if (status.equals("Đang vận chuyển")) {
                            tvOrderStatus.setTextColor(0xFF00BCD4); // Cyan
                        } else if (status.equals("Chờ thanh toán")) {
                            tvOrderStatus.setTextColor(0xFFFF9800); // Orange
                        } else if (status.equals("Chờ xác nhận")) {
                            tvOrderStatus.setTextColor(0xFF9E9E9E); // Gray
                        } else if (status.equals("Đang chuẩn bị hàng") || status.equals("Đang xử lý")) {
                            tvOrderStatus.setTextColor(0xFF9C27B0); // Purple
                        } else if (status.equals("Giao hàng thất bại")) {
                            tvOrderStatus.setTextColor(0xFFF44336); // Red
                        } else if (status.equals("Đang chuyển hoàn")) {
                            tvOrderStatus.setTextColor(0xFFFF5722); // Deep Orange
                        } else if (status.equals("Đã chuyển hoàn")) {
                            tvOrderStatus.setTextColor(0xFF607D8B); // Blue Gray
                        } else if (status.equals("Đã hủy")) {
                            tvOrderStatus.setTextColor(0xFFF44336); // Red
                        } else if (status.contains("Trả hàng/Hoàn tiền") || status.contains("Trả hàng/Hoàn đơn") || status.contains("Yêu cầu")) {
                            tvOrderStatus.setTextColor(0xFFE91E63); // Pink
                        } else if (status.equals("Đã hoàn tiền")) {
                            tvOrderStatus.setTextColor(0xFF4CAF50); // Green
                        } else if (status.equals("Từ chối trả hàng")) {
                            tvOrderStatus.setTextColor(0xFF9E9E9E); // Gray
                        } else {
                            tvOrderStatus.setTextColor(0xFF757575);
                        }
                    }
                    // Show or hide bottom action bar and individual buttons
                    View llBottomActions = findViewById(R.id.llBottomActions);
                    View btnReturnRefund = findViewById(R.id.btnReturnRefund);
                    View btnCancelOrder = findViewById(R.id.btnCancelOrder);
                    com.google.android.material.button.MaterialButton btnConfirmReceived = findViewById(R.id.btnConfirmReceived);

                    Double receivedRating = doc.getDouble("receivedRating");
                    boolean hasRated = receivedRating != null && receivedRating > 0;

                    boolean canCancel = status != null && (status.equals("Chờ xác nhận") || status.equals("Chờ thanh toán"));
                    boolean canReturn = status != null && (status.equals("Đã giao hàng") || status.equals("Đã giao") || status.equals("Thành công"));
                    boolean canConfirmReceived = status != null && (status.equals("Đang giao hàng"));
                    boolean canRate = false; // We don't use order-level rating anymore

                    if (canReturn || canConfirmReceived || canCancel) {
                        if (llBottomActions != null) {
                            llBottomActions.setVisibility(View.VISIBLE);
                        }
                        if (btnReturnRefund != null) {
                            btnReturnRefund.setVisibility(canReturn ? View.VISIBLE : View.GONE);
                        }
                        if (btnCancelOrder != null) {
                            btnCancelOrder.setVisibility(canCancel ? View.VISIBLE : View.GONE);
                        }
                        if (btnConfirmReceived != null) {
                            if (canConfirmReceived) {
                                btnConfirmReceived.setText("Đã nhận được hàng");
                                btnConfirmReceived.setVisibility(View.VISIBLE);
                            } else {
                                btnConfirmReceived.setVisibility(View.GONE);
                            }
                        }
                    } else {
                        if (llBottomActions != null) {
                            llBottomActions.setVisibility(View.GONE);
                        }
                    }

                    if (btnCancelOrder != null) {
                        btnCancelOrder.setOnClickListener(v -> {
                            new android.app.AlertDialog.Builder(this)
                                    .setTitle("Hủy đơn hàng")
                                    .setMessage("Bạn có chắc chắn muốn hủy đơn hàng này không?")
                                    .setPositiveButton("Xác nhận hủy", (dialog, which) -> {
                                        FirebaseFirestore.getInstance().collection("orders")
                                                .whereEqualTo("orderId", orderId)
                                                .get()
                                                .addOnSuccessListener(s -> {
                                                    if (!s.isEmpty()) {
                                                        com.google.firebase.firestore.DocumentSnapshot cancelDoc = s.getDocuments().get(0);
                                                        String cancelPaymentMethod = cancelDoc.getString("paymentMethod");
                                                        if (cancelPaymentMethod == null) cancelPaymentMethod = "COD";
                                                        Long cancelTotalObj = cancelDoc.getLong("total");
                                                        long cancelTotal = cancelTotalObj != null ? cancelTotalObj : 0;
                                                        Long cancelWalletUsedObj = cancelDoc.getLong("walletAmountUsed");
                                                        long cancelWalletAmountUsed = cancelWalletUsedObj != null ? cancelWalletUsedObj : 0;
                                                        String cancelUserId = cancelDoc.getString("userId");

                                                        long amountToRefund = 0;
                                                        if (!"COD".equals(cancelPaymentMethod)) {
                                                            amountToRefund = cancelTotal + cancelWalletAmountUsed;
                                                        } else {
                                                            amountToRefund = cancelWalletAmountUsed;
                                                        }

                                                        com.google.firebase.firestore.WriteBatch batch = FirebaseFirestore.getInstance().batch();

                                                        if (amountToRefund > 0 && cancelUserId != null) {
                                                            com.google.firebase.firestore.DocumentReference userRef = FirebaseFirestore.getInstance().collection("users").document(cancelUserId);
                                                            batch.update(userRef, "walletBalance", com.google.firebase.firestore.FieldValue.increment(amountToRefund));
                                                            
                                                            com.google.firebase.firestore.DocumentReference txRef = FirebaseFirestore.getInstance().collection("transactions").document();
                                                            java.util.Map<String, Object> tx = new java.util.HashMap<>();
                                                            tx.put("userId", cancelUserId);
                                                            tx.put("amount", amountToRefund);
                                                            tx.put("type", "REFUND");
                                                            tx.put("description", "Hoàn tiền tự động do hủy đơn hàng " + orderId);
                                                            tx.put("timestamp", com.google.firebase.firestore.FieldValue.serverTimestamp());
                                                            batch.set(txRef, tx);
                                                        }

                                                        // Return stock
                                                        java.util.List<java.util.Map<String, Object>> itemsList = (java.util.List<java.util.Map<String, Object>>) cancelDoc.get("items");
                                                        if (itemsList != null) {
                                                            for (java.util.Map<String, Object> itemMap : itemsList) {
                                                                String pId = null;
                                                                if (itemMap.get("productId") != null) pId = itemMap.get("productId").toString();
                                                                else if (itemMap.get("cartItemId") != null) pId = itemMap.get("cartItemId").toString();
                                                                
                                                                long qty = 0;
                                                                if (itemMap.get("quantity") instanceof Number) {
                                                                    qty = ((Number) itemMap.get("quantity")).longValue();
                                                                } else if (itemMap.get("quantity") instanceof String) {
                                                                    try { qty = Long.parseLong((String) itemMap.get("quantity")); } catch (Exception e) {}
                                                                }
                                                                
                                                                if (pId != null && !pId.isEmpty() && qty > 0) {
                                                                    com.google.firebase.firestore.DocumentReference prodRef = FirebaseFirestore.getInstance().collection("products").document(pId);
                                                                    batch.update(prodRef, "stock", com.google.firebase.firestore.FieldValue.increment(qty));
                                                                }
                                                            }
                                                        }

                                                        batch.update(cancelDoc.getReference(), "status", "Đã hủy");

                                                        batch.commit().addOnSuccessListener(aVoid -> {
                                                            android.widget.Toast.makeText(this, "Hủy đơn thành công", android.widget.Toast.LENGTH_SHORT).show();
                                                            loadOrderDetails();
                                                        }).addOnFailureListener(e -> {
                                                            android.widget.Toast.makeText(this, "Hủy đơn thất bại", android.widget.Toast.LENGTH_SHORT).show();
                                                        });
                                                    }
                                                });
                                    })
                                    .setNegativeButton("Không", null)
                                    .show();
                        });
                    }

                    if (btnReturnRefund != null) {
                        btnReturnRefund.setOnClickListener(v -> {
                            android.content.Intent intent = new android.content.Intent(OrderDetailActivity.this, ReturnRequestActivity.class);
                            intent.putExtra("orderId", orderId);
                            startActivity(intent);
                        });
                    }

                    if (btnConfirmReceived != null) {
                        btnConfirmReceived.setOnClickListener(v -> {
                            if (canConfirmReceived) {
                                FirebaseFirestore.getInstance().collection("orders")
                                        .whereEqualTo("orderId", orderId)
                                        .get()
                                        .addOnSuccessListener(s -> {
                                            if (!s.isEmpty()) {
                                                s.getDocuments().get(0).getReference().update("status", "Đã giao")
                                                        .addOnSuccessListener(a -> loadOrderDetails());
                                            }
                                        });
                            }
                        });
                    }

                    // Calculate price summary
                    List<CartItem> items = new ArrayList<>();
                    long subtotal = 0;
                    if (itemsData != null && !itemsData.isEmpty()) {
                        for (var itemData : itemsData) {
                            if (itemData instanceof java.util.Map) {
                                java.util.Map<?, ?> itemMap = (java.util.Map<?, ?>) itemData;
                                String productId = itemMap.get("productId") != null ? itemMap.get("productId").toString() : "";
                                String name = itemMap.get("name") != null ? itemMap.get("name").toString() : "";
                                String price = itemMap.get("price") != null ? itemMap.get("price").toString() : "0đ";
                                Long qty = itemMap.get("quantity") instanceof Long ? (Long) itemMap.get("quantity") : 1;
                                String imgUrl = itemMap.get("imageUrl") != null ? itemMap.get("imageUrl").toString() : "";
                                String size = itemMap.get("size") != null ? itemMap.get("size").toString() : "";
                                String color = itemMap.get("color") != null ? itemMap.get("color").toString() : "";
                                Boolean isRated = itemMap.get("isRated") instanceof Boolean ? (Boolean) itemMap.get("isRated") : false;

                                try {
                                    long priceValue = Long.parseLong(price.replaceAll("[^0-9]", ""));
                                    subtotal += priceValue * qty.intValue();
                                } catch (Exception e) {
                                    // Ignore parsing errors
                                }

                                CartItem cItem = new CartItem(productId, name, price, qty.intValue(), imgUrl, size, color, "");
                                cItem.setRated(isRated);
                                items.add(cItem);
                            }
                        }
                    }

                    tvSubtotal.setText(String.format("%,dđ", subtotal).replace(",", "."));
                    tvShippingFee.setText(shippingFee != null ? String.format("%,dđ", shippingFee).replace(",", ".") : "0đ");
                    tvDiscount.setText(discount != null && discount > 0 ? "-" + String.format("%,dđ", discount).replace(",", ".") : "0đ");
                    tvTotal.setText(total != null ? String.format("%,dđ", total).replace(",", ".") : "0đ");

                    adapter.setItems(items, status);
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    finish();
                });
    }

    private void showRatingDialog(String orderId, CartItem item, int position) {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_order_rating, null);
        builder.setView(dialogView);

        android.widget.RatingBar ratingBar = dialogView.findViewById(R.id.dialogRatingBar);
        com.google.android.material.textfield.TextInputEditText etComment = dialogView.findViewById(R.id.etComment);
        com.google.android.material.button.MaterialButton btnSubmit = dialogView.findViewById(R.id.btnSubmitRating);

        android.app.AlertDialog dialog = builder.create();

        btnSubmit.setOnClickListener(v -> {
            float rating = ratingBar.getRating();
            String comment = etComment.getText() == null ? "" : etComment.getText().toString().trim();

            if (rating == 0) {
                Toast.makeText(OrderDetailActivity.this, "Vui lòng chọn số sao đánh giá", Toast.LENGTH_SHORT).show();
                return;
            }

            if (item.getProductId().isEmpty()) {
                Toast.makeText(OrderDetailActivity.this, "Lỗi: Không tìm thấy mã sản phẩm", Toast.LENGTH_SHORT).show();
                return;
            }

            Map<String, Object> review = new HashMap<>();
            review.put("productId", item.getProductId());
            review.put("rating", rating);
            review.put("comment", comment);
            
            com.google.firebase.auth.FirebaseUser user = com.google.firebase.auth.FirebaseAuth.getInstance().getCurrentUser();
            review.put("userId", user != null ? user.getUid() : "guest");
            review.put("userName", user != null && user.getDisplayName() != null && !user.getDisplayName().isEmpty() ? user.getDisplayName() : "Khách hàng");
            review.put("createdAt", Timestamp.now());
            
            if (!item.getSize().isEmpty() || !item.getColor().isEmpty()) {
                String variantStr = "";
                if (!item.getSize().isEmpty()) variantStr += "Size: " + item.getSize() + " ";
                if (!item.getColor().isEmpty()) variantStr += "Màu: " + item.getColor();
                review.put("variant", variantStr.trim());
            }

            FirebaseFirestore.getInstance().collection("reviews")
                    .add(review)
                    .addOnSuccessListener(docRef -> {
                        updateItemRatedStatus(orderId, position, dialog);
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(OrderDetailActivity.this, "Lỗi lưu đánh giá: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
        });

        dialog.show();
    }

    private void updateItemRatedStatus(String orderId, int position, android.app.AlertDialog dialog) {
        FirebaseFirestore.getInstance().collection("orders")
                .whereEqualTo("orderId", orderId)
                .get()
                .addOnSuccessListener(snapshot -> {
                    if (!snapshot.isEmpty()) {
                        var doc = snapshot.getDocuments().get(0);
                        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) doc.get("items");
                        if (itemsData != null && itemsData.size() > position) {
                            itemsData.get(position).put("isRated", true);
                            doc.getReference().update("items", itemsData)
                                    .addOnSuccessListener(aVoid -> {
                                        Toast.makeText(OrderDetailActivity.this, "Cảm ơn bạn đã đánh giá sản phẩm!", Toast.LENGTH_SHORT).show();
                                        if (dialog != null) dialog.dismiss();
                                        loadOrderDetails(); // Reload
                                    });
                        }
                    }
                });
    }
}
