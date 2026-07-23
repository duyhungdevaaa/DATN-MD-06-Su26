package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.CartItem;
import fpoly.DatnMD06Su26.trendify.helper.CartManager;
import fpoly.DatnMD06Su26.trendify.adapter.CartAdapter;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
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

import java.util.ArrayList;
import java.util.List;

public class CartActivity extends AppCompatActivity implements CartAdapter.OnCartChangeListener {

    private CartAdapter adapter;
    private TextView tvTotal;
    private View layoutEmpty;
    private ProgressBar progressBar;
    private CartManager cartManager;
    private CheckBox cbSelectAll;
    private Button btnCheckout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_cart);

        View topBar = findViewById(R.id.topBar);
        if (topBar != null) {
            ViewCompat.setOnApplyWindowInsetsListener(topBar, (v, insets) -> {
                Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
                return insets;
            });
        }

        cartManager = new CartManager();

        RecyclerView rvCartItems = findViewById(R.id.rvCartItems);
        tvTotal     = findViewById(R.id.tvTotal);
        layoutEmpty = findViewById(R.id.layoutEmpty);
        progressBar = findViewById(R.id.progressBar);
        cbSelectAll = findViewById(R.id.cbSelectAll);
        btnCheckout = findViewById(R.id.btnCheckout);

        adapter = new CartAdapter(cartManager, this);
        adapter = new CartAdapter(cartManager);
        adapter.setOnSelectionChangedListener((selectedCount, totalPrice) -> {
            updateCheckoutButton(selectedCount, totalPrice);
        });
        rvCartItems.setLayoutManager(new LinearLayoutManager(this));
        rvCartItems.setAdapter(adapter);

        findViewById(R.id.ivCloseCart).setOnClickListener(v -> finish());

        cbSelectAll.setOnClickListener(v -> {
            boolean isChecked = cbSelectAll.isChecked();
            for (CartItem item : adapter.getItems()) {
                item.setSelected(isChecked);
            }
            adapter.notifyDataSetChanged();
            updateTotal(adapter.getItems());
        });

        btnCheckout.setOnClickListener(v -> {
            boolean hasSelection = false;
            for (CartItem item : adapter.getItems()) {
                if (item.isSelected()) {
                    hasSelection = true;
                    break;
                }
            }
            
            if (!hasSelection) {
                Toast.makeText(this, "Vui lòng chọn ít nhất 1 sản phẩm", Toast.LENGTH_SHORT).show();
        cbSelectAll = findViewById(R.id.cbSelectAll);
        cbSelectAll.setOnCheckedChangeListener((buttonView, isChecked) -> {
            adapter.selectAll(isChecked);
        });

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
            List<CartItem> selectedItems = adapter.getSelectedItems();
            if (selectedItems.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn sản phẩm để mua", Toast.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, ShippingAddressActivity.class);
            intent.putParcelableArrayListExtra("selected_items", new ArrayList<>(selectedItems));
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
                
                cbSelectAll.setChecked(true);
                for (CartItem item : items) item.setSelected(true);
                
                updateTotal(items);
                if (layoutEmpty != null)
                    layoutEmpty.setVisibility(items.isEmpty() ? View.VISIBLE : View.GONE);
                
                findViewById(R.id.layoutShopHeader).setVisibility(items.isEmpty() ? View.GONE : View.VISIBLE);
                findViewById(R.id.bottomPanelContainer).setVisibility(items.isEmpty() ? View.GONE : View.VISIBLE);
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
        int selectedCount = 0;
        boolean allSelected = !items.isEmpty();
        
        for (CartItem item : items) {
            if (item.isSelected()) {
                total += item.getPriceAsLong() * item.getQuantity();
                selectedCount++;
            } else {
                allSelected = false;
            }
        }
        
        if (tvTotal != null) {
            tvTotal.setText(String.format("%,dđ", total).replace(",", "."));
        }
        if (btnCheckout != null) {
            btnCheckout.setText("Thanh toán (" + selectedCount + ")");
        }
        if (cbSelectAll != null) {
            cbSelectAll.setChecked(allSelected && !items.isEmpty());
        }
    }

    @Override
    public void onQuantityChanged() {
        updateTotal(adapter.getItems());
    }

    @Override
    public void onSelectionChanged() {
        updateTotal(adapter.getItems());
    }
}

    private void updateCheckoutButton(int selectedCount, long totalPrice) {
        TextView btnCheckout = findViewById(R.id.btnCheckout);
        if (btnCheckout != null) {
            btnCheckout.setText("Mua Hàng (" + selectedCount + ")");
        }
        if (tvTotal != null) {
            tvTotal.setText(String.format("%,dđ", totalPrice).replace(",", "."));
        }
    }
}
