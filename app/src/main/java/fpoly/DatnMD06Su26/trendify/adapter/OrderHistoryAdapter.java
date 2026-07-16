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
        
        // Set status badge color based on status
        if (order.getStatus().equals("Đã giao")) {
            holder.tvOrderStatus.setTextColor(0xFF4CAF50); // Green
        } else if (order.getStatus().equals("Đang vận chuyển")) {
            holder.tvOrderStatus.setTextColor(0xFF00BCD4); // Cyan
        } else if (order.getStatus().equals("Chờ thanh toán")) {
            holder.tvOrderStatus.setTextColor(0xFFFF9800); // Orange
        } else if (order.getStatus().equals("Chờ xác nhận")) {
            holder.tvOrderStatus.setTextColor(0xFF9E9E9E); // Gray
        } else if (order.getStatus().equals("Đang chuẩn bị hàng") || order.getStatus().equals("Đang xử lý")) {
            holder.tvOrderStatus.setTextColor(0xFF9C27B0); // Purple
        } else if (order.getStatus().equals("Giao hàng thất bại")) {
            holder.tvOrderStatus.setTextColor(0xFFF44336); // Red
        } else if (order.getStatus().equals("Đang chuyển hoàn")) {
            holder.tvOrderStatus.setTextColor(0xFFFF5722); // Deep Orange
        } else if (order.getStatus().equals("Đã chuyển hoàn")) {
            holder.tvOrderStatus.setTextColor(0xFF607D8B); // Blue Gray
        } else if (order.getStatus().equals("Đã hủy")) {
            holder.tvOrderStatus.setTextColor(0xFFF44336); // Red
        } else if (order.getStatus().contains("Trả hàng/Hoàn tiền") || order.getStatus().contains("Trả hàng/Hoàn đơn") || order.getStatus().contains("Yêu cầu")) {
            holder.tvOrderStatus.setTextColor(0xFFE91E63); // Pink
        } else if (order.getStatus().equals("Đã hoàn tiền")) {
            holder.tvOrderStatus.setTextColor(0xFF4CAF50); // Green
        } else if (order.getStatus().equals("Từ chối trả hàng")) {
            holder.tvOrderStatus.setTextColor(0xFF9E9E9E); // Gray
        } else {
            holder.tvOrderStatus.setTextColor(0xFF757575);
        }

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
