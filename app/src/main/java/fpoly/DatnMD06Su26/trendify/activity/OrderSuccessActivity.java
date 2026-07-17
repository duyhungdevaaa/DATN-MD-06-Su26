package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

public class OrderSuccessActivity extends AppCompatActivity {

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

        // Phím Back (cứng/gesture) → về Home, clear toàn bộ back stack
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                navigateHome();
            }
        });

        // Nút X → về Home, clear back stack
        ivClose.setOnClickListener(v -> navigateHome());

        // Show order ID from the checkout screen
        String orderId = getIntent().getStringExtra("order_id");
        if (orderId != null) {
            tvOrderId.setText(orderId);
        }

        // Nút "Tiếp tục mua sắm" → về Home, clear back stack
        btnContinueShopping.setOnClickListener(v -> navigateHome());

        btnTrackOrder.setOnClickListener(v -> {
            Intent intent = new Intent(OrderSuccessActivity.this, TrackOrderActivity.class);
            intent.putExtra("order_id", tvOrderId.getText().toString());
            startActivity(intent);
        });

        tvContactConcierge.setOnClickListener(v ->
                Toast.makeText(this, "Liên hệ quản gia sẽ được thêm sau.", Toast.LENGTH_SHORT).show());
    }

    /**
     * Về trang chủ và xóa toàn bộ back stack.
     * Cart → OrderConfirm → OrderSuccess đều bị xóa, người dùng không thể Back lại luồng đặt hàng.
     */
    private void navigateHome() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish();
    }
}
