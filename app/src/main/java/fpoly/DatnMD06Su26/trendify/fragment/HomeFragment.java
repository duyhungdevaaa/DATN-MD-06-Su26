package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;
import androidx.viewpager2.widget.CompositePageTransformer;
import androidx.viewpager2.widget.MarginPageTransformer;

import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.google.firebase.auth.FirebaseAuth;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HomeFragment extends Fragment {

    private LinearLayout llCategoryContainer;
    private RecyclerView rvNewArrivals;
    private ProductAdapter newArrivalsAdapter;
    private Set<String> favoriteIds = new HashSet<>();

    // Banner variables
    private ViewPager2 bannerViewPager;
    private TabLayout bannerIndicator;
    private Handler autoScrollHandler = new Handler(Looper.getMainLooper());
    private Runnable autoScrollRunnable;
    private int bannerSize = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        ImageView ivSearch = view.findViewById(R.id.ivSearch);
        ImageView ivNotification = view.findViewById(R.id.ivNotification);
        llCategoryContainer = view.findViewById(R.id.llCategoryContainer);
        rvNewArrivals = view.findViewById(R.id.rvNewArrivals);

        rvNewArrivals.setLayoutManager(new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false));
        newArrivalsAdapter = new ProductAdapter(new ArrayList<>(), favoriteIds, this::handleFavoriteToggle);
        rvNewArrivals.setAdapter(newArrivalsAdapter);

        // Initialize banner ViewPager2 and indicator
        bannerViewPager = view.findViewById(R.id.bannerViewPager);
        bannerIndicator = view.findViewById(R.id.bannerIndicator);

        List<OnboardingItem> bannerItems = new ArrayList<>();
        bannerItems.add(new OnboardingItem(R.drawable.ic_shopping_bag, R.string.onboarding_title_1, R.string.onboarding_desc_1));
        bannerItems.add(new OnboardingItem(R.drawable.ic_favorite, R.string.onboarding_title_2, R.string.onboarding_desc_2));
        bannerItems.add(new OnboardingItem(R.drawable.ic_local_shipping, R.string.onboarding_title_3, R.string.onboarding_desc_3));
        bannerSize = bannerItems.size();

        BannerAdapter bannerAdapter = new BannerAdapter(bannerItems);
        bannerViewPager.setAdapter(bannerAdapter);

        // Apply smooth transition animations
        CompositePageTransformer compositePageTransformer = new CompositePageTransformer();
        compositePageTransformer.addTransformer(new MarginPageTransformer((int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 10, getResources().getDisplayMetrics())));
        compositePageTransformer.addTransformer((page, position) -> {
            float r = 1 - Math.abs(position);
            page.setScaleY(0.9f + r * 0.1f);
            page.setScaleX(0.9f + r * 0.1f);
            page.setAlpha(0.6f + r * 0.4f);
        });
        bannerViewPager.setPageTransformer(compositePageTransformer);

        new TabLayoutMediator(bannerIndicator, bannerViewPager, (tab, position) -> {
            // Tab layout configuration is handled by drawable selector
        }).attach();

        // Setup auto scroll runnable
        autoScrollRunnable = new Runnable() {
            @Override
            public void run() {
                if (bannerViewPager != null && bannerSize > 0) {
                    int current = bannerViewPager.getCurrentItem();
                    int next = (current + 1) % bannerSize;
                    bannerViewPager.setCurrentItem(next, true);
                    autoScrollHandler.postDelayed(this, 4000);
                }
            }
        };

        ivSearch.setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).setCurrentPage(1);
            }
        });

        ivNotification.setOnClickListener(v -> {
            if (getActivity() != null) {
                startActivity(new Intent(requireContext(), NotificationsActivity.class));
            }
        });

        loadCategories();
        loadFavoriteIds();
        loadNewArrivals();
        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (autoScrollRunnable != null) {
            autoScrollHandler.removeCallbacks(autoScrollRunnable);
            autoScrollHandler.postDelayed(autoScrollRunnable, 4000);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (autoScrollRunnable != null) {
            autoScrollHandler.removeCallbacks(autoScrollRunnable);
        }
    }

    private void loadCategories() {
        FirestoreHelper.loadCategories(new FirestoreHelper.CategoriesCallback() {
            @Override
            public void onLoaded(List<CategoryItem> categories) {
                showCategories(categories);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể tải danh mục: " + error, Toast.LENGTH_SHORT).show();
                showCategories(null);
            }
        });
    }

    private void showCategories(List<CategoryItem> categories) {
        llCategoryContainer.removeAllViews();
        if (categories == null || categories.isEmpty()) {
            String[] fallback = {"Nữ", "Nam", "Trẻ em", "Phụ kiện"};
            for (String name : fallback) {
                llCategoryContainer.addView(createCategoryPill(name, null));
            }
            return;
        }

        for (CategoryItem category : categories) {
            llCategoryContainer.addView(createCategoryPill(category.getName(), category));
        }
    }

    private void loadNewArrivals() {
        FirestoreHelper.loadAllProducts(new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                int count = Math.min(products.size(), 10);
                newArrivalsAdapter.setItems(products.subList(0, count));
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể tải sản phẩm mới: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadFavoriteIds() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            favoriteIds.clear();
            newArrivalsAdapter.setFavoriteIds(favoriteIds);
            return;
        }

        FirestoreHelper.loadFavoriteIds(new FirestoreHelper.FavoriteIdsCallback() {
            @Override
            public void onLoaded(List<String> ids) {
                favoriteIds.clear();
                favoriteIds.addAll(ids);
                newArrivalsAdapter.setFavoriteIds(favoriteIds);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể tải danh sách yêu thích: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void handleFavoriteToggle(ProductItem item, boolean shouldAdd) {
        if (!SessionManager.getInstance().isLoggedIn()) {
            Toast.makeText(requireContext(), "Vui lòng đăng nhập để quản lý yêu thích", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(requireContext(), LoginActivity.class));
            return;
        }
        if (shouldAdd) {
            FirestoreHelper.addFavoriteProduct(item, new FirestoreHelper.SimpleCallback() {
                @Override
                public void onSuccess() {
                    favoriteIds.add(item.getId());
                    newArrivalsAdapter.setFavoriteIds(favoriteIds);
                    Toast.makeText(requireContext(), "Đã thêm vào yêu thích", Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onFailure(String error) {
                    Toast.makeText(requireContext(), "Không thể thêm yêu thích: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            FirestoreHelper.removeFavoriteProduct(item.getId(), new FirestoreHelper.SimpleCallback() {
                @Override
                public void onSuccess() {
                    favoriteIds.remove(item.getId());
                    newArrivalsAdapter.setFavoriteIds(favoriteIds);
                    Toast.makeText(requireContext(), "Đã bỏ yêu thích", Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onFailure(String error) {
                    Toast.makeText(requireContext(), "Không thể bỏ yêu thích: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private TextView createCategoryPill(String title, @Nullable CategoryItem category) {
        TextView tv = new TextView(requireContext());
        tv.setText(title != null ? title : "Danh mục");
        tv.setTextColor(getResources().getColor(R.color.black, requireContext().getTheme()));
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        tv.setPadding(dpToPx(16), 0, dpToPx(16), 0);
        tv.setBackgroundResource(R.drawable.bg_pill);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dpToPx(40));
        params.setMarginEnd(dpToPx(12));
        tv.setLayoutParams(params);
        tv.setOnClickListener(v -> {
            if (category != null && category.getId() != null) {
                Intent intent = new Intent(requireContext(), ProductListActivity.class);
                intent.putExtra("CATEGORY_ID", category.getId());
                intent.putExtra("CATEGORY_NAME", category.getName());
                startActivity(intent);
            } else {
                Toast.makeText(requireContext(), "Vui lòng chọn danh mục khả dụng.", Toast.LENGTH_SHORT).show();
            }
        });
        return tv;
    }

    private int dpToPx(int dp) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, getResources().getDisplayMetrics());
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import fpoly.DatnMD06Su26.trendify.R;

public class HomeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }
}

