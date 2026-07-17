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

public class PrivacyPolicyActivity extends AppCompatActivity {

    private ImageView ivBack;
    private TextView tvUpdatedDate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_privacy_policy);

        initViews();
        setupToolbar();
        bindPolicyInfo();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        tvUpdatedDate = findViewById(R.id.tvUpdatedDate);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void bindPolicyInfo() {
        tvUpdatedDate.setText("Cập nhật lần cuối: 05/06/2026");
    }
}
