package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

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

        cardBankTransfer = findViewById(R.id.cardBankTransfer);
        cardCod    = findViewById(R.id.cardCod);

        // Mặc định chọn chuyển khoản ngân hàng
        selectCard(cardBankTransfer);

        cardBankTransfer.setOnClickListener(v -> selectCard(cardBankTransfer));
        cardCod.setOnClickListener(v -> selectCard(cardCod));

        shippingAddress = getIntent().getStringExtra("shipping_address");

        // Tiếp Tục → màn 19 Xác nhận đơn
        findViewById(R.id.btnContinue).setOnClickListener(v -> {
            Intent intent = new Intent(this, OrderConfirmActivity.class);
            if (shippingAddress != null) {
                intent.putExtra("shipping_address", shippingAddress);
            }
            intent.putExtra("payment_method", paymentMethod);
            startActivity(intent);
        });
    }

    private void selectCard(View card) {
        // Reset tất cả về border mờ
        setSelected(cardBankTransfer, false);
        setSelected(cardCod,    false);
        // Highlight card được chọn
        setSelected(card, true);
        selectedCard = card;
        if (card == cardBankTransfer) {
            paymentMethod = "Chuyển khoản ngân hàng";
        } else if (card == cardCod) {
            paymentMethod = "COD";
        }
    }

    private void setSelected(View card, boolean selected) {
        if (card == null) return;
        com.google.android.material.card.MaterialCardView cv =
                (com.google.android.material.card.MaterialCardView) card;
        cv.setStrokeWidth(selected ? 4 : 2);
        int color = selected
                ? getColor(R.color.trend_text)
                : getColor(R.color.trend_border);
        cv.setStrokeColor(color);
    }
}
