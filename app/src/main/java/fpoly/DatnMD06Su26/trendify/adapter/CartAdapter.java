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

    public interface OnCartItemSelectionChangedListener {
        void onSelectionChanged();
    }

    private List<CartItem> items = new ArrayList<>();
    private final CartManager cartManager;
    private OnCartItemSelectionChangedListener selectionListener;

    public CartAdapter(CartManager cartManager) {
        this.cartManager = cartManager;
    }

    public void setSelectionListener(OnCartItemSelectionChangedListener listener) {
        this.selectionListener = listener;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
        notifyDataSetChanged();
    }

    public List<CartItem> getItems() {
        return items;
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

        holder.cbSelect.setOnCheckedChangeListener(null);
        holder.cbSelect.setChecked(item.isSelected());
        holder.cbSelect.setOnCheckedChangeListener((buttonView, isChecked) -> {
            item.setSelected(isChecked);
            if (selectionListener != null) {
                selectionListener.onSelectionChanged();
            }
        });

        holder.btnIncrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() + 1;
            if (newQty > item.getMaxQuantity()) {
                android.widget.Toast.makeText(holder.itemView.getContext(), "Đã đạt giới hạn tồn kho (" + item.getMaxQuantity() + ")", android.widget.Toast.LENGTH_SHORT).show();
                return;
            }
            cartManager.updateQuantity(item.getCartItemId(), newQty, new CartManager.CartCallback() {
                @Override public void onSuccess() {
                    item.setQuantity(newQty);
                    notifyItemChanged(position);
                    if (selectionListener != null) {
                        selectionListener.onSelectionChanged();
                    }
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
                    if (selectionListener != null) {
                        selectionListener.onSelectionChanged();
                    }
                }
                @Override public void onFailure(String error) {}
            });
        });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class CartViewHolder extends RecyclerView.ViewHolder {
        TextView tvItemName, tvItemPrice, tvQuantity, tvItemVariant;
        TextView btnIncrease, btnDecrease;
        android.widget.CheckBox cbSelect;
        ImageView ivItemImage;

        CartViewHolder(View view) {
            super(view);
            tvItemName  = view.findViewById(R.id.tvItemName);
            tvItemPrice = view.findViewById(R.id.tvItemPrice);
            tvQuantity  = view.findViewById(R.id.tvQuantity);
            tvItemVariant = view.findViewById(R.id.tvItemVariant);
            btnIncrease = view.findViewById(R.id.btnIncrease);
            btnDecrease = view.findViewById(R.id.btnDecrease);
            cbSelect    = view.findViewById(R.id.cbSelect);
            ivItemImage = view.findViewById(R.id.ivItemImage);
        }
    }
}