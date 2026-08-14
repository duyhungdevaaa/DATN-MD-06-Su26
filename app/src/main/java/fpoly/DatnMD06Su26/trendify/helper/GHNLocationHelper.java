package fpoly.DatnMD06Su26.trendify.helper;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.NonNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class GHNLocationHelper {
    private static final String TOKEN = "ecefb2fb-7203-11f1-a973-aee5264794df";
    private static final String BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/";
    private static final OkHttpClient client = new OkHttpClient();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    public static class Province {
        public int id;
        public String name;
        public Province(int id, String name) { this.id = id; this.name = name; }
        @Override public String toString() { return name; }
    }

    public static class District {
        public int id;
        public String name;
        public District(int id, String name) { this.id = id; this.name = name; }
        @Override public String toString() { return name; }
    }

    public static class Ward {
        public String code;
        public String name;
        public Ward(String code, String name) { this.code = code; this.name = name; }
        @Override public String toString() { return name; }
    }

    public interface LocationCallback<T> {
        void onSuccess(List<T> items);
        void onFailure(String error);
    }

    public static void getProvinces(LocationCallback<Province> callback) {
        Request request = new Request.Builder()
                .url(BASE_URL + "province")
                .header("Token", TOKEN)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override public void onFailure(@NonNull Call call, @NonNull IOException e) {
                mainHandler.post(() -> callback.onFailure(e.getMessage()));
            }
            @Override public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!response.isSuccessful()) {
                    mainHandler.post(() -> callback.onFailure("Error: " + response.code()));
                    return;
                }
                try {
                    String body = response.body().string();
                    JSONObject jsonObject = new JSONObject(body);
                    JSONArray data = jsonObject.getJSONArray("data");
                    List<Province> list = new ArrayList<>();
                    for (int i = 0; i < data.length(); i++) {
                        JSONObject item = data.getJSONObject(i);
                        list.add(new Province(item.getInt("ProvinceID"), item.getString("ProvinceName")));
                    }
                    mainHandler.post(() -> callback.onSuccess(list));
                } catch (JSONException e) {
                    mainHandler.post(() -> callback.onFailure(e.getMessage()));
                }
            }
        });
    }

    public static void getDistricts(int provinceId, LocationCallback<District> callback) {
        RequestBody reqBody = RequestBody.create(String.format("{\"province_id\":%d}", provinceId), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(BASE_URL + "district")
                .header("Token", TOKEN)
                .post(reqBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override public void onFailure(@NonNull Call call, @NonNull IOException e) {
                mainHandler.post(() -> callback.onFailure(e.getMessage()));
            }
            @Override public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!response.isSuccessful()) {
                    mainHandler.post(() -> callback.onFailure("Error: " + response.code()));
                    return;
                }
                try {
                    String body = response.body().string();
                    JSONObject jsonObject = new JSONObject(body);
                    JSONArray data = jsonObject.getJSONArray("data");
                    List<District> list = new ArrayList<>();
                    for (int i = 0; i < data.length(); i++) {
                        JSONObject item = data.getJSONObject(i);
                        list.add(new District(item.getInt("DistrictID"), item.getString("DistrictName")));
                    }
                    mainHandler.post(() -> callback.onSuccess(list));
                } catch (JSONException e) {
                    mainHandler.post(() -> callback.onFailure(e.getMessage()));
                }
            }
        });
    }

    public static void getWards(int districtId, LocationCallback<Ward> callback) {
        Request request = new Request.Builder()
                .url(BASE_URL + "ward?district_id=" + districtId)
                .header("Token", TOKEN)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override public void onFailure(@NonNull Call call, @NonNull IOException e) {
                mainHandler.post(() -> callback.onFailure(e.getMessage()));
            }
            @Override public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!response.isSuccessful()) {
                    mainHandler.post(() -> callback.onFailure("Error: " + response.code()));
                    return;
                }
                try {
                    String body = response.body().string();
                    JSONObject jsonObject = new JSONObject(body);
                    JSONArray data = jsonObject.getJSONArray("data");
                    List<Ward> list = new ArrayList<>();
                    for (int i = 0; i < data.length(); i++) {
                        JSONObject item = data.getJSONObject(i);
                        list.add(new Ward(item.getString("WardCode"), item.getString("WardName")));
                    }
                    mainHandler.post(() -> callback.onSuccess(list));
                } catch (JSONException e) {
                    mainHandler.post(() -> callback.onFailure(e.getMessage()));
                }
            }
        });
    }
}

