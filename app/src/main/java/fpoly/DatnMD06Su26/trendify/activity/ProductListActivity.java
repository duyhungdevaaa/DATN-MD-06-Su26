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
        String categoryName = getIntent().getStringExtra("CATEGORY_NAME");
        TextView tvTitle = findViewById(R.id.tvTitle);
        if (categoryName != null && !categoryName.isEmpty()) {
            tvTitle.setText(categoryName);
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
            loadAllProducts();
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

    private void loadAllProducts() {
        FirestoreHelper.loadAllProducts(new FirestoreHelper.ProductsCallback() {
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
}
