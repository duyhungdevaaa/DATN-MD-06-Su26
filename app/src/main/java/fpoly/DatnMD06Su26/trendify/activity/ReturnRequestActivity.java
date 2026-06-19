package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.MaterialAutoCompleteTextView;
import com.google.android.material.textfield.TextInputEditText;

public class ReturnRequestActivity extends AppCompatActivity {

    private ImageView ivBack;
    private MaterialAutoCompleteTextView actOrder;
    private MaterialAutoCompleteTextView actReturnReason;
    private TextInputEditText etDescription;
    private RadioGroup rgProcessType;
    private RadioButton rbExchangeProduct;
    private MaterialButton btnSubmitReturn;

    private final String[] sampleOrders = {
            "#TRF-2026-001234 - 02/06/2026",
            "#TRF-2026-001128 - 28/05/2026",
            "#TRF-2026-000986 - 20/05/2026"
    };

    private final String[] returnReasons = {
            "Sai kích thước",
            "Sai màu sắc",
            "Sản phẩm lỗi",
            "Không giống mô tả",
            "Giao nhầm sản phẩm",
            "Khác"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_return_request);

        initViews();
        setupToolbar();
        setupDropdowns();
        setupDefaultSelection();
        setupSubmitAction();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        actOrder = findViewById(R.id.actOrder);
        actReturnReason = findViewById(R.id.actReturnReason);
        etDescription = findViewById(R.id.etDescription);
        rgProcessType = findViewById(R.id.rgProcessType);
        rbExchangeProduct = findViewById(R.id.rbExchangeProduct);
        btnSubmitReturn = findViewById(R.id.btnSubmitReturn);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void setupDropdowns() {
        ArrayAdapter<String> orderAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, sampleOrders);
        ArrayAdapter<String> reasonAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, returnReasons);

        actOrder.setAdapter(orderAdapter);
        actReturnReason.setAdapter(reasonAdapter);
        actOrder.setText(sampleOrders[0], false);
        actReturnReason.setText(returnReasons[0], false);
    }

    private void setupDefaultSelection() {
        rbExchangeProduct.setChecked(true);
        rgProcessType.check(R.id.rbExchangeProduct);
    }

    private void setupSubmitAction() {
        btnSubmitReturn.setOnClickListener(v -> {
            String reason = actReturnReason.getText() == null ? "" : actReturnReason.getText().toString();
            String description = etDescription.getText() == null ? "" : etDescription.getText().toString().trim();
            String message = description.isEmpty()
                    ? "Đã ghi nhận yêu cầu đổi trả: " + reason
                    : "Đã gửi yêu cầu đổi trả của bạn";
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        });
    }
}
