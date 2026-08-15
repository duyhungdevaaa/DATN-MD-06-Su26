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
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class CartActivity extends AppCompatActivity {

    private CartAdapter adapter;
    private TextView tvTotal;
    private View layoutEmpty;
    private ProgressBar progressBar;
    private CartManager cartManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_cart);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        cartManager = new CartManager();

        RecyclerView rvCartItems = findViewById(R.id.rvCartItems);
        tvTotal     = findViewById(R.id.tvTotal);
        layoutEmpty = findViewById(R.id.layoutEmpty);
        progressBar = findViewById(R.id.progressBar);

        adapter = new CartAdapter(cartManager);
        adapter.setSelectionListener(() -> updateTotal(adapter.getItems()));
        rvCartItems.setLayoutManager(new LinearLayoutManager(this));
        rvCartItems.setAdapter(adapter);

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());

        androidx.compose.ui.platform.ComposeView composeBottomNav = findViewById(R.id.composeBottomNav);
        if (composeBottomNav != null) {
            TrendifyNavHelper.bind(composeBottomNav, 0, this);
        }

        View btnShopNow = findViewById(R.id.btnShopNow);
        if (btnShopNow != null) {
            btnShopNow.setOnClickListener(v -> {
                Intent intent = new Intent(CartActivity.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
                finish();
            });
        }

        findViewById(R.id.btnCheckout).setOnClickListener(v -> {
            if (adapter.getItemCount() == 0) {
                Toast.makeText(this, "Giỏ hàng đang trống", Toast.LENGTH_SHORT).show();
                return;
            }
            java.util.ArrayList<String> selectedCartItemIds = new java.util.ArrayList<>();
            for (CartItem item : adapter.getItems()) {
                if (item.isSelected()) {
                    selectedCartItemIds.add(item.getCartItemId());
                }
            }
            if (selectedCartItemIds.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn ít nhất 1 sản phẩm", Toast.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, ShippingAddressActivity.class);
            intent.putStringArrayListExtra("SELECTED_CART_ITEM_IDS", selectedCartItemIds);
            startActivity(intent);
        });

        loadCart();
    }

    private void loadCart() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        cartManager.loadCart(new CartManager.CartLoadCallback() {
            @Override
            public void onLoaded(List<CartItem> items) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                adapter.setItems(items);
                updateTotal(items);
                if (layoutEmpty != null)
                    layoutEmpty.setVisibility(items.isEmpty() ? View.VISIBLE : View.GONE);
            }
            @Override
            public void onFailure(String error) {
                if (progressBar != null) progressBar.setVisibility(View.GONE);
                Toast.makeText(CartActivity.this, "Lỗi tải giỏ hàng", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateTotal(List<CartItem> items) {
        long total = 0;
        for (CartItem item : items) {
            if (item.isSelected()) {
                total += item.getPriceAsLong() * item.getQuantity();
            }
        }
        if (tvTotal != null) {
            tvTotal.setText(String.format("%,dđ", total).replace(",", "."));
        }
    }
}