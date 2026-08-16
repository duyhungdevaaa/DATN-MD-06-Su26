package fpoly.DatnMD06Su26.trendify.helper;

import android.app.Activity;
import androidx.compose.ui.platform.ComposeView;
import fpoly.DatnMD06Su26.trendify.compose.TrendifyNavBridge;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;

public class TrendifyNavHelper {

    public static final String EXTRA_TARGET_TAB = TrendifyNavBridge.EXTRA_TARGET_TAB;

    public interface OnTabChangeListener {
        void onTabChange(int tabIndex);
    }

    public static void bind(ComposeView composeView, int currentTabIndex, Activity activity) {
        bind(composeView, currentTabIndex, activity, null);
    }

    public static void bind(ComposeView composeView, int currentTabIndex, Activity activity, OnTabChangeListener listener) {
        if (composeView == null || activity == null) return;
        Function1<Integer, Unit> callback = null;
        if (listener != null) {
            callback = index -> {
                listener.onTabChange(index);
                return Unit.INSTANCE;
            };
        }
        TrendifyNavBridge.bind(composeView, currentTabIndex, activity, callback);
    }
}
