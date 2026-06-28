package fpoly.DatnMD06Su26.trendify.model;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

public class OnboardingItem {
    private int iconResId;
    private int titleResId;
    private int descriptionResId;

    public OnboardingItem(int iconResId, int titleResId, int descriptionResId) {
        this.iconResId = iconResId;
        this.titleResId = titleResId;
        this.descriptionResId = descriptionResId;
    }

    public int getIconResId() {
        return iconResId;
    }

    public int getTitleResId() {
        return titleResId;
    }

    public int getDescriptionResId() {
        return descriptionResId;
    }
}
