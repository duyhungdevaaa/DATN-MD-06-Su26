package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.HashMap;
import java.util.Map;
import com.google.android.material.bottomnavigation.BottomNavigationMenuView;
import com.google.android.material.bottomnavigation.BottomNavigationItemView;
import android.view.View;

import androidx.compose.ui.platform.ComposeView;
import fpoly.DatnMD06Su26.trendify.compose.TrendifyNavBridge;

public class MainActivity extends AppCompatActivity {

    private ViewPager2 viewPager;
    private ComposeView composeBottomNav;
    private static com.google.firebase.firestore.ListenerRegistration notificationListener = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        viewPager = findViewById(R.id.viewPager);
        composeBottomNav = findViewById(R.id.composeBottomNav);

        ScreenPagerAdapter adapter = new ScreenPagerAdapter(this);
        viewPager.setAdapter(adapter);
        viewPager.setUserInputEnabled(false); // Disable horizontal swipe to change tabs

        int initialTab = 0;
        if (getIntent() != null && getIntent().hasExtra(TrendifyNavHelper.EXTRA_TARGET_TAB)) {
            initialTab = getIntent().getIntExtra(TrendifyNavHelper.EXTRA_TARGET_TAB, 0);
        }

        switchTab(initialTab);

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                TrendifyNavHelper.bind(composeBottomNav, position, MainActivity.this, targetIndex -> {
                    viewPager.setCurrentItem(targetIndex, false);
                });
            }
        });

        findViewById(R.id.fabChat).setOnClickListener(v -> {
            android.content.Intent intent = new android.content.Intent(this, fpoly.DatnMD06Su26.trendify.activity.ChatActivity.class);
            startActivity(intent);
        });

        requestNotificationPermission();
        createNotificationChannel();
        listenToAdminNotifications();

        // Làm mới giỏ hàng khi khởi động/tắt app mở lại
        if (SessionManager.getInstance().isLoggedIn()) {
            new CartManager().clearCart(new CartManager.CartCallback() {
                @Override
                public void onSuccess() {
                    Log.d("MainActivity", "Làm mới giỏ hàng thành công");
                }

                @Override
                public void onFailure(String error) {
                    Log.e("MainActivity", "Lỗi làm mới giỏ hàng: " + error);
                }
            });
        }
    }

    @Override
    protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.hasExtra(TrendifyNavHelper.EXTRA_TARGET_TAB)) {
            int targetTab = intent.getIntExtra(TrendifyNavHelper.EXTRA_TARGET_TAB, 0);
            switchTab(targetTab);
        }
    }

    public void switchTab(int tabIndex) {
        if (viewPager != null) {
            viewPager.setCurrentItem(tabIndex, false);
        }
        if (composeBottomNav != null) {
            TrendifyNavHelper.bind(composeBottomNav, tabIndex, this, targetIndex -> {
                if (viewPager != null) {
                    viewPager.setCurrentItem(targetIndex, false);
                }
            });
        }
    }

    public void setCurrentPage(int page) {
        switchTab(page);
    }

    private void createNotificationChannel() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            CharSequence name = "Trendify Notifications";
            String description = "Notifications from Trendify Admin";
            int importance = android.app.NotificationManager.IMPORTANCE_HIGH;
            android.app.NotificationChannel channel = new android.app.NotificationChannel("trendify_notifications", name, importance);
            channel.setDescription(description);
            android.app.NotificationManager notificationManager = getSystemService(android.app.NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void listenToAdminNotifications() {
        if (notificationListener != null) {
            notificationListener.remove();
            notificationListener = null;
        }

        android.content.SharedPreferences prefs = getSharedPreferences("trendify_prefs", android.content.Context.MODE_PRIVATE);
        long lastNotifTime = prefs.getLong("last_notif_time", System.currentTimeMillis() - 5000);

        notificationListener = com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("notifications")
            .addSnapshotListener((snapshots, e) -> {
                if (e != null) {
                    Log.e("MainActivity", "Listen to notifications failed", e);
                    return;
                }
                if (snapshots != null) {
                    long maxTime = lastNotifTime;
                    boolean hasNew = false;
                    String newTitle = null;
                    String newBody = null;
                    String newImageUrl = null;

                    for (com.google.firebase.firestore.DocumentChange dc : snapshots.getDocumentChanges()) {
                        if (dc.getType() == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                            com.google.firebase.firestore.QueryDocumentSnapshot doc = dc.getDocument();
                            String targetUid = doc.getString("userId");
                            String currentUid = fpoly.DatnMD06Su26.trendify.SessionManager.getInstance().getUserId();
                            if (targetUid == null || targetUid.isEmpty() || targetUid.equals("global") || targetUid.equals(currentUid)) {
                                com.google.firebase.Timestamp timestamp = doc.getTimestamp("createdAt");
                                if (timestamp != null) {
                                    long notifTime = timestamp.toDate().getTime();
                                    if (notifTime > lastNotifTime) {
                                        if (notifTime > maxTime) {
                                            maxTime = notifTime;
                                            newTitle = doc.getString("title");
                                            newBody = doc.getString("body");
                                            newImageUrl = doc.getString("imageUrl");
                                            hasNew = true;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (hasNew) {
                        prefs.edit().putLong("last_notif_time", maxTime).apply();
                        showSystemNotification(newTitle, newBody, newImageUrl);
                    }
                }
            });
    }

    private void showSystemNotification(String title, String body, String imageUrl) {
        android.content.Intent intent = new android.content.Intent(this, NotificationsActivity.class);
        int pendingFlags = android.app.PendingIntent.FLAG_UPDATE_CURRENT;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            pendingFlags |= android.app.PendingIntent.FLAG_IMMUTABLE;
        }
        android.app.PendingIntent pendingIntentObj = android.app.PendingIntent.getActivity(
                this, 0, intent, pendingFlags);

        android.graphics.Bitmap appLogo = android.graphics.BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);

        androidx.core.app.NotificationCompat.Builder builder = new androidx.core.app.NotificationCompat.Builder(this, "trendify_notifications")
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setLargeIcon(appLogo)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntentObj)
                .setAutoCancel(true);

        if (imageUrl != null && !imageUrl.isEmpty()) {
            new Thread(() -> {
                try {
                    android.graphics.Bitmap bitmap = com.bumptech.glide.Glide.with(MainActivity.this)
                            .asBitmap()
                            .load(imageUrl)
                            .submit()
                            .get();
                    runOnUiThread(() -> {
                        builder.setStyle(new androidx.core.app.NotificationCompat.BigPictureStyle()
                                .bigPicture(bitmap)
                                .bigLargeIcon((android.graphics.Bitmap) null));
                        postNotification(builder.build());
                    });
                } catch (Exception ex) {
                    ex.printStackTrace();
                    runOnUiThread(() -> postNotification(builder.build()));
                }
            }).start();
        } else {
            postNotification(builder.build());
        }
    }

    private void postNotification(android.app.Notification notification) {
        android.app.NotificationManager notificationManager = (android.app.NotificationManager) getSystemService(android.content.Context.NOTIFICATION_SERVICE);
        if (notificationManager != null) {
            notificationManager.notify((int) System.currentTimeMillis(), notification);
        }
    }

    private void requestNotificationPermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (androidx.core.content.ContextCompat.checkSelfPermission(this, "android.permission.POST_NOTIFICATIONS")
                    != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                androidx.core.app.ActivityCompat.requestPermissions(this,
                        new String[]{"android.permission.POST_NOTIFICATIONS"}, 101);
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (fpoly.DatnMD06Su26.trendify.MyApplication.isBackFromBackground) {
            fpoly.DatnMD06Su26.trendify.MyApplication.isBackFromBackground = false;
            showAdBannerDialog();
        }
    }

    private void showAdBannerDialog() {
        com.google.firebase.firestore.FirebaseFirestore.getInstance()
                .collection("banners")
                .document("active")
                .get()
                .addOnSuccessListener(documentSnapshot -> {
                    if (documentSnapshot.exists()) {
                        Boolean isActive = documentSnapshot.getBoolean("isActive");
                        String imageUrl = documentSnapshot.getString("imageUrl");
                        if (isActive != null && isActive && imageUrl != null && !imageUrl.isEmpty()) {
                            displayAdBannerDialog(imageUrl);
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    Log.e("MainActivity", "Failed to fetch ad banner from Firestore", e);
                });
    }

    private void displayAdBannerDialog(String adImageUrl) {
        android.app.Dialog dialog = new android.app.Dialog(this);
        dialog.setContentView(R.layout.dialog_ad_banner);
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
            dialog.getWindow().setLayout(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
        }

        android.widget.ImageView ivAdBanner = dialog.findViewById(R.id.ivAdBanner);
        android.widget.ImageView ivCloseAd = dialog.findViewById(R.id.ivCloseAd);

        com.bumptech.glide.Glide.with(this)
                .load(adImageUrl)
                .centerCrop()
                .into(ivAdBanner);

        ivCloseAd.setOnClickListener(v -> dialog.dismiss());
        ivAdBanner.setOnClickListener(v -> {
            dialog.dismiss();
            android.content.Intent intent = new android.content.Intent(this, ProductListActivity.class);
            intent.putExtra("FILTER_MODE", "SALE");
            startActivity(intent);
        });

        dialog.show();
    }
}
