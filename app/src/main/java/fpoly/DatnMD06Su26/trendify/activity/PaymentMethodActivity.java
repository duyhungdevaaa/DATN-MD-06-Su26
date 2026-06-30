package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class PaymentMethodActivity extends AppCompatActivity {

    private View cardBankTransfer, cardCod;
    private View selectedCard = null;
    private String shippingAddress;
    private String paymentMethod = "Chuyển khoản ngân hàng";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment_method);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());

        cardBankTransfer = findViewById(R.id.layoutBankTransfer);
        cardCod    = findViewById(R.id.layoutCod);

        // Mặc định chọn chuyển khoản ngân hàng
        selectCard(cardBankTransfer);

        cardBankTransfer.setOnClickListener(v -> selectCard(cardBankTransfer));
        cardCod.setOnClickListener(v -> selectCard(cardCod));

        shippingAddress = getIntent().getStringExtra("shipping_address");

        // Tiếp Tục → màn 19 Xác nhận đơn
        findViewById(R.id.btnConfirm).setOnClickListener(v -> {
            Intent intent = new Intent(this, OrderConfirmActivity.class);
            if (shippingAddress != null) {
                intent.putExtra("shipping_address", shippingAddress);
            }
            intent.putExtra("payment_method", paymentMethod);
            startActivity(intent);
        });
    }

    private void selectCard(View card) {
        // Hide all checkmarks
        findViewById(R.id.checkBankTransfer).setVisibility(View.INVISIBLE);
        findViewById(R.id.checkCod).setVisibility(View.INVISIBLE);
        
        // Show checkmark for selected card
        if (card == cardBankTransfer) {
            findViewById(R.id.checkBankTransfer).setVisibility(View.VISIBLE);
            paymentMethod = "Chuyển khoản ngân hàng";
        } else if (card == cardCod) {
            findViewById(R.id.checkCod).setVisibility(View.VISIBLE);
            paymentMethod = "COD";
        }
        selectedCard = card;
    }
}