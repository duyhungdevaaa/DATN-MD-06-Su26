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
    private RecyclerView rvFlashSale;
    private ProductAdapter newArrivalsAdapter;
    private Set<String> favoriteIds = new HashSet<>();
    private List<CategoryItem> loadedCategoryItems = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);


        rvNewArrivals = view.findViewById(R.id.rvNewArrivals);
        rvFlashSale = view.findViewById(R.id.rvFlashSale);

        // Grid layout manager with 2 columns
        rvNewArrivals.setLayoutManager(new GridLayoutManager(requireContext(), 2));
        newArrivalsAdapter = new ProductAdapter(new ArrayList<>(), favoriteIds, this::handleFavoriteToggle);
        rvNewArrivals.setAdapter(newArrivalsAdapter);

        // Bind Banner Image
        ImageView ivBanner = view.findViewById(R.id.ivBanner);
        if (ivBanner != null) {
            Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuCdMsc48mhR6FbFhVwf2WdVDCG3ETwd3L4ScSptSVOWhfBa5kC-jyrBzd-l5OIffblyBmtB_1CFC2TLR8WIgRjuYIHr7-wQF3R1gogD8R5vyn6fYEqV66sSFIFEf8uhqZtBwrwO2xICtxWX-8llozsrh0OhsDcO8uVP0CQBRbGuMD59wNtlUXON-ru1REYEgEr0mN_5SmekY0n1Tw9vo5BDOunX_gq8CH1dQnD-NYlwccoW655tFgTCr8wYr6mqYaXsM06DDc8zNso")
                .centerCrop()
                .into(ivBanner);
        }

        // Search trigger
        View searchBarContainer = view.findViewById(R.id.searchBarContainer);
        if (searchBarContainer != null) {
            searchBarContainer.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(1); // Page 1 is Search
                }
            });
        }

        // Cart trigger
        ImageView ivCart = view.findViewById(R.id.ivCart);
        if (ivCart != null) {
            ivCart.setOnClickListener(v -> {
                if (getActivity() != null) {
                    startActivity(new Intent(requireContext(), CartActivity.class));
                }
            });
        }

        // Chat/Notification trigger
        ImageView ivChat = view.findViewById(R.id.ivChat);
        if (ivChat != null) {
            ivChat.setOnClickListener(v -> {
                if (getActivity() != null) {
                    startActivity(new Intent(requireContext(), ChatActivity.class));
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
                List<ProductItem> subList = products.subList(0, count);
                newArrivalsAdapter.setItems(subList);
                
                // Giả lập dữ liệu cho Flash Sale bằng cách lấy 5 sản phẩm đầu
                int flashSaleCount = Math.min(products.size(), 5);
                rvFlashSale.setAdapter(new FlashSaleAdapter(products.subList(0, flashSaleCount)));
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

    private class FlashSaleAdapter extends RecyclerView.Adapter<FlashSaleAdapter.ViewHolder> {
        private final List<ProductItem> items;

        public FlashSaleAdapter(List<ProductItem> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_flash_sale, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            ProductItem item = items.get(position);
            holder.tvPrice.setText("đ" + item.getPrice());
            
            String imgUrl = item.getImageUrl();
            if (imgUrl != null && !imgUrl.isEmpty()) {
                Glide.with(holder.itemView.getContext())
                        .load(imgUrl)
                        .placeholder(R.drawable.ic_shopping_bag)
                        .error(R.drawable.ic_shopping_bag)
                        .centerCrop()
                        .into(holder.ivProductImage);
            }

            holder.itemView.setOnClickListener(v -> {
                Intent intent = new Intent(v.getContext(), ProductDetailActivity.class);
                intent.putExtra("PRODUCT_ID", item.getId());
                intent.putExtra("PRODUCT_NAME", item.getName());
                intent.putExtra("PRODUCT_PRICE", item.getPrice());
                intent.putExtra("PRODUCT_DESC", "");
                intent.putExtra("PRODUCT_IMAGE", item.getImageUrl());
                intent.putExtra("PRODUCT_CATEGORY", item.getCategoryId());
                v.getContext().startActivity(intent);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            ImageView ivProductImage;
            TextView tvPrice;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                ivProductImage = itemView.findViewById(R.id.ivProductImage);
                tvPrice = itemView.findViewById(R.id.tvPrice);
            }
        }
    }
}
