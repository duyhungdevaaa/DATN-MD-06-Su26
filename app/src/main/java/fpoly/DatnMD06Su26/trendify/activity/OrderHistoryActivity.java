package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.view.View;
import java.util.Locale;
import java.util.Map;
import android.widget.ProgressBar;
import android.widget.Toast;
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

public class OrderHistoryActivity extends AppCompatActivity {

    private OrderHistoryAdapter adapter;
    private ProgressBar progressBar;
    private String statusFilter = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_history);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());

        progressBar = findViewById(R.id.progressBar);
        RecyclerView rv = findViewById(R.id.rvOrders);
        adapter = new OrderHistoryAdapter();
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(rv.getAdapter() == null ? adapter : rv.getAdapter());

        statusFilter = getIntent().getStringExtra("ORDER_STATUS_FILTER");
        android.widget.TextView tvTitle = findViewById(R.id.tvTitle);
        if (tvTitle != null && statusFilter != null) {
            if (statusFilter.equals("CHO_XAC_NHAN")) {
                tvTitle.setText("Đơn Chờ Xác Nhận");
            } else if (statusFilter.equals("CHO_LAY_HANG")) {
                tvTitle.setText("Đơn Chờ Lấy Hàng");
            } else if (statusFilter.equals("DANG_GIAO")) {
                tvTitle.setText("Đơn Đang Giao");
            } else if (statusFilter.equals("DANH_GIAO")) {
                tvTitle.setText("Đơn Chờ Đánh Giá");
            }
        }

        loadOrders();
    }

    private void loadOrders() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        String uid = SessionManager.getInstance().getUserId();

        FirebaseFirestore.getInstance()
                .collection("orders")
                .whereEqualTo("userId", uid)
                .get()
                .addOnSuccessListener(snapshot -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    List<com.google.firebase.firestore.DocumentSnapshot> documents = snapshot.getDocuments();
                    documents.sort((a, b) -> {
                        Timestamp ta = a.getTimestamp("createdAt");
                        Timestamp tb = b.getTimestamp("createdAt");
                        if (ta == null && tb == null) return 0;
                        if (ta == null) return 1;
                        if (tb == null) return -1;
                        return tb.compareTo(ta);
                    });
                    List<OrderItem> orders = new ArrayList<>();
                    for (var doc : documents) {
                        String orderId     = doc.getString("orderId");
                        String status      = doc.getString("status");
                        String date        = doc.getString("date");
                        if (date == null) {
                            Timestamp timestamp = doc.getTimestamp("createdAt");
                            if (timestamp != null) {
                                date = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(timestamp.toDate());
                            } else {
                                date = "";
                            }
                        }
                        Long total         = doc.getLong("total");
                        List<?> items = (List<?>) doc.get("items");
                        String productName = "Đơn hàng";
                        int totalQty = 0;
                        if (items != null && !items.isEmpty()) {
                            for (Object itemObj : items) {
                                if (itemObj instanceof Map) {
                                    Map<?, ?> itemMap = (Map<?, ?>) itemObj;
                                    Long qty = itemMap.get("quantity") instanceof Long ? (Long) itemMap.get("quantity") : 1;
                                    totalQty += qty.intValue();
                                }
                            }
                            
                            Object firstItemObj = items.get(0);
                            if (firstItemObj instanceof Map) {
                                Map<?, ?> firstItemMap = (Map<?, ?>) firstItemObj;
                                String firstName = firstItemMap.get("name") != null ? firstItemMap.get("name").toString() : "";
                                if (!firstName.isEmpty()) {
                                    if (items.size() > 1) {
                                        productName = firstName + " và " + (items.size() - 1) + " sản phẩm khác";
                                    } else {
                                        productName = firstName;
                                    }
                                }
                            }
                        }
                        orders.add(new OrderItem(
                                orderId, status, date, productName, totalQty > 0 ? totalQty : 1,
                                total != null ? String.format("%,dđ", total).replace(",", ".") : "0đ",
                                0));
                    }
                    List<OrderItem> filteredOrders = new ArrayList<>();
                    if (statusFilter != null) {
                        for (OrderItem order : orders) {
                            String st = order.getStatus();
                            if (st != null) {
                                if (statusFilter.equals("CHO_XAC_NHAN")) {
                                    if (st.contains("xử lý") || st.contains("thanh toán") || st.contains("Xác nhận") || st.contains("xác nhận") || st.contains("xu ly") || st.contains("thanh toan")) {
                                        filteredOrders.add(order);
                                    }
                                } else if (statusFilter.equals("CHO_LAY_HANG")) {
                                    if (st.contains("chuẩn bị") || st.contains("lấy hàng") || st.contains("chờ lấy") || st.contains("Chờ lấy") || st.contains("chuan bi") || st.contains("lay hang")) {
                                        filteredOrders.add(order);
                                    }
                                } else if (statusFilter.equals("DANG_GIAO")) {
                                    if (st.contains("vận chuyển") || st.contains("đang giao") || st.contains("Đang giao") || st.contains("van chuyen") || st.contains("dang giao")) {
                                        filteredOrders.add(order);
                                    }
                                } else if (statusFilter.equals("DANH_GIAO")) {
                                    if (st.contains("đã giao") || st.contains("Đã giao") || st.contains("thành công") || st.contains("Thành công") || st.contains("hoàn thành") || st.contains("Hoàn thành") || st.contains("da giao") || st.contains("thanh cong") || st.contains("hoan thanh")) {
                                        filteredOrders.add(order);
                                    }
                                }
                            }
                        }
                    } else {
                        filteredOrders.addAll(orders);
                    }
                    adapter.setOrderList(filteredOrders);
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    Toast.makeText(this, "Lỗi tải đơn hàng", Toast.LENGTH_SHORT).show();
                });
    }
}
