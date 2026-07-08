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

    private View cardCredit, cardMomo, cardBankTransfer, cardCod;
    private View selectedCard = null;
    private String shippingAddress;
    private String paymentMethod = "Thẻ tín dụng";

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

        cardCredit = findViewById(R.id.cardCredit);
        cardMomo   = findViewById(R.id.cardMomo);
        cardBankTransfer = findViewById(R.id.cardBankTransfer);
        cardCod    = findViewById(R.id.cardCod);

        // Mặc định chọn thẻ tín dụng
        selectCard(cardCredit);

        cardCredit.setOnClickListener(v -> selectCard(cardCredit));
        cardMomo.setOnClickListener(v -> selectCard(cardMomo));
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
        setSelected(cardCredit, false);
        setSelected(cardMomo,   false);
        setSelected(cardBankTransfer, false);
        setSelected(cardCod,    false);
        // Highlight card được chọn
        setSelected(card, true);
        selectedCard = card;
        if (card == cardCredit) {
            paymentMethod = "Thẻ tín dụng";
        } else if (card == cardMomo) {
            paymentMethod = "Ví MoMo";
        } else if (card == cardBankTransfer) {
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