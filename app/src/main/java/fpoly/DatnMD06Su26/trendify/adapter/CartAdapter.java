package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;

import com.bumptech.glide.Glide;
import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.CartViewHolder> {

    private List<CartItem> items = new ArrayList<>();
    private final CartManager cartManager;

    public CartAdapter(CartManager cartManager) {
        this.cartManager = cartManager;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CartViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_cart, parent, false);
        return new CartViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CartViewHolder holder, int position) {
        CartItem item = items.get(position);
        holder.tvItemName.setText(item.getName());
        holder.tvItemPrice.setText(item.getPrice());
        holder.tvQuantity.setText(String.valueOf(item.getQuantity()));

        if ((item.getSize() != null && !item.getSize().isEmpty()) || (item.getColor() != null && !item.getColor().isEmpty())) {
            StringBuilder variantText = new StringBuilder();
            if (item.getSize() != null && !item.getSize().isEmpty()) {
                variantText.append("Size: ").append(item.getSize());
            }
            if (item.getColor() != null && !item.getColor().isEmpty()) {
                if (variantText.length() > 0) variantText.append(" | ");
                variantText.append("Màu: ").append(item.getColor());
            }
            holder.tvItemVariant.setText(variantText.toString());
            holder.tvItemVariant.setVisibility(View.VISIBLE);
        } else {
            holder.tvItemVariant.setText("");
            holder.tvItemVariant.setVisibility(View.GONE);
        }

        Glide.with(holder.ivItemImage.getContext())
                .load(item.getImageUrl())
                .centerCrop()
                .into(holder.ivItemImage);

        holder.btnIncrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() + 1;
            cartManager.updateQuantity(item.getCartItemId(), newQty, new CartManager.CartCallback() {
                @Override public void onSuccess() {
                    item.setQuantity(newQty);
                    notifyItemChanged(position);
                }
                @Override public void onFailure(String error) {}
            });
        });

        holder.btnDecrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() - 1;
            cartManager.updateQuantity(item.getCartItemId(), newQty, new CartManager.CartCallback() {
                @Override public void onSuccess() {
                    if (newQty <= 0) {
                        items.remove(position);
                        notifyItemRemoved(position);
                    } else {
                        item.setQuantity(newQty);
                        notifyItemChanged(position);
                    }
                }
                @Override public void onFailure(String error) {}
            });
        });

        /*
        holder.btnDelete.setOnClickListener(v -> {
            cartManager.removeFromCart(item.getCartItemId(), new CartManager.CartCallback() {
                @Override public void onSuccess() {
                    items.remove(position);
                    notifyItemRemoved(position);
                }
                @Override public void onFailure(String error) {}
            });
        });
        */
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class CartViewHolder extends RecyclerView.ViewHolder {
        TextView tvItemName, tvItemPrice, tvQuantity, tvItemVariant;
        TextView btnIncrease, btnDecrease;
        // ImageView btnDelete;
        ImageView ivItemImage;

        CartViewHolder(View view) {
            super(view);
            tvItemName  = view.findViewById(R.id.tvItemName);
            tvItemPrice = view.findViewById(R.id.tvItemPrice);
            tvQuantity  = view.findViewById(R.id.tvQuantity);
            tvItemVariant = view.findViewById(R.id.tvItemVariant);
            btnIncrease = view.findViewById(R.id.btnIncrease);
            btnDecrease = view.findViewById(R.id.btnDecrease);
            // btnDelete   = view.findViewById(R.id.btnDelete);
            ivItemImage = view.findViewById(R.id.ivItemImage);
        }
    }
}