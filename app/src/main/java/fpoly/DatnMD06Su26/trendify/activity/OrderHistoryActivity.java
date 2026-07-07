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
        rv.setAdapter(adapter);

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
                        List<?> items      = (List<?>) doc.get("items");
                        String productName = items != null && !items.isEmpty()
                                ? "Đơn hàng " + orderId : "Đơn hàng";
                        orders.add(new OrderItem(
                                orderId, status, date, productName, 1,
                                total != null ? String.format("%,dđ", total).replace(",", ".") : "0đ",
                                0));
                    }
                    adapter.setOrderList(orders);
                })
                .addOnFailureListener(e -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    Toast.makeText(this, "Lỗi tải đơn hàng", Toast.LENGTH_SHORT).show();
                });
    }
}
