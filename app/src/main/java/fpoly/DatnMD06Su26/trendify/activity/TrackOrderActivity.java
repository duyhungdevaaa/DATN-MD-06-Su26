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
import android.view.View;

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
                    if (status == null) status = "Chờ xác nhận";
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

                    int currentStep = 1;
                    if (status.equalsIgnoreCase("Đang xử lý") || status.equalsIgnoreCase("Đang chuẩn bị hàng")) {
                        currentStep = 2;
                    } else if (status.equalsIgnoreCase("Đang giao hàng") || status.equalsIgnoreCase("Đang vận chuyển")) {
                        currentStep = 3;
                    } else if (status.equalsIgnoreCase("Đã giao") || status.equalsIgnoreCase("Giao hàng thành công")) {
                        currentStep = 4;
                    } else if (status.equalsIgnoreCase("Đã hủy") || status.equalsIgnoreCase("Hoàn tất đối soát")) {
                        currentStep = 5;
                    }

                    // Define UI elements
                    ImageView[] icons = {
                        findViewById(R.id.ivStep1), findViewById(R.id.ivStep2), 
                        findViewById(R.id.ivStep3), findViewById(R.id.ivStep4), 
                        findViewById(R.id.ivStep5)
                    };
                    TextView[] titles = {
                        findViewById(R.id.tvStep1Title), findViewById(R.id.tvStep2Title),
                        findViewById(R.id.tvStep3Title), findViewById(R.id.tvStep4Title),
                        findViewById(R.id.tvStep5Title)
                    };
                    TextView[] times = {
                        tvDaDatHangTime, tvDangXuLyTime, tvDaGuiHangTime, tvDangGiaoHangTime, tvDaGiaoTime
                    };
                    View[] lines = {
                        findViewById(R.id.line1), findViewById(R.id.line2), 
                        findViewById(R.id.line3), findViewById(R.id.line4)
                    };

                    // Handle Cancellation dynamically
                    if (currentStep == 5 && status.equalsIgnoreCase("Đã hủy")) {
                        if (titles[4] != null) titles[4].setText("Đã hủy đơn hàng");
                    }

                    // Apply UI logic
                    for (int i = 0; i < 5; i++) {
                        boolean isActive = i < currentStep;
                        if (icons[i] != null) {
                            icons[i].setImageResource(isActive ? R.drawable.bg_circle_black : R.drawable.bg_circle_light_grey);
                        }
                        if (titles[i] != null) {
                            titles[i].setTextColor(android.graphics.Color.parseColor(isActive ? "#000000" : "#BDBDBD"));
                        }
                        if (times[i] != null) {
                            times[i].setTextColor(android.graphics.Color.parseColor(isActive ? "#000000" : "#BDBDBD"));
                            if (isActive && i > 0 && i < currentStep - 1) {
                                times[i].setText("Hoàn tất");
                            } else if (isActive && i == currentStep - 1 && i > 0) {
                                times[i].setText("Đang tiến hành");
                            }
                        }
                        if (i < 4 && lines[i] != null) {
                            lines[i].setBackgroundColor(android.graphics.Color.parseColor(isActive ? "#000000" : "#E0E0E0"));
                        }
                    }
                }
            });
    }
}
