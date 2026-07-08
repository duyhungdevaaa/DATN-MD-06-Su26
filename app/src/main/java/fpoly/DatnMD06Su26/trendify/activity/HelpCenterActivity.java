package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.textfield.TextInputEditText;

public class HelpCenterActivity extends AppCompatActivity {

    private ImageView ivBack;
    private TextInputEditText etSupportSearch;
    private MaterialButton btnContactSupport;
    private MaterialCardView cardOrders;
    private MaterialCardView cardPayment;
    private MaterialCardView cardShipping;
    private MaterialCardView cardReturns;
    private MaterialCardView cardAccount;
    private MaterialCardView cardHotline;
    private MaterialCardView cardEmail;
    private MaterialCardView cardChat;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_help_center);

        initViews();
        setupToolbar();
        setupCategoryActions();
        setupContactActions();
        setupPrimaryAction();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        etSupportSearch = findViewById(R.id.etSupportSearch);
        btnContactSupport = findViewById(R.id.btnContactSupport);
        cardOrders = findViewById(R.id.cardOrders);
        cardPayment = findViewById(R.id.cardPayment);
        cardShipping = findViewById(R.id.cardShipping);
        cardReturns = findViewById(R.id.cardReturns);
        cardAccount = findViewById(R.id.cardAccount);
        cardHotline = findViewById(R.id.cardHotline);
        cardEmail = findViewById(R.id.cardEmail);
        cardChat = findViewById(R.id.cardChat);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void setupCategoryActions() {
        cardOrders.setOnClickListener(v -> showMessage("Hỗ trợ đơn hàng"));
        cardPayment.setOnClickListener(v -> showMessage("Hỗ trợ thanh toán"));
        cardShipping.setOnClickListener(v -> showMessage("Hỗ trợ vận chuyển"));
        cardReturns.setOnClickListener(v -> showMessage("Hỗ trợ đổi trả sản phẩm"));
        cardAccount.setOnClickListener(v -> showMessage("Hỗ trợ tài khoản"));
    }

    private void setupContactActions() {
        cardHotline.setOnClickListener(v -> showMessage("Hotline: 1900 1234"));
        cardEmail.setOnClickListener(v -> showMessage("Email: support@trendify.com"));
        cardChat.setOnClickListener(v -> showMessage("Chat trực tuyến 24/7"));
    }

    private void setupPrimaryAction() {
        btnContactSupport.setOnClickListener(v -> {
            String keyword = etSupportSearch.getText() == null ? "" : etSupportSearch.getText().toString().trim();
            if (keyword.isEmpty()) {
                showMessage("Trendify luôn sẵn sàng hỗ trợ bạn");
            } else {
                showMessage("Đang tìm hỗ trợ cho: " + keyword);
            }
        });
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
