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
import org.json.JSONObject;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.ArrayList;
import java.util.List;

import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.LinearLayoutManager;
import android.app.Dialog;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RatingBar;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.Query;
import fpoly.DatnMD06Su26.trendify.adapter.ReviewAdapter;

public class ProductDetailActivity extends AppCompatActivity {

    private String selectedSize = "";
    private String selectedColor = "";
    private boolean productHasSizes = false;
    private boolean productHasColors = false;
    private ProductItem productDetail = null;
    private boolean isFavorite = false;
    private ImageView ivFavorite;
    
    private RecyclerView rvReviews;
    private ReviewAdapter reviewAdapter;
    private List<ReviewItem> reviewList = new ArrayList<>();

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
            // Hiệu ứng nhún nhảy (Bounce) thuần Android
            android.animation.ObjectAnimator scaleX = android.animation.ObjectAnimator.ofFloat(v, "scaleX", 1f, 0.9f, 1f);
            android.animation.ObjectAnimator scaleY = android.animation.ObjectAnimator.ofFloat(v, "scaleY", 1f, 0.9f, 1f);
            scaleX.setDuration(200);
            scaleY.setDuration(200);
            android.animation.AnimatorSet scaleDown = new android.animation.AnimatorSet();
            scaleDown.play(scaleX).with(scaleY);
            scaleDown.start();

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
                    
                    // Hiển thị badge tick xanh
                    ImageView ivBadgeSuccess = findViewById(R.id.ivCartBadgeSuccess);
                    TextView tvBadgeCount = findViewById(R.id.tvCartBadgeCount);
                    if (ivBadgeSuccess != null && tvBadgeCount != null) {
                        ivBadgeSuccess.setVisibility(View.VISIBLE);
                        tvBadgeCount.setVisibility(View.GONE);
                        
                        // Hiệu ứng pop-up cho tick xanh
                        ivBadgeSuccess.setScaleX(0f);
                        ivBadgeSuccess.setScaleY(0f);
                        ivBadgeSuccess.animate().scaleX(1f).scaleY(1f).setDuration(300).setInterpolator(new android.view.animation.OvershootInterpolator()).start();
                        
                        // Sau 1.5s, ẩn tick xanh và hiện số lượng THỰC TẾ
                        ivBadgeSuccess.postDelayed(() -> {
                            ivBadgeSuccess.setVisibility(View.GONE);
                            updateCartBadge();
                        }, 1500);
                    }
                }
                @Override
                public void onFailure(String error) {
                    Toast.makeText(ProductDetailActivity.this, "Lỗi: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        });
        
        // Gọi lần đầu để load số lượng giỏ hàng hiện tại khi mở màn hình
        updateCartBadge();

        View btnBuyNow = findViewById(R.id.btnBuyNow);
        if (btnBuyNow != null) {
            btnBuyNow.setOnClickListener(v -> {
                findViewById(R.id.btnAddToCart).performClick();
                startActivity(new Intent(this, CartActivity.class));
            });
        }

        ImageView ivCartTop = findViewById(R.id.ivCartTop);
        if (ivCartTop != null) {
            ivCartTop.setOnClickListener(v -> startActivity(new Intent(this, CartActivity.class)));
        }

        rvReviews = findViewById(R.id.rvReviews);
        if (rvReviews != null) {
            rvReviews.setLayoutManager(new LinearLayoutManager(this));
            reviewAdapter = new ReviewAdapter(reviewList);
            rvReviews.setAdapter(reviewAdapter);
            if (finalProductId != null) {
                loadReviews(finalProductId);
            }
        }

        View btnWriteReview = findViewById(R.id.btnWriteReview);
        if (btnWriteReview != null) {
            btnWriteReview.setOnClickListener(v -> {
                if (!SessionManager.getInstance().isLoggedIn()) {
                    Toast.makeText(this, "Vui lòng đăng nhập để đánh giá", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(this, LoginActivity.class));
                    return;
                }
                if (finalProductId != null) {
                    showWriteReviewDialog(finalProductId);
                }
            });
        }
        
        loadDefaultShippingFee();
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

    private void calculateShippingFeeForProduct(int districtId, String wardCode) {
        TextView tvShippingFee = findViewById(R.id.tvShippingFee);
        if (tvShippingFee == null) return;
        
        new Thread(() -> {
            try {
                JSONObject payload = new JSONObject();
                payload.put("service_type_id", 2);
                payload.put("from_district_id", 1442);
                payload.put("to_district_id", districtId);
                payload.put("to_ward_code", wardCode);
                payload.put("height", 10);
                payload.put("length", 10);
                payload.put("weight", 200);
                payload.put("width", 10);
                payload.put("insurance_value", 0);

                java.net.URL url = new java.net.URL("https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("Token", "ecefb2fb-7203-11f1-a973-aee5264794df");
                conn.setRequestProperty("ShopId", "200902");
                conn.setDoOutput(true);
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);

                try (java.io.OutputStream os = conn.getOutputStream()) {
                    os.write(payload.toString().getBytes("UTF-8"));
                }

                if (conn.getResponseCode() == 200) {
                    java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    
                    JSONObject responseJson = new JSONObject(sb.toString());
                    if (responseJson.has("data")) {
                        long fee = responseJson.getJSONObject("data").getLong("total");
                        runOnUiThread(() -> {
                            tvShippingFee.setText(String.format("%,dđ", fee).replace(",", "."));
                        });
                    }
                } else {
                    runOnUiThread(() -> tvShippingFee.setText("30.000đ"));
                }
            } catch (Exception e) {
                runOnUiThread(() -> tvShippingFee.setText("30.000đ"));
            }
        }).start();
    }
    
    private void loadDefaultShippingFee() {
        TextView tvShippingFee = findViewById(R.id.tvShippingFee);
        if (tvShippingFee == null) return;
        
        if (!SessionManager.getInstance().isLoggedIn()) {
            tvShippingFee.setText("Vui lòng đăng nhập");
            return;
        }
        
        FirestoreHelper.loadAddresses(new FirestoreHelper.AddressesCallback() {
            @Override
            public void onLoaded(List<UserAddress> addresses) {
                UserAddress defaultAddress = null;
                for (UserAddress address : addresses) {
                    if (address.isDefault()) {
                        defaultAddress = address;
                        break;
                    }
                }
                if (defaultAddress == null && !addresses.isEmpty()) {
                    defaultAddress = addresses.get(0);
                }
                
                if (defaultAddress != null && defaultAddress.getDistrictId() != -1 && defaultAddress.getWardCode() != null && !defaultAddress.getWardCode().isEmpty()) {
                    calculateShippingFeeForProduct(defaultAddress.getDistrictId(), defaultAddress.getWardCode());
                } else {
                    tvShippingFee.setText("30.000đ");
                }
            }
            @Override
            public void onFailure(String error) {
                tvShippingFee.setText("30.000đ");
            }
        });
    }

    private void loadReviews(String productId) {
        FirebaseFirestore.getInstance().collection("reviews")
                .whereEqualTo("productId", productId)
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        android.util.Log.e("ProductDetailActivity", "Listen failed.", error);
                        return;
                    }
                    if (value != null) {
                        reviewList.clear();
                        float totalRating = 0;
                        for (QueryDocumentSnapshot doc : value) {
                            ReviewItem item = doc.toObject(ReviewItem.class);
                            item.setReviewId(doc.getId());
                            reviewList.add(item);
                            totalRating += item.getRating();
                        }
                        
                        // Sort locally to avoid composite index requirement
                        java.util.Collections.sort(reviewList, (r1, r2) -> Long.compare(r2.getCreatedAt(), r1.getCreatedAt()));

                        reviewAdapter.notifyDataSetChanged();
                        
                        // Update summary
                        TextView tvAvgRating = findViewById(R.id.tvAvgRating);
                        TextView tvTotalReviews = findViewById(R.id.tvTotalReviews);
                        LinearLayout llStarContainer = findViewById(R.id.llStarContainer);

                        if (reviewList.size() > 0) {
                            float avgRating = totalRating / reviewList.size();
                            
                            if (tvAvgRating != null) {
                                tvAvgRating.setText(String.format(java.util.Locale.getDefault(), "%.1f", avgRating));
                            }
                            if (tvTotalReviews != null) {
                                tvTotalReviews.setText("Dựa trên " + reviewList.size() + " đánh giá");
                            }
                            if (llStarContainer != null) {
                                int roundedRating = Math.round(avgRating);
                                for (int i = 0; i < llStarContainer.getChildCount(); i++) {
                                    android.widget.ImageView star = (android.widget.ImageView) llStarContainer.getChildAt(i);
                                    if (i < roundedRating) {
                                        star.setColorFilter(android.graphics.Color.parseColor("#FFC107"));
                                    } else {
                                        star.setColorFilter(android.graphics.Color.parseColor("#EEEEEE"));
                                    }
                                }
                            }
                        } else {
                            if (tvAvgRating != null) tvAvgRating.setText("0.0");
                            if (tvTotalReviews != null) tvTotalReviews.setText("Chưa có đánh giá nào");
                            if (llStarContainer != null) {
                                for (int i = 0; i < llStarContainer.getChildCount(); i++) {
                                    ((android.widget.ImageView) llStarContainer.getChildAt(i)).setColorFilter(android.graphics.Color.parseColor("#EEEEEE"));
                                }
                            }
                        }
                    }
                });
    }

    private void showWriteReviewDialog(String productId) {
        View view = getLayoutInflater().inflate(R.layout.dialog_write_review, null);
        RatingBar ratingBar = view.findViewById(R.id.dialogRatingBar);
        EditText etReviewContent = view.findViewById(R.id.etComment);

        android.app.AlertDialog dialog = new android.app.AlertDialog.Builder(this)
                .setTitle("Viết Đánh Giá")
                .setView(view)
                .setPositiveButton("Gửi", null) // Set null here to override default dismiss behavior
                .setNegativeButton("Hủy", (d, w) -> d.dismiss())
                .create();

        dialog.setOnShowListener(dialogInterface -> {
            Button button = dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE);
            button.setOnClickListener(v -> {
                float rating = ratingBar.getRating();
                String content = etReviewContent.getText().toString().trim();

                if (rating == 0) {
                    Toast.makeText(this, "Vui lòng chọn số sao", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (content.isEmpty()) {
                    Toast.makeText(this, "Vui lòng nhập nội dung đánh giá", Toast.LENGTH_SHORT).show();
                    return;
                }

                String userId = SessionManager.getInstance().getUserId();
                button.setEnabled(false);
                button.setText("Đang gửi...");

                // Lấy thông tin user từ Realtime Database
                com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users").child(userId)
                        .addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
                            @Override
                            public void onDataChange(com.google.firebase.database.DataSnapshot snapshot) {
                                String userName = "Người dùng";
                                String userAvatar = "";
                                if (snapshot.exists()) {
                                    if (snapshot.hasChild("fullName")) {
                                        userName = snapshot.child("fullName").getValue(String.class);
                                    } else if (snapshot.hasChild("name")) {
                                        userName = snapshot.child("name").getValue(String.class);
                                    }
                                    if (snapshot.hasChild("avatar")) {
                                        userAvatar = snapshot.child("avatar").getValue(String.class);
                                    } else if (snapshot.hasChild("avatarUrl")) {
                                        userAvatar = snapshot.child("avatarUrl").getValue(String.class);
                                    }
                                }

                                ReviewItem newReview = new ReviewItem(
                                        "", // reviewId
                                        productId,
                                        userId,
                                        userName,
                                        userAvatar,
                                        rating,
                                        content,
                                        System.currentTimeMillis()
                                );

                                FirebaseFirestore.getInstance().collection("reviews")
                                        .add(newReview)
                                        .addOnSuccessListener(documentReference -> {
                                            Toast.makeText(ProductDetailActivity.this, "Đã gửi đánh giá thành công", Toast.LENGTH_SHORT).show();
                                            dialog.dismiss();
                                        })
                                        .addOnFailureListener(e -> {
                                            button.setEnabled(true);
                                            button.setText("Gửi");
                                            Toast.makeText(ProductDetailActivity.this, "Lỗi khi gửi đánh giá: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                                        });
                            }

                            @Override
                            public void onCancelled(com.google.firebase.database.DatabaseError error) {
                                button.setEnabled(true);
                                button.setText("Gửi");
                                Toast.makeText(ProductDetailActivity.this, "Lỗi lấy thông tin user: " + error.getMessage(), Toast.LENGTH_SHORT).show();
                            }
                        });
            });
        });

        dialog.show();
    }

    private void updateCartBadge() {
        new CartManager().getCartCount(new CartManager.CartCountCallback() {
            @Override
            public void onCounted(int count) {
                TextView tvBadgeCount = findViewById(R.id.tvCartBadgeCount);
                if (tvBadgeCount != null) {
                    if (count > 0) {
                        tvBadgeCount.setVisibility(View.VISIBLE);
                        tvBadgeCount.setText(String.valueOf(count));
                        // Hiệu ứng pop-up
                        tvBadgeCount.setScaleX(0f);
                        tvBadgeCount.setScaleY(0f);
                        tvBadgeCount.animate().scaleX(1f).scaleY(1f).setDuration(300).setInterpolator(new android.view.animation.OvershootInterpolator()).start();
                    } else {
                        tvBadgeCount.setVisibility(View.GONE);
                    }
                }
            }

            @Override
            public void onFailure(String error) {
                // Không cần báo lỗi nếu chưa đăng nhập, cứ ẩn badge đi
                TextView tvBadgeCount = findViewById(R.id.tvCartBadgeCount);
                if (tvBadgeCount != null) {
                    tvBadgeCount.setVisibility(View.GONE);
                }
            }
        });
    }
}
