package fpoly.DatnMD06Su26.trendify;

import android.app.Application;

public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        SessionManager.init(this);
        app.rive.runtime.kotlin.core.Rive.INSTANCE.init(this, app.rive.runtime.kotlin.core.RendererType.Rive);
    }
}
