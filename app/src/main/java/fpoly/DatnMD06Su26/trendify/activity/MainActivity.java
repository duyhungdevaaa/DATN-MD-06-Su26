package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;

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

public class MainActivity extends AppCompatActivity {

    private ViewPager2 viewPager;
    private BottomNavigationView bottomNavigationView;

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
        bottomNavigationView = findViewById(R.id.bottomNav);

        // Seeder database categories and products if empty
        // FirestoreHelper.checkAndSeedDatabase(); // Tắt seed data để tránh lỗi PERMISSION_DENIED

        ScreenPagerAdapter adapter = new ScreenPagerAdapter(this);
        viewPager.setAdapter(adapter);
        viewPager.setUserInputEnabled(false); // Disable horizontal swipe to change tabs

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            animateBottomNavIcon(id);
            if (id == R.id.nav_home) {
                viewPager.setCurrentItem(0, false);
                return true;
            } else if (id == R.id.nav_search) {
                viewPager.setCurrentItem(1, false);
                return true;
            } else if (id == R.id.nav_category) {
                viewPager.setCurrentItem(2, false);
                return true;
            } else if (id == R.id.nav_favorite) {
                viewPager.setCurrentItem(3, false);
                return true;
            } else if (id == R.id.nav_profile) {
                viewPager.setCurrentItem(4, false);
                return true;
            }
            return false;
        });



        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                if (position == 0) {
                    bottomNavigationView.setSelectedItemId(R.id.nav_home);
                } else if (position == 1) {
                    bottomNavigationView.setSelectedItemId(R.id.nav_search);
                } else if (position == 2) {
                    bottomNavigationView.setSelectedItemId(R.id.nav_category);
                } else if (position == 3) {
                    bottomNavigationView.setSelectedItemId(R.id.nav_favorite);
                } else {
                    bottomNavigationView.setSelectedItemId(R.id.nav_profile);
                }
            }
        });

        if (savedInstanceState == null) {
            bottomNavigationView.setSelectedItemId(R.id.nav_home);
        }

        findViewById(R.id.fabChat).setOnClickListener(v -> {
            android.content.Intent intent = new android.content.Intent(this, fpoly.DatnMD06Su26.trendify.activity.ChatActivity.class);
            startActivity(intent);
        });

        requestNotificationPermission();
        createNotificationChannel();
        listenToAdminNotifications();
    }

    public void setCurrentPage(int page) {
        if (viewPager != null) {
            viewPager.setCurrentItem(page, false);
        }
    }
    private void animateBottomNavIcon(int itemId) {
        try {
            BottomNavigationMenuView menuView = (BottomNavigationMenuView) bottomNavigationView.getChildAt(0);
            for (int i = 0; i < menuView.getChildCount(); i++) {
                BottomNavigationItemView itemView = (BottomNavigationItemView) menuView.getChildAt(i);
                if (itemView.getId() == itemId) {
                    View icon = itemView.findViewById(com.google.android.material.R.id.navigation_bar_item_icon_view);
                    if (icon != null) {
                        icon.setScaleX(0.7f);
                        icon.setScaleY(0.7f);
                        icon.animate()
                            .scaleX(1.2f).scaleY(1.2f)
                            .setDuration(150)
                            .withEndAction(() -> {
                                icon.animate()
                                    .scaleX(1.0f).scaleY(1.0f)
                                    .setDuration(150)
                                    .start();
                            }).start();
                    }
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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
        long appStartTime = System.currentTimeMillis();
        com.google.firebase.firestore.FirebaseFirestore.getInstance().collection("notifications")
            .addSnapshotListener((snapshots, e) -> {
                if (e != null) {
                    Log.e("MainActivity", "Listen to notifications failed", e);
                    return;
                }
                if (snapshots != null) {
                    for (com.google.firebase.firestore.DocumentChange dc : snapshots.getDocumentChanges()) {
                        if (dc.getType() == com.google.firebase.firestore.DocumentChange.Type.ADDED) {
                            com.google.firebase.firestore.QueryDocumentSnapshot doc = dc.getDocument();
                            com.google.firebase.Timestamp timestamp = doc.getTimestamp("createdAt");
                            if (timestamp != null) {
                                long notifTime = timestamp.toDate().getTime();
                                if (notifTime > appStartTime - 5000) {
                                    String title = doc.getString("title");
                                    String body = doc.getString("body");
                                    String imageUrl = doc.getString("imageUrl");
                                    showSystemNotification(title, body, imageUrl);
                                }
                            }
                        }
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

        androidx.core.app.NotificationCompat.Builder builder = new androidx.core.app.NotificationCompat.Builder(this, "trendify_notifications")
                .setSmallIcon(R.drawable.ic_notifications)
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
                        builder.setStyle(new androidx.core.app.NotificationCompat.BigPictureStyle().bigPicture(bitmap));
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
}
