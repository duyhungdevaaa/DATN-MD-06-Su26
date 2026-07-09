package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;

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
import com.bumptech.glide.Glide;
import java.util.ArrayList;
import java.util.List;

public class OrderDetailItemAdapter extends RecyclerView.Adapter<OrderDetailItemAdapter.OrderDetailViewHolder> {

    private List<CartItem> items;

    public OrderDetailItemAdapter() {
        this.items = new ArrayList<>();
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public OrderDetailViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order_detail_product, parent, false);
        return new OrderDetailViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderDetailViewHolder holder, int position) {
        CartItem item = items.get(position);
        holder.tvProductName.setText(item.getName());
        holder.tvProductPrice.setText(item.getPrice());
        holder.tvQuantity.setText("x" + item.getQuantity());
        
        // Load product image using Glide
        if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
            Glide.with(holder.ivProductImage.getContext())
                    .load(item.getImageUrl())
                    .centerCrop()
                    .into(holder.ivProductImage);
        } else {
            holder.ivProductImage.setImageResource(R.drawable.ic_shopping_bag);
        }

        // Show variant info if available
        StringBuilder variantInfo = new StringBuilder();
        if (item.getSize() != null && !item.getSize().isEmpty()) {
            variantInfo.append("Size: ").append(item.getSize());
        }
        if (item.getColor() != null && !item.getColor().isEmpty()) {
            if (variantInfo.length() > 0) {
                variantInfo.append(" | ");
            }
            variantInfo.append("Màu: ").append(item.getColor());
        }
        
        if (variantInfo.length() > 0) {
            holder.tvVariant.setText(variantInfo.toString());
            holder.tvVariant.setVisibility(View.VISIBLE);
        } else {
            holder.tvVariant.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class OrderDetailViewHolder extends RecyclerView.ViewHolder {
        ImageView ivProductImage;
        TextView tvProductName;
        TextView tvProductPrice;
        TextView tvQuantity;
        TextView tvVariant;

        public OrderDetailViewHolder(@NonNull View itemView) {
            super(itemView);
            ivProductImage = itemView.findViewById(R.id.ivProductImage);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvProductPrice = itemView.findViewById(R.id.tvProductPrice);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvVariant = itemView.findViewById(R.id.tvVariant);
        }
    }
}
