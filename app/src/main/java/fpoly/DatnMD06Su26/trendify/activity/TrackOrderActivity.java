package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class TrackOrderActivity extends AppCompatActivity {

    private ImageView ivBack;
    private TextView tvOrderId;
    private TextView tvEstimatedDelivery;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_track_order);

        ivBack = findViewById(R.id.ivBack);
        tvOrderId = findViewById(R.id.tvOrderId);
        tvEstimatedDelivery = findViewById(R.id.tvEstimatedDelivery);

        // Setup back button
        ivBack.setOnClickListener(v -> finish());

        // Get order ID from intent if passed
        String orderId = getIntent().getStringExtra("order_id");
        if (orderId != null) {
            tvOrderId.setText("MÃ ĐƠN HÀNG: " + orderId);
        }
    }
}
