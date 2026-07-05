package fpoly.DatnMD06Su26.trendify.activity;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.adapter.VoucherAdapter;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;
import fpoly.DatnMD06Su26.trendify.model.Voucher;

public class VoucherListActivity extends AppCompatActivity {

    private VoucherAdapter voucherAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_voucher_list);

        ImageView ivBack = findViewById(R.id.ivBack);
        if (ivBack != null) {
            ivBack.setOnClickListener(v -> finish());
        }

        RecyclerView rvVouchers = findViewById(R.id.rvVouchers);
        rvVouchers.setLayoutManager(new LinearLayoutManager(this));
        
        voucherAdapter = new VoucherAdapter();
        rvVouchers.setAdapter(voucherAdapter);

        loadVouchers();
    }

    private void loadVouchers() {
        FirestoreHelper.loadVouchers(new FirestoreHelper.VouchersCallback() {
            @Override
            public void onLoaded(List<Voucher> vouchers) {
                if (vouchers.isEmpty()) {
                    Toast.makeText(VoucherListActivity.this, "Hiện chưa có voucher nào", Toast.LENGTH_SHORT).show();
                }
                voucherAdapter.setItems(vouchers);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(VoucherListActivity.this, "Không thể tải voucher: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }
}
