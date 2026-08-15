package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.helper.TrendifyNavHelper;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class NotificationsActivity extends AppCompatActivity {

    private RecyclerView rvNotifications;
    private TextView tvEmpty;
    private NotificationAdapter adapter;
    private List<DocumentSnapshot> notificationsList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), systemBars.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        ImageView ivBack = findViewById(R.id.ivBack);
        ivBack.setOnClickListener(v -> finish());

        rvNotifications = findViewById(R.id.rvNotifications);
        tvEmpty = findViewById(R.id.tvEmpty);

        androidx.compose.ui.platform.ComposeView composeBottomNav = findViewById(R.id.composeBottomNav);
        if (composeBottomNav != null) {
            TrendifyNavHelper.bind(composeBottomNav, 4, this);
        }

        rvNotifications.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NotificationAdapter();
        rvNotifications.setAdapter(adapter);

        loadNotifications();
    }

    private void loadNotifications() {
        FirebaseFirestore.getInstance().collection("notifications")
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .addSnapshotListener((value, error) -> {
                    if (error != null) {
                        return;
                    }
                    if (value != null) {
                        notificationsList.clear();
                        String currentUid = fpoly.DatnMD06Su26.trendify.SessionManager.getInstance().getUserId();
                        for (DocumentSnapshot doc : value.getDocuments()) {
                            String targetUid = doc.getString("userId");
                            if (targetUid == null || targetUid.isEmpty() || targetUid.equals("global") || targetUid.equals(currentUid)) {
                                notificationsList.add(doc);
                            }
                        }
                        adapter.notifyDataSetChanged();

                        if (notificationsList.isEmpty()) {
                            tvEmpty.setVisibility(View.VISIBLE);
                            rvNotifications.setVisibility(View.GONE);
                        } else {
                            tvEmpty.setVisibility(View.GONE);
                            rvNotifications.setVisibility(View.VISIBLE);
                        }
                    }
                });
    }

    private class NotificationAdapter extends RecyclerView.Adapter<NotificationViewHolder> {

        @NonNull
        @Override
        public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_notification, parent, false);
            return new NotificationViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
            DocumentSnapshot doc = notificationsList.get(position);
            String title = doc.getString("title");
            String body = doc.getString("body");
            String imageUrl = doc.getString("imageUrl");
            com.google.firebase.Timestamp timestamp = doc.getTimestamp("createdAt");

            holder.tvTitle.setText(title != null ? title : "");
            holder.tvBody.setText(body != null ? body : "");

            if (timestamp != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm - dd/MM/yyyy", Locale.getDefault());
                holder.tvTime.setText(sdf.format(timestamp.toDate()));
            } else {
                holder.tvTime.setText("");
            }

            if (imageUrl != null && !imageUrl.isEmpty()) {
                Glide.with(holder.itemView.getContext())
                        .load(imageUrl)
                        .placeholder(R.drawable.ic_notifications)
                        .error(R.drawable.ic_notifications)
                        .into(holder.ivImage);
                holder.ivImage.setPadding(0, 0, 0, 0);
                holder.ivImage.clearColorFilter();
            } else {
                holder.ivImage.setImageResource(R.drawable.ic_notifications);
                int padding = (int) (12 * holder.itemView.getContext().getResources().getDisplayMetrics().density);
                holder.ivImage.setPadding(padding, padding, padding, padding);
                holder.ivImage.setColorFilter(android.graphics.Color.BLACK);
            }
        }

        @Override
        public int getItemCount() {
            return notificationsList.size();
        }
    }

    private static class NotificationViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvBody, tvTime;
        ImageView ivImage;

        public NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvNotifTitle);
            tvBody = itemView.findViewById(R.id.tvNotifBody);
            tvTime = itemView.findViewById(R.id.tvNotifTime);
            ivImage = itemView.findViewById(R.id.ivNotifImage);
        }
    }
}
