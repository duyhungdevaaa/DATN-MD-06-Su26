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

import java.util.ArrayList;
import java.util.List;

public class FavoriteFragment extends Fragment {

    private RecyclerView rvFavorites;
    private TextView tvNoFavorites;
    private View layoutEmptyState;
    private FavoriteAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_favorite, container, false);

        ImageView ivSearch = view.findViewById(R.id.ivSearch);
        ImageView ivNotification = view.findViewById(R.id.ivNotification);
        ImageView ivMenu = view.findViewById(R.id.ivMenu);

        if (ivMenu != null) {
            ivMenu.setOnClickListener(v -> Toast.makeText(requireContext(), "Menu chính", Toast.LENGTH_SHORT).show());
        }
        if (ivSearch != null) {
            ivSearch.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(1);
                }
            });
        }
        if (ivNotification != null) {
            ivNotification.setOnClickListener(v -> {
                startActivity(new Intent(requireContext(), CartActivity.class));
            });
        }

        rvFavorites = view.findViewById(R.id.rvFavorites);
        tvNoFavorites = view.findViewById(R.id.tvNoFavorites);
        layoutEmptyState = view.findViewById(R.id.layoutEmptyState);

        rvFavorites.setLayoutManager(new GridLayoutManager(requireContext(), 2));
        adapter = new FavoriteAdapter(new ArrayList<>(), this::removeFavorite);
        rvFavorites.setAdapter(adapter);

        // Bind Explore button on Empty State
        View btnExploreFavorites = view.findViewById(R.id.btnExploreFavorites);
        if (btnExploreFavorites != null) {
            btnExploreFavorites.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(0); // Page 0 is Home
                }
            });
        }

        loadFavorites();

        return view;
    }

    private void loadFavorites() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            if (tvNoFavorites != null) tvNoFavorites.setText("Đăng nhập để xem sản phẩm yêu thích.");
            if (layoutEmptyState != null) layoutEmptyState.setVisibility(View.VISIBLE);
            adapter.setItems(new ArrayList<>());
            android.util.Log.d("FavoriteFragment", "loadFavorites: User not logged in");
            return;
        }

        android.util.Log.d("FavoriteFragment", "loadFavorites: Fetching favorite products for user " + SessionManager.getInstance().getUserId());

        FirestoreHelper.loadFavoriteProducts(new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                android.util.Log.d("FavoriteFragment", "loadFavorites success: Loaded " + (products != null ? products.size() : 0) + " products");
                if (products == null || products.isEmpty()) {
                    if (tvNoFavorites != null) tvNoFavorites.setText("Bạn chưa có sản phẩm yêu thích. Hãy khám phá bộ sưu tập mới nhất để thêm những món đồ yêu thích.");
                    if (layoutEmptyState != null) layoutEmptyState.setVisibility(View.VISIBLE);
                } else {
                    if (layoutEmptyState != null) layoutEmptyState.setVisibility(View.GONE);
                }
                adapter.setItems(products != null ? products : new ArrayList<>());
            }

            @Override
            public void onFailure(String error) {
                android.util.Log.e("FavoriteFragment", "loadFavorites failure: " + error);
                if (tvNoFavorites != null) tvNoFavorites.setText("Không thể tải yêu thích: " + error);
                if (layoutEmptyState != null) layoutEmptyState.setVisibility(View.VISIBLE);
                adapter.setItems(new ArrayList<>());
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        android.util.Log.d("FavoriteFragment", "onResume: reloading favorites...");
        loadFavorites();
    }

    private void removeFavorite(ProductItem item) {
        FirestoreHelper.removeFavoriteProduct(item.getId(), new FirestoreHelper.SimpleCallback() {
            @Override
            public void onSuccess() {
                Toast.makeText(requireContext(), "Đã bỏ yêu thích", Toast.LENGTH_SHORT).show();
                loadFavorites();
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể bỏ yêu thích: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
