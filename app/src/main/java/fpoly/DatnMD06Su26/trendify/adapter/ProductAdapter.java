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
        
        SpannableStringBuilder builder = new SpannableStringBuilder();
        if (item.getQuantity() <= 0) {
            builder.append("[HẾT HÀNG] ");
            builder.setSpan(new ForegroundColorSpan(Color.GRAY), 0, 11, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            builder.setSpan(new StyleSpan(Typeface.BOLD), 0, 11, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        builder.append(item.getName());
        holder.tvProductName.setText(builder);
        
        if (item.getDiscount() > 0) {
            holder.tvProductPrice.setText(formatPrice(item.getDiscountedPrice()));
            if (holder.tvProductOriginalPrice != null) {
                holder.tvProductOriginalPrice.setVisibility(View.VISIBLE);
                holder.tvProductOriginalPrice.setText(formatPrice(item.getPrice()));
                holder.tvProductOriginalPrice.setPaintFlags(holder.tvProductOriginalPrice.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
            }
        } else {
            holder.tvProductPrice.setText(formatPrice(item.getPrice()));
            if (holder.tvProductOriginalPrice != null) {
                holder.tvProductOriginalPrice.setVisibility(View.GONE);
            }
        }
        
        Glide.with(holder.ivProductImage.getContext())
                .load(item.getImageUrl())
                .centerCrop()
                .into(holder.ivProductImage);

        if (holder.tvSoldCount != null) {
            holder.tvSoldCount.setText("Đã bán " + item.getSoldCount());
        }

        if (holder.llDiscountTag != null && holder.tvDiscountPercent != null) {
            if (item.getDiscount() > 0) {
                holder.llDiscountTag.setVisibility(View.VISIBLE);
                holder.tvDiscountPercent.setText((int)item.getDiscount() + "%");
            } else {
                holder.llDiscountTag.setVisibility(View.GONE);
            }
        }

        boolean isFavorite = favoriteIds.contains(item.getId());
        if (holder.ivFavorite != null) {
            holder.ivFavorite.setColorFilter(isFavorite ? Color.RED : Color.parseColor("#CCCCCC"));
            holder.ivFavorite.setOnClickListener(v -> {
                if (favoriteListener != null) {
                    favoriteListener.onFavoriteToggle(item, !isFavorite);
                }
            });
        }

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

    private String formatPrice(String priceStr) {
        if (priceStr == null || priceStr.isEmpty()) return "";
        try {
            double price = Double.parseDouble(priceStr);
            return "đ" + String.format(java.util.Locale.US, "%,d", (long) price).replace(',', '.');
        } catch (Exception e) {
            return priceStr.startsWith("đ") ? priceStr : "đ" + priceStr;
        }
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
        TextView tvProductOriginalPrice;
        ImageView ivFavorite;
        ImageView ivProductImage;
        TextView tvSoldCount;
        View llDiscountTag;
        TextView tvDiscountPercent;

        ProductViewHolder(View view) {
            super(view);
            tvProductName = view.findViewById(R.id.tvProductName);
            tvProductPrice = view.findViewById(R.id.tvProductPrice);
            tvProductOriginalPrice = view.findViewById(R.id.tvProductOriginalPrice);
            ivFavorite = view.findViewById(R.id.ivFavorite);
            ivProductImage = view.findViewById(R.id.ivProductImage);
            tvSoldCount = view.findViewById(R.id.tvSoldCount);
            llDiscountTag = view.findViewById(R.id.llDiscountTag);
            tvDiscountPercent = view.findViewById(R.id.tvDiscountPercent);
        }
    }
}
