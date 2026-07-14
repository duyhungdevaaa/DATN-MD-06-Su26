package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.helper.CartManager;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.bumptech.glide.Glide;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class PayOSPaymentActivity extends AppCompatActivity {

    private static final String TAG = "PayOSPayment";
    private static final int POLL_INTERVAL_MS = 5000; // Check every 5 seconds

    private ImageView ivQrCode;
    private ImageView ivBack;
    private TextView tvBankName, tvAccountName, tvAccountNumber, tvAmount, tvDescription, tvWarningNoteBottom;
    private View btnCopyAccountNumber, btnCopyAmount, btnCopyDescription;
    private Button btnConfirmPayment;
    private View btnCancel;
    private View pollingStatusLayout;

    private String qrCode;
    private long orderCode;
    private String orderId;
    private String checkoutUrl;
    private long amount;
    private String accountNumber;
    private String accountName;
    private String description;
    private String bin;

    private CartManager cartManager;
    private final Handler pollHandler = new Handler(Looper.getMainLooper());
    private boolean isCheckingStatus = false;
    private boolean isPaymentCompleted = false;

    private final Runnable pollRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isCheckingStatus && !isPaymentCompleted) {
                checkPaymentStatus(false);
            }
            pollHandler.postDelayed(this, POLL_INTERVAL_MS);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payos_payment);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        cartManager = new CartManager();

        // Extract Intent Data
        Intent intent = getIntent();
        qrCode = intent.getStringExtra("qrCode");
        orderCode = intent.getLongExtra("orderCode", 0);
        orderId = intent.getStringExtra("orderId");
        checkoutUrl = intent.getStringExtra("checkoutUrl");
        amount = intent.getLongExtra("amount", 0);
        accountNumber = intent.getStringExtra("accountNumber");
        accountName = intent.getStringExtra("accountName");
        description = intent.getStringExtra("description");
        bin = intent.getStringExtra("bin");

        Log.d(TAG, "onCreate: orderCode=" + orderCode + ", amount=" + amount + ", bin=" + bin);

        // Bind Views
        ivQrCode = findViewById(R.id.ivQrCode);
        ivBack = findViewById(R.id.ivBack);
        tvBankName = findViewById(R.id.tvBankName);
        tvAccountName = findViewById(R.id.tvAccountName);
        tvAccountNumber = findViewById(R.id.tvAccountNumber);
        tvAmount = findViewById(R.id.tvAmount);
        tvDescription = findViewById(R.id.tvDescription);
        tvWarningNoteBottom = findViewById(R.id.tvWarningNoteBottom);
        btnCopyAccountNumber = findViewById(R.id.btnCopyAccountNumber);
        btnCopyAmount = findViewById(R.id.btnCopyAmount);
        btnCopyDescription = findViewById(R.id.btnCopyDescription);
        btnConfirmPayment = findViewById(R.id.btnConfirmPayment);
        btnCancel = findViewById(R.id.btnCancel);
        pollingStatusLayout = findViewById(R.id.pollingStatusLayout);

        // Set UI Data
        displayPaymentDetails();

        // Bind Actions
        ivBack.setOnClickListener(v -> finishPayment());
        btnCancel.setOnClickListener(v -> finishPayment());
        btnConfirmPayment.setOnClickListener(v -> checkPaymentStatus(true));

        setupCopyListeners();
    }

    private void displayPaymentDetails() {
        // Render QR Code with alternative API because VietQR might be down
        try {
            String qrImageUrl = "";
            if (qrCode != null && !qrCode.isEmpty()) {
                qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" + Uri.encode(qrCode);
            } else {
                String bankId = bin != null ? bin : "970422";
                String encodedAccountName = Uri.encode(accountName != null ? accountName : "");
                String encodedDescription = Uri.encode(description != null ? description : "");
                qrImageUrl = "https://img.vietqr.io/image/" + bankId + "-" + accountNumber + "-qr_only.png?amount=" + amount + "&addInfo=" + encodedDescription + "&accountName=" + encodedAccountName;
            }

            Log.d(TAG, "Loading QR Image: " + qrImageUrl);

            Glide.with(this)
                .load(qrImageUrl)
                .placeholder(android.R.drawable.progress_horizontal)
                .error(android.R.drawable.stat_notify_error)
                .into(ivQrCode);
        } catch (Exception e) {
            Log.e(TAG, "Error building QR image URL", e);
        }

        tvBankName.setText(getBankName(bin));
        tvAccountName.setText(accountName != null ? accountName : "");
        tvAccountNumber.setText(accountNumber != null ? accountNumber : "");
        tvAmount.setText(formatCurrency(amount));
        tvDescription.setText(description != null ? description : "");

        String rawWarning = "Lưu ý : Nhập chính xác số tiền " + formatCurrency(amount) + ", nội dung " + (description != null ? description : "") + " khi chuyển khoản";
        tvWarningNoteBottom.setText(rawWarning);
    }

    private void setupCopyListeners() {
        btnCopyAccountNumber.setOnClickListener(v -> copyToClipboard("Số tài khoản", accountNumber));
        btnCopyAmount.setOnClickListener(v -> copyToClipboard("Số tiền", String.valueOf(amount)));
        btnCopyDescription.setOnClickListener(v -> copyToClipboard("Nội dung chuyển khoản", description));
    }

    private void copyToClipboard(String label, String text) {
        if (text == null || text.isEmpty()) return;
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard != null) {
            ClipData clip = ClipData.newPlainText(label, text);
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Đã sao chép " + label.toLowerCase(), Toast.LENGTH_SHORT).show();
        }
    }

    private void checkPaymentStatus(boolean showToastOnFailure) {
        if (isCheckingStatus || isPaymentCompleted) return;

        isCheckingStatus = true;
        if (showToastOnFailure) {
            pollingStatusLayout.setVisibility(View.VISIBLE);
        }

        new Thread(() -> {
            try {
                // Fetch payment status from Node backend
                URL url = new URL("https://backendpayos.onrender.com/api/payment/" + orderCode);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(8000);
                connection.setReadTimeout(8000);

                int responseCode = connection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
                    StringBuilder responseBuilder = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        responseBuilder.append(line);
                    }
                    JSONObject responseJson = new JSONObject(responseBuilder.toString());
                    JSONObject dataJson = responseJson.optJSONObject("data");
                    String status = "";
                    if (dataJson != null) {
                        status = dataJson.optString("status");
                    }

                    final String paymentStatus = status;
                    runOnUiThread(() -> {
                        isCheckingStatus = false;
                        if ("PAID".equals(paymentStatus)) {
                            handlePaymentSuccess();
                        } else {
                            if (showToastOnFailure) {
                                Toast.makeText(PayOSPaymentActivity.this, "Hệ thống chưa ghi nhận thanh toán. Vui lòng thử lại sau.", Toast.LENGTH_LONG).show();
                            }
                        }
                    });
                } else {
                    runOnUiThread(() -> {
                        isCheckingStatus = false;
                        if (showToastOnFailure) {
                            Toast.makeText(PayOSPaymentActivity.this, "Lỗi kiểm tra trạng thái: HTTP " + responseCode, Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "checkPaymentStatus error", e);
                runOnUiThread(() -> {
                    isCheckingStatus = false;
                    if (showToastOnFailure) {
                        Toast.makeText(PayOSPaymentActivity.this, "Lỗi kết nối kiểm tra: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }).start();
    }

    private void handlePaymentSuccess() {
        isPaymentCompleted = true;
        pollHandler.removeCallbacks(pollRunnable);
        Toast.makeText(this, "Thanh toán thành công!", Toast.LENGTH_SHORT).show();

        // Clear cart and redirect
        cartManager.clearCart(new CartManager.CartCallback() {
            @Override
            public void onSuccess() {
                navigateToSuccess();
            }

            @Override
            public void onFailure(String error) {
                navigateToSuccess(); // Transition even if cart clear fails to prevent stuck user
            }
        });
    }

    private void navigateToSuccess() {
        Intent intent = new Intent(PayOSPaymentActivity.this, OrderSuccessActivity.class);
        intent.putExtra("order_id", orderId);
        startActivity(intent);
        finish();
    }

    private void finishPayment() {
        pollHandler.removeCallbacks(pollRunnable);
        Toast.makeText(this, "Đã đóng màn hình thanh toán.", Toast.LENGTH_SHORT).show();
        finish();
    }

    private String getBankName(String binCode) {
        if (binCode == null) return "Ngân hàng TMCP Quân đội (MB)";
        switch (binCode) {
            case "970422": return "Ngân hàng TMCP Quân đội (MB)";
            case "970415": return "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)";
            case "970436": return "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)";
            case "970418": return "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)";
            case "970405": return "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)";
            default: return "Ngân hàng đối tác (" + binCode + ")";
        }
    }

    private String formatCurrency(long value) {
        return String.format("%,dđ", value).replace(",", ".");
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Start status polling
        pollHandler.post(pollRunnable);
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Stop polling when activity goes off screen
        pollHandler.removeCallbacks(pollRunnable);
    }
}
