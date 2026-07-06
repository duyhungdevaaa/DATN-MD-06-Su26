package fpoly.DatnMD06Su26.trendify;

import fpoly.DatnMD06Su26.trendify.activity.CartActivity;
import fpoly.DatnMD06Su26.trendify.adapter.ScreenPagerAdapter;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.CartActivity;
import fpoly.DatnMD06Su26.trendify.adapter.ScreenPagerAdapter;

import android.content.Intent;
import android.os.Bundle;

import android.content.Intent;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.bottomnavigation.BottomNavigationView;

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

        ScreenPagerAdapter adapter = new ScreenPagerAdapter(this);
        viewPager.setAdapter(adapter);
        viewPager.setUserInputEnabled(false); // Disable horizontal swipe to change tabs

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
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

        findViewById(R.id.fabCart).setOnClickListener(v -> {
            startActivity(new Intent(MainActivity.this, CartActivity.class));
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
    }

    public void setCurrentPage(int page) {
        if (viewPager != null) {
            viewPager.setCurrentItem(page, false);
        }
    }
}