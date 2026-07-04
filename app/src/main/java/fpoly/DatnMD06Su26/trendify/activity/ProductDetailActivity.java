package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;

import com.bumptech.glide.Glide;
import com.google.firebase.firestore.FirebaseFirestore;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.ArrayList;
import java.util.List;

public class ProductDetailActivity extends AppCompatActivity {

    private String selectedSize = "";
    private String selectedColor = "";
    private boolean productHasSizes = false;
    private boolean productHasColors = false;
    private ProductItem productDetail = null;
    private boolean isFavorite = false;
    private ImageView ivFavorite;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_product_detail);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.ivBack), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top + 20, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        String productId   = getIntent().getStringExtra("PRODUCT_ID");
        String productName = getIntent().getStringExtra("PRODUCT_NAME");
        String productPrice = getIntent().getStringExtra("PRODUCT_PRICE");
        String imageUrl    = getIntent().getStringExtra("PRODUCT_IMAGE");

        if ((productId == null || productId.isEmpty()) && productName != null) {
            productId = productName.trim().toLowerCase().replaceAll("[^a-z0-9]+", "_");
        }

        final String finalProductId = productId;
        final String finalProductName = productName != null ? productName : "";
        final String finalProductPrice = productPrice != null ? productPrice : "";
        final String finalImageUrl = imageUrl != null ? imageUrl : "";

        TextView tvName  = findViewById(R.id.tvProductName);
        TextView tvPrice = findViewById(R.id.tvProductPrice);
        ImageView ivProductImage = findViewById(R.id.ivProductImage);
        
        if (!finalImageUrl.isEmpty()) {
            Glide.with(this)
                    .load(finalImageUrl)
                    .centerCrop()
                    .into(ivProductImage);
        }
        if (!finalProductName.isEmpty()) tvName.setText(finalProductName);
        if (!finalProductPrice.isEmpty()) tvPrice.setText(finalProductPrice);

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());

        ivFavorite = findViewById(R.id.ivFavorite);
        if (ivFavorite != null) {
            ivFavorite.setColorFilter(Color.WHITE); // Default
            
            // Check if product is in favorites
            if (SessionManager.getInstance().isLoggedIn() && finalProductId != null) {
                FirestoreHelper.loadFavoriteIds(new FirestoreHelper.FavoriteIdsCallback() {
                    @Override
                    public void onLoaded(List<String> favoriteIds) {
                        if (favoriteIds.contains(finalProductId)) {
                            isFavorite = true;
                            ivFavorite.setColorFilter(Color.RED);
                        }
                    }

                    @Override
                    public void onFailure(String error) {
                        android.util.Log.e("ProductDetailActivity", "Failed to load favorites: " + error);
                    }
                });
            }

            ivFavorite.setOnClickListener(v -> {
                if (!SessionManager.getInstance().isLoggedIn()) {
                    Toast.makeText(this, "Vui lòng đăng nhập để quản lý yêu thích", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(this, LoginActivity.class));
                    return;
                }
                
                if (finalProductId == null) return;
                
                if (isFavorite) {
                    // Remove from favorites
                    FirestoreHelper.removeFavoriteProduct(finalProductId, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            isFavorite = false;
                            ivFavorite.setColorFilter(Color.WHITE);
                            Toast.makeText(ProductDetailActivity.this, "Đã xóa khỏi yêu thích", Toast.LENGTH_SHORT).show();
                        }

                        @Override
                        public void onFailure(String error) {
                            Toast.makeText(ProductDetailActivity.this, "Lỗi: " + error, Toast.LENGTH_SHORT).show();
                        }
                    });
                } else {
                    // Add to favorites
                    ProductItem itemToFav = productDetail;
                    if (itemToFav == null) {
                        itemToFav = new ProductItem(finalProductId, "", finalProductName, finalProductPrice, finalImageUrl);
                    }
                    FirestoreHelper.addFavoriteProduct(itemToFav, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            isFavorite = true;
                            ivFavorite.setColorFilter(Color.RED);
                            Toast.makeText(ProductDetailActivity.this, "Đã thêm vào yêu thích", Toast.LENGTH_SHORT).show();
                        }

                        @Override
                        public void onFailure(String error) {
                            Toast.makeText(ProductDetailActivity.this, "Lỗi: " + error, Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            });
        }

        LinearLayout layoutSizes = findViewById(R.id.layoutSizes);
        LinearLayout layoutColors = findViewById(R.id.layoutColors);
        
        if (layoutSizes != null) layoutSizes.removeAllViews();
        if (layoutColors != null) layoutColors.removeAllViews();

        if (finalProductId != null) {
            FirebaseFirestore.getInstance().collection("products").document(finalProductId)
                    .get()
                    .addOnSuccessListener(documentSnapshot -> {
                        android.util.Log.d("ProductDetailActivity", "Firestore doc snapshot exists: " + documentSnapshot.exists());
                        if (documentSnapshot.exists()) {
                            productDetail = documentSnapshot.toObject(ProductItem.class);
                            if (productDetail != null) {
                                productDetail.setId(documentSnapshot.getId());
                                List<String> loadedSizes = productDetail.getSizes();
                                List<String> loadedColors = productDetail.getColors();
                                android.util.Log.d("ProductDetailActivity", "Loaded sizes: " + loadedSizes + ", colors: " + loadedColors);
                                setupSizesAndColors(productDetail, layoutSizes, layoutColors);
                            } else {
                                Toast.makeText(this, "Lỗi: Dữ liệu sản phẩm rỗng!", Toast.LENGTH_LONG).show();
                            }
                        } else {
                            Toast.makeText(this, "Lỗi: Sản phẩm không tồn tại trên hệ thống! (ID: " + finalProductId + ")", Toast.LENGTH_LONG).show();
                        }
                    })
                    .addOnFailureListener(e -> {
                        Toast.makeText(this, "Không thể tải chi tiết sản phẩm: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    });
        } else {
            Toast.makeText(this, "Lỗi: PRODUCT_ID bị null!", Toast.LENGTH_LONG).show();
        }

        findViewById(R.id.btnAddToCart).setOnClickListener(v -> {
            if (finalProductId == null) {
                Toast.makeText(this, "Lỗi sản phẩm", Toast.LENGTH_SHORT).show();
                return;
            }
            if (!SessionManager.getInstance().isLoggedIn()) {
                Toast.makeText(this, "Vui lòng đăng nhập để thêm vào giỏ hàng", Toast.LENGTH_SHORT).show();
                startActivity(new Intent(this, LoginActivity.class));
                return;
            }
            
            if (productHasSizes && selectedSize.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn Kích cỡ", Toast.LENGTH_SHORT).show();
                return;
            }
            if (productHasColors && selectedColor.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn Màu sắc", Toast.LENGTH_SHORT).show();
                return;
            }
            
            // Check variant quantity
            if (productDetail != null && productDetail.getVariants() != null && !productDetail.getVariants().isEmpty()) {
                boolean variantFound = false;
                for (ProductItem.Variant variant : productDetail.getVariants()) {
                    boolean sizeMatch = !productHasSizes || selectedSize.equalsIgnoreCase(variant.getSize());
                    boolean colorMatch = !productHasColors || selectedColor.equalsIgnoreCase(variant.getColor());
                    if (sizeMatch && colorMatch) {
                        variantFound = true;
                        if (variant.getQuantity() <= 0) {
                            Toast.makeText(this, "Sản phẩm phân loại này đã hết hàng!", Toast.LENGTH_SHORT).show();
                            return;
                        }
                        break;
                    }
                }
                if (!variantFound && (productHasSizes || productHasColors)) {
                    Toast.makeText(this, "Phân loại được chọn hiện không tồn tại hoặc hết hàng", Toast.LENGTH_SHORT).show();
                    return;
                }
            } else if (productDetail != null && productDetail.getQuantity() <= 0) {
                Toast.makeText(this, "Sản phẩm này đã hết hàng!", Toast.LENGTH_SHORT).show();
                return;
            }

            // Create cartItemId using productId + selected variant details to make distinct cart items
            String cartItemId = finalProductId;
            if (!selectedSize.isEmpty() || !selectedColor.isEmpty()) {
                cartItemId = finalProductId + "_" + selectedSize + "_" + selectedColor;
            }

            CartItem item = new CartItem(finalProductId, finalProductName, finalProductPrice, 1, 
                    finalImageUrl != null ? finalImageUrl : "", selectedSize, selectedColor, cartItemId);
            
            new CartManager().addToCart(item, new CartManager.CartCallback() {
                @Override
                public void onSuccess() {
                    Toast.makeText(ProductDetailActivity.this, "Đã thêm vào giỏ hàng ✓", Toast.LENGTH_SHORT).show();
                }
                @Override
                public void onFailure(String error) {
                    Toast.makeText(ProductDetailActivity.this, "Lỗi: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        });
    }

    private void setupSizesAndColors(ProductItem product, LinearLayout layoutSizes, LinearLayout layoutColors) {
        if (layoutSizes == null || layoutColors == null) return;
        
        List<String> sizes = product.getSizes();
        List<String> colors = product.getColors();
        
        if (sizes == null || sizes.isEmpty()) {
            sizes = new ArrayList<>(java.util.Arrays.asList("S", "M", "L", "XL", "XXL"));
        }
        if (colors == null || colors.isEmpty()) {
            colors = new ArrayList<>(java.util.Arrays.asList("Xanh", "Đỏ", "Tím", "Vàng", "Trắng", "Đen"));
        }
        
        productHasSizes = !sizes.isEmpty();
        productHasColors = !colors.isEmpty();
        
        layoutSizes.removeAllViews();
        layoutColors.removeAllViews();
        
        if (productHasSizes) {
            for (String size : sizes) {
                TextView tv = new TextView(this);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 48, getResources().getDisplayMetrics()),
                        (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 40, getResources().getDisplayMetrics())
                );
                lp.setMargins(0, 0, (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 10, getResources().getDisplayMetrics()), 0);
                tv.setLayoutParams(lp);
                tv.setText(size);
                tv.setGravity(android.view.Gravity.CENTER);
                tv.setTextColor(Color.BLACK);
                tv.setBackgroundResource(R.drawable.bg_chip_unselected);
                
                tv.setOnClickListener(v -> {
                    selectedSize = size;
                    for (int i = 0; i < layoutSizes.getChildCount(); i++) {
                        View child = layoutSizes.getChildAt(i);
                        if (child instanceof TextView) {
                            child.setBackgroundResource(R.drawable.bg_chip_unselected);
                            ((TextView) child).setTextColor(Color.BLACK);
                        }
                    }
                    tv.setBackgroundResource(R.drawable.bg_chip_selected);
                    tv.setTextColor(Color.WHITE);
                });
                layoutSizes.addView(tv);
            }
        }
        
        if (productHasColors) {
            final List<String> finalColors = colors;
            for (String color : finalColors) {
                View colorView = new View(this);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 32, getResources().getDisplayMetrics()),
                        (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 32, getResources().getDisplayMetrics())
                );
                lp.setMargins(0, 0, (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 12, getResources().getDisplayMetrics()), 0);
                colorView.setLayoutParams(lp);
                colorView.setBackground(getColorDrawable(color, false));
                
                colorView.setOnClickListener(v -> {
                    selectedColor = color;
                    for (int i = 0; i < layoutColors.getChildCount(); i++) {
                        View child = layoutColors.getChildAt(i);
                        String otherColor = finalColors.get(i);
                        child.setBackground(getColorDrawable(otherColor, false));
                    }
                    colorView.setBackground(getColorDrawable(color, true));
                });
                layoutColors.addView(colorView);
            }
        }
    }

    private Drawable getColorDrawable(String colorName, boolean isSelected) {
        GradientDrawable gd = new GradientDrawable();
        gd.setShape(GradientDrawable.OVAL);
        
        int colorVal = Color.GRAY;
        switch (colorName.toLowerCase()) {
            case "xanh": colorVal = Color.parseColor("#2196F3"); break;
            case "đỏ": colorVal = Color.parseColor("#F44336"); break;
            case "tím": colorVal = Color.parseColor("#9C27B0"); break;
            case "vàng": colorVal = Color.parseColor("#FFEB3B"); break;
            case "trắng": colorVal = Color.parseColor("#FFFFFF"); break;
            case "đen": colorVal = Color.parseColor("#000000"); break;
        }
        gd.setColor(colorVal);
        
        if (isSelected) {
            gd.setStroke(6, Color.parseColor("#FF5722")); // Orange border for selected
        } else {
            if (colorName.equalsIgnoreCase("trắng")) {
                gd.setStroke(2, Color.parseColor("#CCCCCC")); // Light border for white color
            } else {
                gd.setStroke(0, Color.TRANSPARENT);
            }
        }
        return gd;
    }
}
