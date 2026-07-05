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
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class ProductListActivity extends AppCompatActivity {

    private String categoryId;
    private String filterMode;
    private ProductAdapter productAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_product_list);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.tvTitle), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), systemBars.top + 20, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        categoryId = getIntent().getStringExtra("CATEGORY_ID");
        filterMode = getIntent().getStringExtra("FILTER_MODE");
        String categoryName = getIntent().getStringExtra("CATEGORY_NAME");
        TextView tvTitle = findViewById(R.id.tvTitle);
        if (categoryName != null && !categoryName.isEmpty()) {
            tvTitle.setText(categoryName);
        } else if ("SALE".equals(filterMode)) {
            tvTitle.setText("Săn Sale");
        } else if ("NEW".equals(filterMode)) {
            tvTitle.setText("Hàng Mới");
        }

        ImageView ivFilter = findViewById(R.id.ivFilter);
        ivFilter.setOnClickListener(v -> {
            FilterBottomSheetFragment filterSheet = new FilterBottomSheetFragment();
            filterSheet.show(getSupportFragmentManager(), filterSheet.getTag());
        });

        RecyclerView rvProducts = findViewById(R.id.rvProducts);
        rvProducts.setLayoutManager(new GridLayoutManager(this, 2));

        productAdapter = new ProductAdapter(new ArrayList<>());
        rvProducts.setAdapter(productAdapter);

        if (categoryId != null && !categoryId.isEmpty()) {
            loadProducts(categoryId);
        } else {
            loadAllProducts(filterMode);
        }
    }

    private void loadProducts(String categoryId) {
        FirestoreHelper.loadProducts(categoryId, new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                productAdapter.setItems(products);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(ProductListActivity.this, "Không thể tải sản phẩm: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void loadAllProducts(String mode) {
        FirestoreHelper.loadAllProducts(new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                if ("SALE".equals(mode)) {
                    List<ProductItem> saleProducts = new ArrayList<>();
                    for (ProductItem p : products) {
                        if (p.getDiscount() > 0) {
                            saleProducts.add(p);
                        }
                    }
                    productAdapter.setItems(saleProducts);
                } else if ("NEW".equals(mode)) {
                    List<ProductItem> newProducts = new ArrayList<>();
                    long oneDayMillis = 24 * 60 * 60 * 1000L;
                    long currentTime = System.currentTimeMillis();
                    for (ProductItem p : products) {
                        if (p.getCreatedAt() != null && (currentTime - p.getCreatedAt()) <= oneDayMillis) {
                            newProducts.add(p);
                        }
                    }
                    // Nếu không có hàng mới trong 24h, hiển thị tất cả
                    if (newProducts.isEmpty()) {
                        productAdapter.setItems(products);
                    } else {
                        productAdapter.setItems(newProducts);
                    }
                } else {
                    productAdapter.setItems(products);
                }
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(ProductListActivity.this, "Không thể tải sản phẩm: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }
}
