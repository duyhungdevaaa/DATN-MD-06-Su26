package fpoly.DatnMD06Su26.trendify;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "MyAppSession";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_JWT = "jwtToken";

    private static SessionManager instance;
    private SharedPreferences prefs;
    private String cachedUserId = null;

    private SessionManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        cachedUserId = prefs.getString(KEY_USER_ID, null);
    }

    public static synchronized void init(Context context) {
        if (instance == null) {
            instance = new SessionManager(context);
        }
    }

    public static SessionManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SessionManager is not initialized, call init(Context) first.");
        }
        return instance;
    }

    public void saveSession(String userId, String token) {
        prefs.edit().putString(KEY_USER_ID, userId).putString(KEY_JWT, token).apply();
        cachedUserId = userId;
    }

    public String getUserId() {
        return cachedUserId;
    }

    public String getToken() {
        return prefs.getString(KEY_JWT, null);
    }

    public boolean isLoggedIn() {
        String token = getToken();
        if (token != null && JwtHelper.verifyToken(token)) {
            return cachedUserId != null;
        }
        return false;
    }

    public void logout() {
        prefs.edit().clear().apply();
        cachedUserId = null;
    }
}
