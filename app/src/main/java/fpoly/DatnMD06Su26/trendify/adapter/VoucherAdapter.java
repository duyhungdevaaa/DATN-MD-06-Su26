package fpoly.DatnMD06Su26.trendify.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.Voucher;

public class VoucherAdapter extends RecyclerView.Adapter<VoucherAdapter.VoucherViewHolder> {

    private List<Voucher> vouchers = new ArrayList<>();

    public void setItems(List<Voucher> newItems) {
        this.vouchers.clear();
        if (newItems != null) {
            this.vouchers.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VoucherViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_voucher, parent, false);
        return new VoucherViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VoucherViewHolder holder, int position) {
        Voucher voucher = vouchers.get(position);
        
        // Format title
        if (voucher.getDiscountRate() > 0) {
            holder.tvTitle.setText("Giảm " + (int) voucher.getDiscountRate() + "%");
        } else if (voucher.getDiscountAmount() > 0) {
            long k = voucher.getDiscountAmount() / 1000;
            holder.tvTitle.setText("Giảm " + k + "K");
        } else {
            holder.tvTitle.setText("Voucher");
        }

        // Format condition
        if (voucher.getMaximumDiscount() > 0) {
            long mk = voucher.getMaximumDiscount() / 1000;
            holder.tvCondition.setText("Giảm tối đa " + mk + "K");
        } else {
            holder.tvCondition.setText("Không giới hạn");
        }
        
        // Format expiry
        holder.tvExpiry.setText("HSD: " + voucher.getExpirationDate());
        
        holder.itemView.setOnClickListener(v -> {
            if (v.getContext() instanceof android.app.Activity) {
                android.app.Activity activity = (android.app.Activity) v.getContext();
                android.content.Intent data = new android.content.Intent();
                data.putExtra("selected_voucher_code", voucher.getCode());
                activity.setResult(android.app.Activity.RESULT_OK, data);
                activity.finish();
            }
        });
    }

    @Override
    public int getItemCount() {
        return vouchers.size();
    }

    static class VoucherViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvCondition, tvExpiry;

        public VoucherViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvVoucherTitle);
            tvCondition = itemView.findViewById(R.id.tvVoucherCondition);
            tvExpiry = itemView.findViewById(R.id.tvVoucherExpiry);
        }
    }
}
