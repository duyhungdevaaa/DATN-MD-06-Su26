package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
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
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;
import fpoly.DatnMD06Su26.trendify.R;

public class CategoryFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_category, container, false);
        
        View searchBarContainer = view.findViewById(R.id.searchBarContainer);
        if (searchBarContainer != null) {
            searchBarContainer.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(1); // Page 1 is Search
                }
            });
        }

        ImageView ivCart = view.findViewById(R.id.ivCart);
        if (ivCart != null) {
            ivCart.setOnClickListener(v -> {
                startActivity(new Intent(requireContext(), CartActivity.class));
            });
        }

        ImageView ivSubCategoryBanner = view.findViewById(R.id.ivSubCategoryBanner);
        if (ivSubCategoryBanner != null) {
            com.bumptech.glide.Glide.with(this)
                .load("https://lh3.googleusercontent.com/aida-public/AB6AXuCAxhHQooyU8SiIwiH0Pbzuw1-uZdod_ngqcegoqttRqmzHPL_nqur3okOg4NBrK-yzBHV5e93Q3F9aKdDsai8MXvmlmuHPwCZazU_f6Bv2IHQ-KjmCI8oO-ac873DWgJdX2XZKKTRIR_hsK9p63PbP0tCXX2tS_-L3FbFQnlmCx8rxU9RVo8BRfF_DBp7RBJjbOy_h4N7H-N5AoQgvbi3LD2GWZnZGRsJD2UGfUDUpAksAejImy6j_B1zkcJmBAO6MDG7BDEb1kTw")
                .centerCrop()
                .into(ivSubCategoryBanner);
        }

        RecyclerView rvLeftCategories = view.findViewById(R.id.rvLeftCategories);
        RecyclerView rvRightCategories = view.findViewById(R.id.rvRightCategories);

        // Dummy left categories
        List<String> leftCategories = new ArrayList<>();
        leftCategories.add("Thời Trang Nam");
        leftCategories.add("Thời Trang Nữ");
        leftCategories.add("Điện Thoại & Phụ Kiện");
        leftCategories.add("Mẹ & Bé");
        leftCategories.add("Thiết Bị Điện Tử");
        leftCategories.add("Nhà Cửa & Đời Sống");
        leftCategories.add("Sắc Đẹp");
        leftCategories.add("Sức Khỏe");
        leftCategories.add("Giày Dép Nữ");
        leftCategories.add("Giày Dép Nam");

        LeftCategoryAdapter leftAdapter = new LeftCategoryAdapter(leftCategories, position -> {
            // Right now, we just reload all items from firestore since we don't have sub-categories
            loadRightCategories(rvRightCategories);
        });
        rvLeftCategories.setAdapter(leftAdapter);

        loadRightCategories(rvRightCategories);

        return view;
    }

    private void loadRightCategories(RecyclerView rvRightCategories) {
        FirestoreHelper.loadCategories(new FirestoreHelper.CategoriesCallback() {
            @Override
            public void onLoaded(List<CategoryItem> categories) {
                RightCategoryAdapter rightAdapter = new RightCategoryAdapter(categories);
                rvRightCategories.setAdapter(rightAdapter);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể tải danh mục: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }

    public interface OnItemClickListener {
        void onItemClick(int position);
    }

    private class LeftCategoryAdapter extends RecyclerView.Adapter<LeftCategoryAdapter.ViewHolder> {
        private final List<String> items;
        private int selectedPosition = 0;
        private final OnItemClickListener listener;

        public LeftCategoryAdapter(List<String> items, OnItemClickListener listener) {
            this.items = items;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_category_left, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            String name = items.get(position);
            holder.tvCategoryName.setText(name);

            if (selectedPosition == position) {
                holder.itemView.setBackgroundColor(android.graphics.Color.WHITE);
                holder.tvCategoryName.setTextColor(android.graphics.Color.parseColor("#EE4D2D"));
                holder.tvCategoryName.setTypeface(null, android.graphics.Typeface.BOLD);
                holder.indicator.setVisibility(View.VISIBLE);
            } else {
                holder.itemView.setBackgroundColor(android.graphics.Color.parseColor("#F5F5F5"));
                holder.tvCategoryName.setTextColor(android.graphics.Color.parseColor("#333333"));
                holder.tvCategoryName.setTypeface(null, android.graphics.Typeface.NORMAL);
                holder.indicator.setVisibility(View.INVISIBLE);
            }

            holder.itemView.setOnClickListener(v -> {
                int oldPos = selectedPosition;
                selectedPosition = holder.getAdapterPosition();
                notifyItemChanged(oldPos);
                notifyItemChanged(selectedPosition);
                listener.onItemClick(selectedPosition);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvCategoryName;
            View indicator;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                tvCategoryName = itemView.findViewById(R.id.tvCategoryName);
                indicator = itemView.findViewById(R.id.indicator);
            }
        }
    }

    private class RightCategoryAdapter extends RecyclerView.Adapter<RightCategoryAdapter.ViewHolder> {
        private final List<CategoryItem> items;

        public RightCategoryAdapter(List<CategoryItem> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_category_right, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            CategoryItem item = items.get(position);
            holder.tvCategoryName.setText(item.getName());

            String imgUrl = item.getImageUrl();
            if (imgUrl != null && !imgUrl.isEmpty()) {
                com.bumptech.glide.Glide.with(holder.itemView.getContext())
                        .load(imgUrl)
                        .placeholder(R.drawable.ic_shopping_bag)
                        .error(R.drawable.ic_shopping_bag)
                        .into(holder.ivIcon);
            }

            holder.itemView.setOnClickListener(v -> {
                Intent intent = new Intent(v.getContext(), ProductListActivity.class);
                intent.putExtra("CATEGORY_ID", item.getId());
                intent.putExtra("CATEGORY_NAME", item.getName());
                v.getContext().startActivity(intent);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            ImageView ivIcon;
            TextView tvCategoryName;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                ivIcon = itemView.findViewById(R.id.ivIcon);
                tvCategoryName = itemView.findViewById(R.id.tvCategoryName);
            }
        }
    }
}
