package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.ProductDetailActivity;
import fpoly.DatnMD06Su26.trendify.model.ProductItem;

import android.content.Intent;
import com.bumptech.glide.Glide;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class FavoriteAdapter extends RecyclerView.Adapter<FavoriteAdapter.FavoriteViewHolder> {

    public interface OnFavoriteRemoveListener {
        void onFavoriteRemove(ProductItem item);
    }

    private List<ProductItem> items;
    private OnFavoriteRemoveListener removeListener;

    public FavoriteAdapter(List<ProductItem> items, OnFavoriteRemoveListener removeListener) {
        this.items = items;
        this.removeListener = removeListener;
    }

    @NonNull
    @Override
    public FavoriteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_favorite, parent, false);
        return new FavoriteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FavoriteViewHolder holder, int position) {
        ProductItem item = items.get(position);
        holder.tvProductName.setText(item.getName());
        holder.tvProductPrice.setText(item.getPrice());

        Glide.with(holder.ivProductImage.getContext())
                .load(item.getImageUrl())
                .centerCrop()
                .into(holder.ivProductImage);

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), ProductDetailActivity.class);
            intent.putExtra("PRODUCT_ID", item.getId());
            intent.putExtra("PRODUCT_NAME", item.getName());
            intent.putExtra("PRODUCT_PRICE", item.getPrice());
            intent.putExtra("PRODUCT_IMAGE", item.getImageUrl());
            v.getContext().startActivity(intent);
        });

        holder.ivFavorite.setOnClickListener(v -> {
            if (removeListener != null) {
                removeListener.onFavoriteRemove(item);
            }
        });

        holder.btnAddCart.setOnClickListener(v -> {
            Toast.makeText(v.getContext(), "Đã thêm vào giỏ hàng", Toast.LENGTH_SHORT).show();
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

    static class FavoriteViewHolder extends RecyclerView.ViewHolder {
        TextView tvProductName;
        TextView tvProductPrice;
        Button btnAddCart;
        ImageView ivFavorite;
        ImageView ivProductImage;

        FavoriteViewHolder(View view) {
            super(view);
            tvProductName = view.findViewById(R.id.tvProductName);
            tvProductPrice = view.findViewById(R.id.tvProductPrice);
            btnAddCart = view.findViewById(R.id.btnAddCart);
            ivFavorite = view.findViewById(R.id.ivFavorite);
            ivProductImage = view.findViewById(R.id.ivProductImage);
        }
    }
}
