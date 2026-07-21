package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;
import com.bumptech.glide.Glide;
import fpoly.DatnMD06Su26.trendify.model.CartItem;
import fpoly.DatnMD06Su26.trendify.helper.CartManager;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.CartViewHolder> {

    private List<CartItem> items = new ArrayList<>();
    private final CartManager cartManager;
    private OnCartChangeListener listener;

    public interface OnCartChangeListener {
        void onQuantityChanged();
        void onSelectionChanged();
    }

    public CartAdapter(CartManager cartManager, OnCartChangeListener listener) {
        this.cartManager = cartManager;
        this.listener = listener;
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
        holder.cbSelect.setChecked(item.isSelected());

        if (!item.getSize().isEmpty() || !item.getColor().isEmpty()) {
            StringBuilder variantText = new StringBuilder("Phân loại hàng: ");
            if (!item.getSize().isEmpty()) variantText.append(item.getSize());
            if (!item.getColor().isEmpty()) {
                if (!item.getSize().isEmpty()) variantText.append(", ");
                variantText.append(item.getColor());
            }
            holder.tvItemVariant.setText(variantText.toString());
            holder.layoutVariant.setVisibility(View.VISIBLE);
        } else {
            holder.layoutVariant.setVisibility(View.GONE);
        }

        Glide.with(holder.ivItemImage.getContext())
                .load(item.getImageUrl())
                .centerCrop()
                .placeholder(R.drawable.ic_shopping_bag)
                .into(holder.ivItemImage);

        holder.cbSelect.setOnCheckedChangeListener(null);
        holder.cbSelect.setChecked(item.isSelected());
        holder.cbSelect.setOnCheckedChangeListener((buttonView, isChecked) -> {
            item.setSelected(isChecked);
            if (listener != null) listener.onSelectionChanged();
        });

        holder.btnIncrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() + 1;
            cartManager.updateQuantity(item.getCartItemId(), newQty, new CartManager.CartCallback() {
                @Override public void onSuccess() {
                    item.setQuantity(newQty);
                    notifyItemChanged(position);
                    if (listener != null) listener.onQuantityChanged();
                }
                @Override public void onFailure(String error) {}
            });
        });

        holder.btnDecrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() - 1;
            if (newQty <= 0) {
                cartManager.removeFromCart(item.getCartItemId(), new CartManager.CartCallback() {
                    @Override public void onSuccess() {
                        items.remove(position);
                        notifyItemRemoved(position);
                        notifyItemRangeChanged(position, items.size());
                        if (listener != null) listener.onQuantityChanged();
                    }
                    @Override public void onFailure(String error) {}
                });
            } else {
                cartManager.updateQuantity(item.getCartItemId(), newQty, new CartManager.CartCallback() {
                    @Override public void onSuccess() {
                        item.setQuantity(newQty);
                        notifyItemChanged(position);
                        if (listener != null) listener.onQuantityChanged();
                    }
                    @Override public void onFailure(String error) {}
                });
            }
        });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class CartViewHolder extends RecyclerView.ViewHolder {
        TextView tvItemName, tvItemPrice, tvQuantity, tvItemVariant;
        TextView btnIncrease, btnDecrease;
        ImageView ivItemImage;
        CheckBox cbSelect;
        View layoutVariant;

        CartViewHolder(View view) {
            super(view);
            tvItemName  = view.findViewById(R.id.tvItemName);
            tvItemPrice = view.findViewById(R.id.tvItemPrice);
            tvQuantity  = view.findViewById(R.id.tvQuantity);
            tvItemVariant = view.findViewById(R.id.tvItemVariant);
            btnIncrease = view.findViewById(R.id.btnIncrease);
            btnDecrease = view.findViewById(R.id.btnDecrease);
            ivItemImage = view.findViewById(R.id.ivItemImage);
            cbSelect    = view.findViewById(R.id.cbSelect);
            layoutVariant = view.findViewById(R.id.layoutVariant);
        }
    }
}