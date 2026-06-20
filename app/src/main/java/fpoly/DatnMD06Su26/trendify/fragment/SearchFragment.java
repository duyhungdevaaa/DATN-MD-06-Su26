package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.LoginActivity;
import fpoly.DatnMD06Su26.trendify.adapter.ProductAdapter;
import fpoly.DatnMD06Su26.trendify.model.ProductItem;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SearchFragment extends Fragment {

    private EditText etSearch;
    private RecyclerView rvSearchResults;
    private TextView tvNoResults;
    private TextView tvRecent;
    private LinearLayout llStaticContent;
    private LinearLayout llRecentSearches;
    private ChipGroup cgTrending;
    private ProductAdapter searchAdapter;
    private List<ProductItem> allProducts = new ArrayList<>();
    private List<String> recentSearches = new ArrayList<>();
    private final List<String> trendingKeywords = Arrays.asList("Váy hè", "Giày thể thao", "Túi xách", "Kính mát");
    private Set<String> favoriteIds = new HashSet<>();
    private static final String SEARCH_PREFS = "search_prefs";
    private static final String KEY_RECENT = "recent_searches";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_search, container, false);

        etSearch = view.findViewById(R.id.etSearch);
        rvSearchResults = view.findViewById(R.id.rvSearchResults);
        tvNoResults = view.findViewById(R.id.tvNoResults);
        tvRecent = view.findViewById(R.id.tvRecent);
        llStaticContent = view.findViewById(R.id.llStaticContent);
        llRecentSearches = view.findViewById(R.id.llRecentSearches);
        cgTrending = view.findViewById(R.id.cgTrending);

        rvSearchResults.setLayoutManager(new GridLayoutManager(requireContext(), 2));
        searchAdapter = new ProductAdapter(new ArrayList<>(), favoriteIds, this::handleFavoriteToggle);
        rvSearchResults.setAdapter(searchAdapter);

        loadRecentSearches();
        setupTrendingChips();
        loadAllProducts();
        loadFavoriteIds();

        etSearch.setOnEditorActionListener((textView, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                String query = etSearch.getText() != null ? etSearch.getText().toString().trim() : "";
                if (!query.isEmpty()) {
                    performSearch(query);
                    addRecentSearch(query);
                }
                return true;
            }
            return false;
        });

        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String query = s.toString().trim();
                if (query.isEmpty()) {
                    showStaticContent();
                } else {
                    performSearch(query);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        return view;
    }

    private void loadAllProducts() {
        FirestoreHelper.loadAllProducts(new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                allProducts = products;
                if (etSearch.getText() != null && !etSearch.getText().toString().trim().isEmpty()) {
                    performSearch(etSearch.getText().toString().trim());
                }
            }

            @Override
            public void onFailure(String error) {
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Lỗi tải dữ liệu: " + error, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void loadFavoriteIds() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            favoriteIds.clear();
            searchAdapter.setFavoriteIds(favoriteIds);
            return;
        }
        FirestoreHelper.loadFavoriteIds(new FirestoreHelper.FavoriteIdsCallback() {
            @Override
            public void onLoaded(List<String> ids) {
                favoriteIds.clear();
                favoriteIds.addAll(ids);
                searchAdapter.setFavoriteIds(favoriteIds);
            }

            @Override
            public void onFailure(String error) {
                Toast.makeText(requireContext(), "Không thể tải danh sách yêu thích: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadRecentSearches() {
        SharedPreferences prefs = requireContext().getSharedPreferences(SEARCH_PREFS, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY_RECENT, "");
        recentSearches.clear();
        if (!TextUtils.isEmpty(raw)) {
            try {
                JSONArray array = new JSONArray(raw);
                for (int i = 0; i < array.length(); i++) {
                    String item = array.optString(i);
                    if (!TextUtils.isEmpty(item)) {
                        recentSearches.add(item);
                    }
                }
            } catch (JSONException ignored) {
            }
        }
        updateRecentViews();
    }

    private void saveRecentSearches() {
        JSONArray array = new JSONArray();
        for (String item : recentSearches) {
            array.put(item);
        }
        requireContext().getSharedPreferences(SEARCH_PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_RECENT, array.toString())
                .apply();
    }

    private void addRecentSearch(String query) {
        if (TextUtils.isEmpty(query)) {
            return;
        }
        for (int i = 0; i < recentSearches.size(); i++) {
            if (recentSearches.get(i).equalsIgnoreCase(query)) {
                recentSearches.remove(i);
                break;
            }
        }
        recentSearches.add(0, query);
        if (recentSearches.size() > 5) {
            recentSearches = new ArrayList<>(recentSearches.subList(0, 5));
        }
        saveRecentSearches();
        updateRecentViews();
    }

    private void removeRecentSearch(String query) {
        for (int i = 0; i < recentSearches.size(); i++) {
            if (recentSearches.get(i).equalsIgnoreCase(query)) {
                recentSearches.remove(i);
                break;
            }
        }
        saveRecentSearches();
        updateRecentViews();
    }

    private void updateRecentViews() {
        llRecentSearches.removeAllViews();
        tvNoResults.setVisibility(View.GONE);
        if (recentSearches.isEmpty()) {
            tvRecent.setVisibility(View.GONE);
            return;
        }
        tvRecent.setVisibility(View.VISIBLE);
        for (String query : recentSearches) {
            LinearLayout item = new LinearLayout(requireContext());
            item.setOrientation(LinearLayout.HORIZONTAL);
            item.setGravity(Gravity.CENTER_VERTICAL);
            item.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dpToPx(48)));

            TextView text = new TextView(requireContext());
            text.setText(query);
            text.setTextColor(Color.parseColor("#000000"));
            text.setTextSize(14f);
            LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            text.setLayoutParams(textParams);
            item.addView(text);

            ImageView close = new ImageView(requireContext());
            close.setImageResource(R.drawable.ic_close);
            close.setColorFilter(Color.parseColor("#AAAAAA"));
            LinearLayout.LayoutParams closeParams = new LinearLayout.LayoutParams(dpToPx(16), dpToPx(16));
            close.setLayoutParams(closeParams);
            item.addView(close);

            item.setOnClickListener(v -> {
                etSearch.setText(query);
                etSearch.setSelection(query.length());
                performSearch(query);
            });
            close.setOnClickListener(v -> removeRecentSearch(query));
            llRecentSearches.addView(item);
        }
    }

    private void setupTrendingChips() {
        cgTrending.removeAllViews();
        for (String keyword : trendingKeywords) {
            Chip chip = new Chip(requireContext());
            chip.setText(keyword);
            chip.setTextColor(Color.BLACK);
            chip.setChipBackgroundColor(ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
            chip.setClickable(true);
            chip.setCheckable(false);
            chip.setOnClickListener(v -> {
                etSearch.setText(keyword);
                etSearch.setSelection(keyword.length());
                performSearch(keyword);
                addRecentSearch(keyword);
            });
            cgTrending.addView(chip);
        }
    }

    private int dpToPx(int dp) {
        return (int) (dp * requireContext().getResources().getDisplayMetrics().density);
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
                    searchAdapter.setFavoriteIds(favoriteIds);
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
                    searchAdapter.setFavoriteIds(favoriteIds);
                    Toast.makeText(requireContext(), "Đã gỡ khỏi yêu thích", Toast.LENGTH_SHORT).show();
                }

                @Override
                public void onFailure(String error) {
                    Toast.makeText(requireContext(), "Không thể gỡ khỏi yêu thích: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void performSearch(String query) {
        List<ProductItem> results = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        for (ProductItem product : allProducts) {
            if (product.getName() != null && product.getName().toLowerCase().contains(lowerQuery)) {
                results.add(product);
            }
        }

        if (results.isEmpty()) {
            rvSearchResults.setVisibility(View.GONE);
            tvNoResults.setVisibility(View.VISIBLE);
            llStaticContent.setVisibility(View.GONE);
        } else {
            rvSearchResults.setVisibility(View.VISIBLE);
            tvNoResults.setVisibility(View.GONE);
            llStaticContent.setVisibility(View.GONE);
            searchAdapter.setItems(results);
        }
    }

    private void showStaticContent() {
        rvSearchResults.setVisibility(View.GONE);
        tvNoResults.setVisibility(View.GONE);
        llStaticContent.setVisibility(View.VISIBLE);
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import fpoly.DatnMD06Su26.trendify.R;

public class SearchFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_search, container, false);
    }
}
