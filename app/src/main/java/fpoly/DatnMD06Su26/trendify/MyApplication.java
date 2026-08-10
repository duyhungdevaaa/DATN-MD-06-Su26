package fpoly.DatnMD06Su26.trendify;

import android.app.Application;

public class MyApplication extends Application {

    private int startedActivityCount = 0;
    public static boolean isBackFromBackground = false;
    private boolean isAppInitiallyLaunched = true;

    @Override
    public void onCreate() {
        super.onCreate();
        SessionManager.init(this);
        app.rive.runtime.kotlin.core.Rive.INSTANCE.init(this, app.rive.runtime.kotlin.core.RendererType.Rive);

        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override
            public void onActivityCreated(android.app.Activity activity, android.os.Bundle savedInstanceState) {}

            @Override
            public void onActivityStarted(android.app.Activity activity) {
                if (startedActivityCount == 0) {
                    if (!isAppInitiallyLaunched) {
                        isBackFromBackground = true;
                    } else {
                        isAppInitiallyLaunched = false;
                    }
                }
                startedActivityCount++;
            }

            @Override
            public void onActivityResumed(android.app.Activity activity) {}

            @Override
            public void onActivityPaused(android.app.Activity activity) {}

            @Override
            public void onActivityStopped(android.app.Activity activity) {
                startedActivityCount--;
            }

            @Override
            public void onActivitySaveInstanceState(android.app.Activity activity, android.os.Bundle outState) {}

            @Override
            public void onActivityDestroyed(android.app.Activity activity) {}
        });
    }
}
