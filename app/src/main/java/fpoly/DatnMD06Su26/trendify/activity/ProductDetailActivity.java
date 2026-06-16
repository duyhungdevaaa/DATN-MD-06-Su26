package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;

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
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

public class ProductDetailActivity extends AppCompatActivity {

    private String selectedSize = "";
    private String selectedColor = "";
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

        // Đọc thông tin sản phẩm gửi qua Intent
        String productId = getIntent().getStringExtra("PRODUCT_ID");
        String productName = getIntent().getStringExtra("PRODUCT_NAME");
        String productPrice = getIntent().getStringExtra("PRODUCT_PRICE");
        String imageUrl = getIntent().getStringExtra("PRODUCT_IMAGE");

        // Sử dụng dữ liệu giả lập nếu không nhận được dữ liệu từ Intent
        if (productName == null || productName.isEmpty()) {
            productName = "Áo Thun Trendify Premium";
            productPrice = "350.000đ";
            imageUrl = "";
        }

        final String finalProductName = productName;
        final String finalProductPrice = productPrice;
        final String finalImageUrl = imageUrl;

        TextView tvName = findViewById(R.id.tvProductName);
        TextView tvPrice = findViewById(R.id.tvProductPrice);
        ImageView ivProductImage = findViewById(R.id.ivProductImage);
        
        if (!finalImageUrl.isEmpty()) {
            Glide.with(this)
                    .load(finalImageUrl)
                    .centerCrop()
                    .into(ivProductImage);
        } else {
            ivProductImage.setImageResource(R.drawable.scene_about_hero); // Ảnh mặc định để hiển thị
        }
        
        tvName.setText(finalProductName);
        tvPrice.setText(finalProductPrice);

        // Nút quay lại
        findViewById(R.id.ivBack).setOnClickListener(v -> finish());

        // Nút chia sẻ
        findViewById(R.id.ivShare).setOnClickListener(v -> 
                Toast.makeText(this, "Đã chia sẻ sản phẩm này", Toast.LENGTH_SHORT).show()
        );

        // Nút yêu thích (Yêu cầu đăng nhập trước)
        ivFavorite = findViewById(R.id.ivFavorite);
        if (ivFavorite != null) {
            ivFavorite.setColorFilter(Color.WHITE); // Mặc định chưa thích
            
            ivFavorite.setOnClickListener(v -> {
                if (!SessionManager.getInstance().isLoggedIn()) {
                    Toast.makeText(this, "Vui lòng đăng nhập để quản lý yêu thích", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(this, LoginActivity.class));
                    return;
                }
                
                isFavorite = !isFavorite;
                if (isFavorite) {
                    ivFavorite.setColorFilter(Color.RED);
                    Toast.makeText(ProductDetailActivity.this, "Đã thêm vào yêu thích (Giả lập)", Toast.LENGTH_SHORT).show();
                } else {
                    ivFavorite.setColorFilter(Color.WHITE);
                    Toast.makeText(ProductDetailActivity.this, "Đã xóa khỏi yêu thích (Giả lập)", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Thiết lập kích thước và màu sắc của sản phẩm
        LinearLayout layoutSizes = findViewById(R.id.layoutSizes);
        LinearLayout layoutColors = findViewById(R.id.layoutColors);
        setupSizesAndColors(layoutSizes, layoutColors);

        // Nút thêm vào giỏ hàng (Yêu cầu đăng nhập trước)
        findViewById(R.id.btnAddToCart).setOnClickListener(v -> {
            if (!SessionManager.getInstance().isLoggedIn()) {
                Toast.makeText(this, "Vui lòng đăng nhập để thêm vào giỏ hàng", Toast.LENGTH_SHORT).show();
                startActivity(new Intent(this, LoginActivity.class));
                return;
            }
            
            if (selectedSize.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn Kích cỡ", Toast.LENGTH_SHORT).show();
                return;
            }
            if (selectedColor.isEmpty()) {
                Toast.makeText(this, "Vui lòng chọn Màu sắc", Toast.LENGTH_SHORT).show();
                return;
            }

            Toast.makeText(ProductDetailActivity.this, 
                    "Đã thêm vào giỏ hàng ✓\nPhân loại: " + selectedSize + " - " + selectedColor, 
                    Toast.LENGTH_SHORT).show();
        });
    }

    private void setupSizesAndColors(LinearLayout layoutSizes, LinearLayout layoutColors) {
        if (layoutSizes == null || layoutColors == null) return;
        
        layoutSizes.removeAllViews();
        layoutColors.removeAllViews();
        
        // Cài đặt danh sách Kích thước giả lập
        List<String> sizes = new ArrayList<>(java.util.Arrays.asList("XS", "S", "M", "L", "XL"));
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
        
        // Cài đặt danh sách Màu sắc giả lập
        List<String> colors = new ArrayList<>(java.util.Arrays.asList("Xanh", "Đỏ", "Tím", "Vàng", "Trắng", "Đen"));
        for (String color : colors) {
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
                    String otherColor = colors.get(i);
                    child.setBackground(getColorDrawable(otherColor, false));
                }
                colorView.setBackground(getColorDrawable(color, true));
            });
            layoutColors.addView(colorView);
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
            gd.setStroke(6, Color.parseColor("#FF5722")); // Đường viền cam khi chọn
        } else {
            if (colorName.equalsIgnoreCase("trắng")) {
                gd.setStroke(2, Color.parseColor("#CCCCCC")); // Đường viền xám nhẹ cho màu trắng
            } else {
                gd.setStroke(0, Color.TRANSPARENT);
            }
        }
        return gd;
    }
}
