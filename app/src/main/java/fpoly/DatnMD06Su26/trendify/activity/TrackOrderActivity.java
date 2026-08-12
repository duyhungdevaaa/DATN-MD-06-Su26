package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import com.google.firebase.Timestamp;

public class TrackOrderActivity extends AppCompatActivity {

    private ImageView ivBack;
    private TextView tvOrderId;
    private TextView tvEstimatedDelivery;
    private TextView tvDaDatHangTime, tvDangXuLyTime, tvDaGuiHangTime, tvDangGiaoHangTime, tvDaGiaoTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_track_order);

        ivBack = findViewById(R.id.ivBack);
        tvOrderId = findViewById(R.id.tvOrderId);
        tvEstimatedDelivery = findViewById(R.id.tvEstimatedDelivery);
        tvDaDatHangTime = findViewById(R.id.tvDaDatHangTime);
        tvDangXuLyTime = findViewById(R.id.tvDangXuLyTime);
        tvDaGuiHangTime = findViewById(R.id.tvDaGuiHangTime);
        tvDangGiaoHangTime = findViewById(R.id.tvDangGiaoHangTime);
        tvDaGiaoTime = findViewById(R.id.tvDaGiaoTime);

        ivBack.setOnClickListener(v -> finish());

        String orderId = getIntent().getStringExtra("order_id");
        if (orderId != null) {
            tvOrderId.setText("MÃ ĐƠN HÀNG: " + orderId);
            loadOrderData(orderId);
        }
    }

    private void loadOrderData(String orderId) {
        FirebaseFirestore.getInstance().collection("orders").document(orderId)
            .get().addOnSuccessListener(doc -> {
                if (doc.exists()) {
                    String status = doc.getString("status");
                    Timestamp createdAt = doc.getTimestamp("createdAt");
                    if (createdAt != null) {
                        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM, hh:mm a", new Locale("vi", "VN"));
                        String dateStr = sdf.format(createdAt.toDate());
                        if (tvDaDatHangTime != null) tvDaDatHangTime.setText(dateStr);
                        
                        // Estimated delivery = +3 days
                        java.util.Calendar cal = java.util.Calendar.getInstance();
                        cal.setTime(createdAt.toDate());
                        cal.add(java.util.Calendar.DAY_OF_YEAR, 3);
                        SimpleDateFormat sdfEst = new SimpleDateFormat("dd 'Tháng' MM, yyyy", new Locale("vi", "VN"));
                        if (tvEstimatedDelivery != null) {
                            tvEstimatedDelivery.setText("DỰ KIẾN GIAO HÀNG: " + sdfEst.format(cal.getTime()));
                        }
                    }
                    
                    // Simple text update for status
                    if (status != null) {
                        if (status.equalsIgnoreCase("Đang xử lý") || status.equalsIgnoreCase("Đã xác nhận")) {
                            if (tvDangXuLyTime != null) tvDangXuLyTime.setText("Đang tiến hành");
                        } else if (status.equalsIgnoreCase("Đang giao hàng") || status.equalsIgnoreCase("Đã gửi hàng")) {
                            if (tvDangXuLyTime != null) tvDangXuLyTime.setText("Hoàn tất");
                            if (tvDaGuiHangTime != null) tvDaGuiHangTime.setText("Hoàn tất");
                            if (tvDangGiaoHangTime != null) tvDangGiaoHangTime.setText("Đang tiến hành");
                        } else if (status.equalsIgnoreCase("Đã giao") || status.equalsIgnoreCase("Thành công") || status.equalsIgnoreCase("Hoàn thành")) {
                            if (tvDangXuLyTime != null) tvDangXuLyTime.setText("Hoàn tất");
                            if (tvDaGuiHangTime != null) tvDaGuiHangTime.setText("Hoàn tất");
                            if (tvDangGiaoHangTime != null) tvDangGiaoHangTime.setText("Hoàn tất");
                            if (tvDaGiaoTime != null) tvDaGiaoTime.setText("Hoàn tất");
                        }
                    }
                }
            });
    }
}
