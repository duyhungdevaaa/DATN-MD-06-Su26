package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.bumptech.glide.Glide;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class OrderDetailActivity extends AppCompatActivity {

    private LinearLayout llOrderItems;
    private TextView tvOrderId;
    private TextView tvOrderStatus;
    private TextView tvOrderDate;
    private TextView tvShippingAddress;
    private TextView tvPaymentMethod;
    private TextView tvSubtotal;
    private TextView tvShippingFee;
    private TextView tvDiscount;
    private TextView tvTotal;
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
        progressBar = findViewById(R.id.progressBar);
        llOrderItems = findViewById(R.id.llOrderItems);

        ivBack.setOnClickListener(v -> finish());

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
                    String paymentMethod = doc.getString("paymentMethod");
                    Long total = doc.getLong("total");
                    Long shippingFee = doc.getLong("shippingFee");
                    Long discount = doc.getLong("discountAmount");
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

                    // Set status badge color based on status
                    if (status != null) {
                        if (status.equals("Đã giao")) {
                            tvOrderStatus.setTextColor(0xFF4CAF50);
                        } else if (status.equals("Đang vận chuyển")) {
                            tvOrderStatus.setTextColor(0xFFFF9800);
                        } else {
                            tvOrderStatus.setTextColor(0xFFFF9800);
                        }
                    }

                    // Calculate price summary
                    List<CartItem> items = new ArrayList<>();
                    long subtotal = 0;
                    if (itemsData != null && !itemsData.isEmpty()) {
                        android.util.Log.d("OrderDetail", "Loading " + itemsData.size() + " items from Firestore");
                        for (var itemData : itemsData) {
                            if (itemData instanceof java.util.Map) {
                                java.util.Map<?, ?> itemMap = (java.util.Map<?, ?>) itemData;
                                String name = itemMap.get("name") != null ? itemMap.get("name").toString() : "";
                                String price = itemMap.get("price") != null ? itemMap.get("price").toString() : "0đ";
                                Long qty = itemMap.get("quantity") instanceof Long ? (Long) itemMap.get("quantity") : 1;
                                String imgUrl = itemMap.get("imageUrl") != null ? itemMap.get("imageUrl").toString() : "";
                                String size = itemMap.get("size") != null ? itemMap.get("size").toString() : "";
                                String color = itemMap.get("color") != null ? itemMap.get("color").toString() : "";

                                android.util.Log.d("OrderDetail", "Item: " + name + ", Qty: " + qty + ", Price: " + price);

                                try {
                                    long priceValue = Long.parseLong(price.replaceAll("[^0-9]", ""));
                                    subtotal += priceValue * qty.intValue();
                                } catch (Exception e) {
                                    // Ignore parsing errors
                                }

                                items.add(new CartItem("", name, price, qty.intValue(), imgUrl, size, color, ""));
                            }
                        }
                    } else {
                        android.util.Log.d("OrderDetail", "No items data found in Firestore");
                    }

                    android.util.Log.d("OrderDetail", "Total items loaded: " + items.size());
                    tvSubtotal.setText(String.format("%,dđ", subtotal).replace(",", "."));
                    tvShippingFee.setText(shippingFee != null ? String.format("%,dđ", shippingFee).replace(",", ".") : "0đ");
                    tvDiscount.setText(discount != null && discount > 0 ? "-" + String.format("%,dđ", discount).replace(",", ".") : "0đ");
                    tvTotal.setText(total != null ? String.format("%,dđ", total).replace(",", ".") : "0đ");

                    // Add items to LinearLayout
                    llOrderItems.removeAllViews();
                    LayoutInflater inflater = LayoutInflater.from(this);
                    for (CartItem item : items) {
                        View itemView = inflater.inflate(R.layout.item_order_detail_product, llOrderItems, false);
                        TextView tvName = itemView.findViewById(R.id.tvProductName);
                        TextView tvPrice = itemView.findViewById(R.id.tvProductPrice);
                        TextView tvQuantity = itemView.findViewById(R.id.tvQuantity);
                        TextView tvVariant = itemView.findViewById(R.id.tvVariant);
                        ImageView ivImage = itemView.findViewById(R.id.ivProductImage);

                        tvName.setText(item.getName());
                        tvPrice.setText(item.getPrice());
                        tvQuantity.setText("x" + item.getQuantity());

                        if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                            Glide.with(this)
                                    .load(item.getImageUrl())
                                    .centerCrop()
                                    .into(ivImage);
                        } else {
                            ivImage.setImageResource(R.drawable.ic_shopping_bag);
                        }

                        StringBuilder variantInfo = new StringBuilder();
                        if (item.getSize() != null && !item.getSize().isEmpty()) {
                            variantInfo.append("Size: ").append(item.getSize());
                        }
                        if (item.getColor() != null && !item.getColor().isEmpty()) {
                            if (variantInfo.length() > 0) {
                                variantInfo.append(" | ");
                            }
                            variantInfo.append("Màu: ").append(item.getColor());
                        }

                        if (variantInfo.length() > 0) {
                            tvVariant.setText(variantInfo.toString());
                            tvVariant.setVisibility(View.VISIBLE);
                        } else {
                            tvVariant.setVisibility(View.GONE);
                        }

                        llOrderItems.addView(itemView);
                    }
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    finish();
                });
    }
}
