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
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class SettingsActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), systemBars.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        ImageView ivBack = findViewById(R.id.ivBack);
        ivBack.setOnClickListener(v -> finish());

        View btnLogout = findViewById(R.id.btnLogout);
        if (btnLogout != null) {
            btnLogout.setOnClickListener(v -> {
                SessionManager.getInstance().logout();
                com.google.firebase.auth.FirebaseAuth.getInstance().signOut();
                android.content.Intent intent = new android.content.Intent(this, LoginActivity.class);
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            });
        }

        // Account & Security
        View btnAccountSecurity = findViewById(R.id.btnAccountSecurity);
        if (btnAccountSecurity != null) {
            btnAccountSecurity.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Tính năng Tài khoản & Bảo mật đang phát triển", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Addresses
        View btnAddresses = findViewById(R.id.btnAddresses);
        if (btnAddresses != null) {
            btnAddresses.setOnClickListener(v -> {
                startActivity(new android.content.Intent(this, AddressManagementActivity.class));
            });
        }

        // Linked Accounts
        View btnLinkedAccounts = findViewById(R.id.btnLinkedAccounts);
        if (btnLinkedAccounts != null) {
            btnLinkedAccounts.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Tính năng Liên kết tài khoản đang phát triển", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Chat Settings
        View btnChatSettings = findViewById(R.id.btnChatSettings);
        if (btnChatSettings != null) {
            btnChatSettings.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Tính năng Cài đặt Chat đang phát triển", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Notification Settings
        View btnNotificationSettings = findViewById(R.id.btnNotificationSettings);
        if (btnNotificationSettings != null) {
            btnNotificationSettings.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Tính năng Cài đặt Thông báo đang phát triển", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Language
        View btnLanguage = findViewById(R.id.btnLanguage);
        if (btnLanguage != null) {
            btnLanguage.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Hệ thống đang sử dụng Tiếng Việt", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Help Center
        View btnHelpCenter = findViewById(R.id.btnHelpCenter);
        if (btnHelpCenter != null) {
            btnHelpCenter.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Đang mở Trung tâm Trợ giúp...", android.widget.Toast.LENGTH_SHORT).show();
            });
        }

        // Privacy Policy
        View btnPrivacyPolicy = findViewById(R.id.btnPrivacyPolicy);
        if (btnPrivacyPolicy != null) {
            btnPrivacyPolicy.setOnClickListener(v -> {
                android.widget.Toast.makeText(this, "Đang tải Chính sách bảo mật...", android.widget.Toast.LENGTH_SHORT).show();
            });
        }
    }
}
