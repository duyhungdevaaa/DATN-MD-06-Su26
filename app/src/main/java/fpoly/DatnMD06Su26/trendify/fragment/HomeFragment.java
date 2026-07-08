package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HomeFragment extends Fragment {

    private RecyclerView rvNewArrivals;
    private ProductAdapter newArrivalsAdapter;
    private Set<String> favoriteIds = new HashSet<>();
    private List<CategoryItem> loadedCategoryItems = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        ImageView ivSearch = view.findViewById(R.id.ivSearch);
        ImageView ivNotification = view.findViewById(R.id.ivNotification);
        rvNewArrivals = view.findViewById(R.id.rvNewArrivals);

        // Grid layout manager with 2 columns
        rvNewArrivals.setLayoutManager(new GridLayoutManager(requireContext(), 2));
        newArrivalsAdapter = new ProductAdapter(new ArrayList<>(), favoriteIds, this::handleFavoriteToggle);
        rvNewArrivals.setAdapter(newArrivalsAdapter);

        // Bind and load Hero image
        ImageView ivHeroImage = view.findViewById(R.id.ivHeroImage);
        if (ivHeroImage != null) {
            Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuCdMsc48mhR6FbFhVwf2WdVDCG3ETwd3L4ScSptSVOWhfBa5kC-jyrBzd-l5OIffblyBmtB_1CFC2TLR8WIgRjuYIHr7-wQF3R1gogD8R5vyn6fYEqV66sSFIFEf8uhqZtBwrwO2xICtxWX-8llozsrh0OhsDcO8uVP0CQBRbGuMD59wNtlUXON-ru1REYEgEr0mN_5SmekY0n1Tw9vo5BDOunX_gq8CH1dQnD-NYlwccoW655tFgTCr8wYr6mqYaXsM06DDc8zNso")
                .centerCrop()
                .into(ivHeroImage);
        }

        // Bind explore button to switch to Category tab (index 2)
        View btnExplore = view.findViewById(R.id.btnExplore);
        if (btnExplore != null) {
            btnExplore.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(2);
                }
            });
        }

        // Load and bind categories images
        ImageView ivCatVay = view.findViewById(R.id.ivCatVay);
        if (ivCatVay != null) {
            Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuCPD8ECPvM7uBmWFS9huFc5YBTfOew9OaY8wG8hQKBuByZGDsQ55V1-TFZIinLnO-VxzIb-7HINZMgd5wjXcrmA15d9Q5LMpOKiYFyKt0BLEaGAFG9UcAgnRRW8LQyWAMOlOIS4JGhQMQMGRcHKrW7S7m0qQFJlax4FMq1Gzc-d6KeC5pDpitvRbOEf6VQgjXOMzPEStcpIaEzjtlZEh70HQdTQdf3pG9v8XCTu3qaRN5D8Wbvnw-siB4OQFNZml7umCpPVvmBSZtI")
                .centerCrop()
                .into(ivCatVay);
        }

        ImageView ivCatAo = view.findViewById(R.id.ivCatAo);
        if (ivCatAo != null) {
            Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuA2hmAL2kOVV2k7aeS1NWSp-k7hPIDNzWHShjPDrZcFLG6xthFolTG282DhcE_lbFAeIi-lwCnOs2Sd97nhc77S-c9UqQn36v9d0dTDrIxawLL3BJVNZMIGSCJs64oP-W8AUinv9S43gq7ubtKiuBow-toIy0vFxoMk3lizlu2wtPyUaexM15BbuRXvQNECqw2V3goSHewdJQMSFUEYBJBCcDrYN-8yLnu0fVelunPNMP_iQsFR8KWeImzO8v6KzwvzxGRI0_lH1yw")
                .centerCrop()
                .into(ivCatAo);
        }

        ImageView ivCatPhuKien = view.findViewById(R.id.ivCatPhuKien);
        if (ivCatPhuKien != null) {
            Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuCAxhHQooyU8SiIwiH0Pbzuw1-uZdod_ngqcegoqttRqmzHPL_nqur3okOg4NBrK-yzBHV5e93Q3F9aKdDsai8MXvmlmuHPwCZazU_f6Bv2IHQ-KjmCI8oO-ac873DWgJdX2XZKKTRIR_hsK9p63PbP0tCXX2tS_-L3FbFQnlmCx8rxU9RVo8BRfF_DBp7RBJjbOy_h4N7H-N5AoQgvbi3LD2GWZnZGRsJD2UGfUDUpAksAejImy6j_B1zkcJmBAO6MDG7BDEb1kTw")
                .centerCrop()
                .into(ivCatPhuKien);
        }

        // Setup click listeners on category layouts
        View layoutCatVay = view.findViewById(R.id.layoutCatVay);
        View layoutCatAo = view.findViewById(R.id.layoutCatAo);
        View layoutCatPhuKien = view.findViewById(R.id.layoutCatPhuKien);

        if (layoutCatVay != null) {
            layoutCatVay.setOnClickListener(v -> openCategoryByName("Váy"));
        }
        if (layoutCatAo != null) {
            layoutCatAo.setOnClickListener(v -> openCategoryByName("Áo"));
        }
        if (layoutCatPhuKien != null) {
            layoutCatPhuKien.setOnClickListener(v -> openCategoryByName("Phụ kiện"));
        }

        // Search trigger
        if (ivSearch != null) {
            ivSearch.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(1); // Page 1 is Search
                }
            });
        }

        // Cart trigger
        if (ivNotification != null) {
            ivNotification.setOnClickListener(v -> {
                if (getActivity() != null) {
                    startActivity(new Intent(requireContext(), CartActivity.class));
                }
            });
        }

        // See all trigger
        View tvSeeAll = view.findViewById(R.id.tvSeeAll);
        if (tvSeeAll != null) {
            tvSeeAll.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(2); // Redirect to categories
                }
            });
        }

        loadCategories();
        loadFavoriteIds();
        loadNewArrivals();
        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        loadFavoriteIds();
        loadNewArrivals();
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
            }
        });
    }

    private void showCategories(List<CategoryItem> categories) {
        loadedCategoryItems.clear();
        if (categories != null) {
            loadedCategoryItems.addAll(categories);
        }
    }

    private void openCategoryByName(String name) {
        CategoryItem target = null;
        for (CategoryItem item : loadedCategoryItems) {
            if (item.getName() != null && item.getName().toLowerCase().contains(name.toLowerCase())) {
                target = item;
                break;
            }
        }
        if (target != null) {
            Intent intent = new Intent(requireContext(), ProductListActivity.class);
            intent.putExtra("CATEGORY_ID", target.getId());
            intent.putExtra("CATEGORY_NAME", target.getName());
            startActivity(intent);
        } else {
            Toast.makeText(requireContext(), "Đang kết nối danh mục " + name + ", vui lòng thử lại.", Toast.LENGTH_SHORT).show();
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
}
