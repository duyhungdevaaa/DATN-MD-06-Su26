package fpoly.DatnMD06Su26.trendify.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.BannerItem;
import java.util.List;

public class BannerAdapter extends RecyclerView.Adapter<BannerAdapter.BannerViewHolder> {
    private List<BannerItem> items;

    public BannerAdapter(List<BannerItem> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public BannerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_banner_slide, parent, false);
        return new BannerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BannerViewHolder holder, int position) {
        BannerItem item = items.get(position);
        holder.ivBannerIcon.setImageResource(item.getIconResId());
        holder.tvBannerTitle.setText(item.getTitleResId());
        holder.tvBannerDesc.setText(item.getDescriptionResId());
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class BannerViewHolder extends RecyclerView.ViewHolder {
        ImageView ivBannerIcon;
        TextView tvBannerTitle;
        TextView tvBannerDesc;

        public BannerViewHolder(@NonNull View itemView) {
            super(itemView);
            ivBannerIcon = itemView.findViewById(R.id.ivBannerIcon);
            tvBannerTitle = itemView.findViewById(R.id.tvBannerTitle);
            tvBannerDesc = itemView.findViewById(R.id.tvBannerDesc);
        }
    }
}
