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
import androidx.appcompat.app.AppCompatActivity;

public class OrderSuccessActivity extends AppCompatActivity {

    private ImageView ivBack;
    private ImageView ivClose;
    private TextView tvOrderId;
    private Button btnContinueShopping;
    private Button btnTrackOrder;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_success);

        ivClose = findViewById(R.id.ivClose);
        tvOrderId = findViewById(R.id.tvOrderId);
        btnContinueShopping = findViewById(R.id.btnContinueShopping);
        btnTrackOrder = findViewById(R.id.btnTrackOrder);


        // Close button
        ivClose.setOnClickListener(v -> finish());

        // Show order ID from the checkout screen
        String orderId = getIntent().getStringExtra("order_id");
        if (orderId != null) {
            tvOrderId.setText(orderId);
        }

        // Dynamic title based on payment method (COD vs online transfer)
        TextView tvSuccessTitle = findViewById(R.id.tvSuccessTitle);
        TextView tvSuccessDescription = findViewById(R.id.tvSuccessDescription);
        String paymentMethod = getIntent().getStringExtra("payment_method");
        if (paymentMethod != null && (paymentMethod.equalsIgnoreCase("COD") || paymentMethod.toLowerCase().contains("tiền mặt"))) {
            if (tvSuccessTitle != null) {
                tvSuccessTitle.setText("ĐẶT HÀNG\nTHÀNH CÔNG");
            }
            if (tvSuccessDescription != null) {
                tvSuccessDescription.setText("Cảm ơn bạn đã mua sắm tại Trendify. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.");
            }
        } else {
            if (tvSuccessTitle != null) {
                tvSuccessTitle.setText("THANH TOÁN\nTHÀNH CÔNG");
            }
            if (tvSuccessDescription != null) {
                tvSuccessDescription.setText("Sự lựa chọn của bạn thể hiện gu thẩm mỹ hoàn hảo. Chúng tôi đang chuẩn bị các món đồ để gửi tới bạn sớm nhất.");
            }
        }

        // Dynamic Delivery Estimate (Today + 3 days)
        TextView tvDeliveryEstimate = findViewById(R.id.tvDeliveryEstimate);
        if (tvDeliveryEstimate != null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.add(java.util.Calendar.DAY_OF_YEAR, 3);
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd 'Tháng' MM, yyyy", new java.util.Locale("vi", "VN"));
            String dateStr = sdf.format(cal.getTime());
            tvDeliveryEstimate.setText(dateStr);
        }

        // Parse and display real delivery address
        TextView tvRecipientName = findViewById(R.id.tvRecipientName);
        TextView tvAddressDetail = findViewById(R.id.tvAddressDetail);
        TextView tvAddressCity = findViewById(R.id.tvAddressCity);

        String shippingAddress = getIntent().getStringExtra("shipping_address");
        if (shippingAddress != null && shippingAddress.contains("|||")) {
            String[] parts = shippingAddress.split("\\|\\|\\|");
            if (parts.length >= 4) {
                String fullAddress = parts[3];
                if (fullAddress.contains(" - ")) {
                    int dashIndex = fullAddress.indexOf(" - ");
                    String recipient = fullAddress.substring(0, dashIndex).trim();
                    String rest = fullAddress.substring(dashIndex + 3).trim();
                    
                    if (tvRecipientName != null) {
                        tvRecipientName.setText(recipient);
                    }
                    
                    if (rest.contains(", ")) {
                        int commaIndex = rest.indexOf(", ");
                        String phone = rest.substring(0, commaIndex).trim();
                        String addressParts = rest.substring(commaIndex + 2).trim();
                        
                        if (tvAddressDetail != null) {
                            tvAddressDetail.setText(addressParts);
                        }
                        if (tvAddressCity != null) {
                            tvAddressCity.setText("SĐT: " + phone);
                        }
                    } else {
                        if (tvAddressDetail != null) {
                            tvAddressDetail.setText(rest);
                        }
                        if (tvAddressCity != null) {
                            tvAddressCity.setVisibility(android.view.View.GONE);
                        }
                    }
                } else {
                    if (tvRecipientName != null) {
                        tvRecipientName.setText("Người nhận");
                    }
                    if (tvAddressDetail != null) {
                        tvAddressDetail.setText(fullAddress);
                    }
                    if (tvAddressCity != null) {
                        tvAddressCity.setVisibility(android.view.View.GONE);
                    }
                }
            }
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



        TextView btnCopyOrderId = findViewById(R.id.btnCopyOrderId);
        if (btnCopyOrderId != null) {
            btnCopyOrderId.setOnClickListener(v -> {
                android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(android.content.Context.CLIPBOARD_SERVICE);
                if (clipboard != null) {
                    android.content.ClipData clip = android.content.ClipData.newPlainText("Mã đơn hàng", tvOrderId.getText().toString());
                    clipboard.setPrimaryClip(clip);
                    Toast.makeText(this, "Đã sao chép mã đơn hàng", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
}
