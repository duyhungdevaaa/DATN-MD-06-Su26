package fpoly.DatnMD06Su26.trendify.adapter;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

public class OrderHistoryAdapter extends RecyclerView.Adapter<OrderHistoryAdapter.OrderViewHolder> {

    private List<OrderItem> orderList;

    public OrderHistoryAdapter() {
        this.orderList = new ArrayList<>();
    }

    public void setOrderList(List<OrderItem> orderList) {
        this.orderList = orderList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order_history, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        OrderItem order = orderList.get(position);
        holder.tvOrderId.setText(order.getOrderId());
        holder.tvOrderStatus.setText(order.getStatus());
        holder.tvOrderDate.setText(order.getDate());
        holder.tvProductName.setText(order.getProductName());
        holder.tvProductQuantity.setText("SL: " + order.getQuantity());
        holder.tvProductPrice.setText(order.getPrice());
        if (order.getImageUrl() != null && !order.getImageUrl().isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(order.getImageUrl())
                    .placeholder(R.drawable.ic_shopping_bag)
                    .error(R.drawable.ic_shopping_bag)
                    .into(holder.ivProductImage);
        } else {
            holder.ivProductImage.setImageResource(R.drawable.ic_shopping_bag);
        }
        // Set status badge color based on status
        if (order.getStatus().equals("Đã giao")) {
            holder.tvOrderStatus.setTextColor(0xFF4CAF50);
        } else if (order.getStatus().equals("Đang vận chuyển")) {
            holder.tvOrderStatus.setTextColor(0xFFFF9800);
        } else {
            holder.tvOrderStatus.setTextColor(0xFF757575);
        }

        // btnViewDetails click listener removed - no action for now
        holder.btnViewDetails.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), OrderDetailActivity.class);
            intent.putExtra("orderId", order.getOrderId());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return orderList.size();
    }

    static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId;
        TextView tvOrderStatus;
        TextView tvOrderDate;
        ImageView ivProductImage;
        TextView tvProductName;
        TextView tvProductQuantity;
        TextView tvProductPrice;
        Button btnViewDetails;

        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvOrderStatus = itemView.findViewById(R.id.tvOrderStatus);
            tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
            ivProductImage = itemView.findViewById(R.id.ivProductImage);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvProductQuantity = itemView.findViewById(R.id.tvProductQuantity);
            tvProductPrice = itemView.findViewById(R.id.tvProductPrice);
            btnViewDetails = itemView.findViewById(R.id.btnViewDetails);
        }
    }
}
