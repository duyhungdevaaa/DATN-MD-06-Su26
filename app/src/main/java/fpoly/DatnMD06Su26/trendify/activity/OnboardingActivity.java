package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.OnboardingItem;
import fpoly.DatnMD06Su26.trendify.adapter.OnboardingAdapter;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import java.util.ArrayList;
import java.util.List;

public class OnboardingActivity extends AppCompatActivity {

    private ViewPager2 viewPager;
    private TabLayout tabLayout;
    private Button btnStart;
    private TextView tvSkip;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_onboarding);

        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        viewPager = findViewById(R.id.viewPager);
        tabLayout = findViewById(R.id.tabLayout);
        btnStart = findViewById(R.id.btnStart);
        tvSkip = findViewById(R.id.tvSkip);

        // Bind Skip Button
        tvSkip.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(OnboardingActivity.this, LoginActivity.class));
                finish();
            }
        });

        // Use premium vector scenes instead of simple icons
        List<OnboardingItem> items = new ArrayList<>();
        items.add(new OnboardingItem(R.drawable.scene_about_hero, R.string.onboarding_title_1, R.string.onboarding_desc_1));
        items.add(new OnboardingItem(R.drawable.scene_policy_boutique, R.string.onboarding_title_2, R.string.onboarding_desc_2));
        items.add(new OnboardingItem(R.drawable.scene_support_hero, R.string.onboarding_title_3, R.string.onboarding_desc_3));

        OnboardingAdapter adapter = new OnboardingAdapter(items);
        viewPager.setAdapter(adapter);

        new TabLayoutMediator(tabLayout, viewPager, new TabLayoutMediator.TabConfigurationStrategy() {
            @Override
            public void onConfigureTab(TabLayout.Tab tab, int position) {
                // Customize tab if needed
            }
        }).attach();

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                if (position == items.size() - 1) {
                    btnStart.setText("BẮT ĐẦU");
                } else {
                    btnStart.setText("TIẾP TỤC");
                }
            }
        });

        // Multi-stage button navigation
        btnStart.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int currentItem = viewPager.getCurrentItem();
                if (currentItem < items.size() - 1) {
                    viewPager.setCurrentItem(currentItem + 1, true);
                } else {
                    startActivity(new Intent(OnboardingActivity.this, LoginActivity.class));
                    finish();
                }
            }
        });
    }
}
