package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.LoginActivity;
import fpoly.DatnMD06Su26.trendify.adapter.FavoriteAdapter;
import fpoly.DatnMD06Su26.trendify.model.ProductItem;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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
    private FavoriteAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_favorite, container, false);

        rvFavorites = view.findViewById(R.id.rvFavorites);
        tvNoFavorites = view.findViewById(R.id.tvNoFavorites);

        rvFavorites.setLayoutManager(new GridLayoutManager(requireContext(), 2));
        adapter = new FavoriteAdapter(new ArrayList<>(), this::removeFavorite);
        rvFavorites.setAdapter(adapter);

        loadFavorites();

        return view;
    }

    private void loadFavorites() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            tvNoFavorites.setText("Đăng nhập để xem sản phẩm yêu thích.");
            tvNoFavorites.setVisibility(View.VISIBLE);
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
                    tvNoFavorites.setText("Bạn chưa có sản phẩm yêu thích.");
                    tvNoFavorites.setVisibility(View.VISIBLE);
                } else {
                    tvNoFavorites.setVisibility(View.GONE);
                }
                adapter.setItems(products != null ? products : new ArrayList<>());
            }

            @Override
            public void onFailure(String error) {
                android.util.Log.e("FavoriteFragment", "loadFavorites failure: " + error);
                tvNoFavorites.setText("Không thể tải yêu thích: " + error);
                tvNoFavorites.setVisibility(View.VISIBLE);
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
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import fpoly.DatnMD06Su26.trendify.R;

public class FavoriteFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_favorite, container, false);
    }
}
