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
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
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
        
        // Load product image using Glide
        if (order.getImageUrl() != null && !order.getImageUrl().isEmpty()) {
            Glide.with(holder.ivProductImage.getContext())
                    .load(order.getImageUrl())
                    .centerCrop()
                    .into(holder.ivProductImage);
        } else {
            holder.ivProductImage.setImageResource(R.drawable.ic_shopping_bag);
        }
        
        // Set status badge background color based on status
        int backgroundColor;
        if (order.getStatus().equals("Đã giao")) {
            backgroundColor = 0xFF4CAF50; // Green
        } else if (order.getStatus().equals("Đang vận chuyển")) {
            backgroundColor = 0xFFFF9800; // Orange
        } else if (order.getStatus().equals("Đang xử lý")) {
            backgroundColor = 0xFFEE4D2D; // Red
        } else if (order.getStatus().equals("Đã hủy")) {
            backgroundColor = 0xFF757575; // Grey
        } else {
            backgroundColor = 0xFF2196F3; // Blue (default)
        }
        
        holder.tvOrderStatus.setTextColor(0xFFFFFFFF); // White text
        holder.tvOrderStatus.getBackground().setTint(backgroundColor);

        holder.btnViewDetails.setOnClickListener(v -> {
            android.content.Intent intent = new android.content.Intent(v.getContext(), OrderDetailActivity.class);
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
