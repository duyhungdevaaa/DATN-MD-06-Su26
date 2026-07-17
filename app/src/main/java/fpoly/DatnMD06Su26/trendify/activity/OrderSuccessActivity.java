package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.MainActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class OrderSuccessActivity extends AppCompatActivity {

    private ImageView ivBack;
    private ImageView ivClose;
    private TextView tvOrderId;
    private Button btnContinueShopping;
    private Button btnTrackOrder;
    private TextView tvContactConcierge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_success);

        ivClose = findViewById(R.id.ivClose);
        tvOrderId = findViewById(R.id.tvOrderId);
        btnContinueShopping = findViewById(R.id.btnContinueShopping);
        btnTrackOrder = findViewById(R.id.btnTrackOrder);
        tvContactConcierge = findViewById(R.id.tvContactConcierge);

        // Close button
        ivClose.setOnClickListener(v -> finish());

        // Show order ID from the checkout screen
        String orderId = getIntent().getStringExtra("order_id");
        if (orderId != null) {
            tvOrderId.setText(orderId);
        }

        btnContinueShopping.setOnClickListener(v -> {
            Intent intent = new Intent(OrderSuccessActivity.this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        btnTrackOrder.setOnClickListener(v -> {
            Intent intent = new Intent(OrderSuccessActivity.this, TrackOrderActivity.class);
            intent.putExtra("order_id", tvOrderId.getText().toString());
            startActivity(intent);
        });

        tvContactConcierge.setOnClickListener(v ->
                Toast.makeText(this, "Liên hệ quản gia sẽ được thêm sau.", Toast.LENGTH_SHORT).show());
    }
}
