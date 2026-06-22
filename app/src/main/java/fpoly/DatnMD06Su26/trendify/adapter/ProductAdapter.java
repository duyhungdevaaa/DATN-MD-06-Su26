package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.graphics.Color;
import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import android.graphics.Paint;
import android.text.SpannableStringBuilder;
import android.text.style.ForegroundColorSpan;
import android.text.style.StyleSpan;
import android.text.Spanned;
import android.graphics.Typeface;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ProductViewHolder> {

    public interface OnFavoriteToggleListener {
        void onFavoriteToggle(ProductItem item, boolean shouldAdd);
    }

    private List<ProductItem> items;
    private Set<String> favoriteIds;
    private OnFavoriteToggleListener favoriteListener;

    public ProductAdapter(List<ProductItem> items) {
        this(items, new HashSet<>(), null);
    }

    public ProductAdapter(List<ProductItem> items, Set<String> favoriteIds, OnFavoriteToggleListener favoriteListener) {
        this.items = items;
        this.favoriteIds = favoriteIds != null ? favoriteIds : new HashSet<>();
        this.favoriteListener = favoriteListener;
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_product, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        ProductItem item = items.get(position);
        
        // Generate a colored badge prefix: [Mall] in red/orange or just [Mall]
        SpannableStringBuilder builder = new SpannableStringBuilder();
        if (item.getQuantity() <= 0) {
            builder.append("[HẾT HÀNG] ");
            builder.setSpan(new ForegroundColorSpan(Color.GRAY), 0, 11, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            builder.setSpan(new StyleSpan(Typeface.BOLD), 0, 11, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        int hash = item.getId().hashCode();
        if (hash % 2 == 0) {
            builder.append("Mall ");
            int start = builder.length() - 5;
            builder.setSpan(new ForegroundColorSpan(Color.parseColor("#EE4D2D")), start, start + 4, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            builder.setSpan(new StyleSpan(Typeface.BOLD), start, start + 4, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        } else {
            builder.append("Yêu Thích ");
            int start = builder.length() - 10;
            builder.setSpan(new ForegroundColorSpan(Color.parseColor("#FF5722")), start, start + 9, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            builder.setSpan(new StyleSpan(Typeface.BOLD), start, start + 9, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        builder.append(item.getName());
        holder.tvProductName.setText(builder);
        
        holder.tvProductPrice.setText(item.getPrice());
        
        // Discount tag calculation
        int discountPercent = Math.abs(hash % 36) + 10; // 10% to 45%
        holder.tvDiscountBadge.setText("-" + discountPercent + "%");
        
        // Calculate original price based on current price
        long currentPriceVal = 0;
        try {
            currentPriceVal = Long.parseLong(item.getPrice().replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            currentPriceVal = 100000;
        }
        if (currentPriceVal > 0) {
            long originalPriceVal = currentPriceVal * 100 / (100 - discountPercent);
            holder.tvOriginalPrice.setText(String.format("%,dđ", originalPriceVal).replace(",", "."));
            holder.tvOriginalPrice.setPaintFlags(holder.tvOriginalPrice.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
            holder.tvOriginalPrice.setVisibility(View.VISIBLE);
        } else {
            holder.tvOriginalPrice.setVisibility(View.GONE);
        }
        
        // Mock rating and sales volume
        double rating = 4.2 + (Math.abs(hash % 9) / 10.0); // 4.2 to 5.0
        int sales = Math.abs(hash % 12000) + 12;
        String salesStr = sales >= 1000 ? String.format("%.1fk", sales / 1000.0).replace(",", ".") : String.valueOf(sales);
        holder.tvRatingSales.setText("⭐ " + String.format("%.1f", rating) + " | Đã bán " + salesStr);
        
        Glide.with(holder.ivProductImage.getContext())
                .load(item.getImageUrl())
                .centerCrop()
                .into(holder.ivProductImage);

        boolean isFavorite = favoriteIds.contains(item.getId());
        holder.ivFavorite.setColorFilter(isFavorite ? Color.RED : Color.WHITE);
        holder.ivFavorite.setOnClickListener(v -> {
            if (favoriteListener != null) {
                favoriteListener.onFavoriteToggle(item, !isFavorite);
            }
        });

        // Dim the product card if out of stock
        if (item.getQuantity() <= 0) {
            holder.itemView.setAlpha(0.4f);
        } else {
            holder.itemView.setAlpha(1.0f);
        }

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), ProductDetailActivity.class);
            intent.putExtra("PRODUCT_ID", item.getId());
            intent.putExtra("PRODUCT_NAME", item.getName());
            intent.putExtra("PRODUCT_PRICE", item.getPrice());
            intent.putExtra("PRODUCT_IMAGE", item.getImageUrl());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    public void setItems(List<ProductItem> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    public void setFavoriteIds(Set<String> favoriteIds) {
        this.favoriteIds = favoriteIds != null ? favoriteIds : new HashSet<>();
        notifyDataSetChanged();
    }

    static class ProductViewHolder extends RecyclerView.ViewHolder {
        TextView tvProductName;
        TextView tvProductPrice;
        TextView tvOriginalPrice;
        TextView tvDiscountBadge;
        TextView tvRatingSales;
        ImageView ivFavorite;
        ImageView ivProductImage;

        ProductViewHolder(View view) {
            super(view);
            tvProductName = view.findViewById(R.id.tvProductName);
            tvProductPrice = view.findViewById(R.id.tvProductPrice);
            tvOriginalPrice = view.findViewById(R.id.tvOriginalPrice);
            tvDiscountBadge = view.findViewById(R.id.tvDiscountBadge);
            tvRatingSales = view.findViewById(R.id.tvRatingSales);
            ivFavorite = view.findViewById(R.id.ivFavorite);
            ivProductImage = view.findViewById(R.id.ivProductImage);
        }
    }
}
