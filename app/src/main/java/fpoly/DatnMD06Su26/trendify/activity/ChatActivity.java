package fpoly.DatnMD06Su26.trendify.activity;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.widget.EditText;
import android.widget.ImageButton;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.adapter.ChatAdapter;
import fpoly.DatnMD06Su26.trendify.model.ChatMessage;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class ChatActivity extends AppCompatActivity {

    private RecyclerView rvChat;
    private EditText etMessage;
    private ImageButton btnSend;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> messageList;

    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + fpoly.DatnMD06Su26.trendify.BuildConfig.GEMINI_API_KEY;
    private OkHttpClient client;
    private Handler mainHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        client = new OkHttpClient();
        mainHandler = new Handler(Looper.getMainLooper());

        Toolbar toolbar = findViewById(R.id.toolbarChat);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        toolbar.setNavigationOnClickListener(v -> finish());

        rvChat = findViewById(R.id.rvChat);
        etMessage = findViewById(R.id.etMessage);
        btnSend = findViewById(R.id.btnSend);

        messageList = new ArrayList<>();
        chatAdapter = new ChatAdapter(messageList);

        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        rvChat.setLayoutManager(layoutManager);
        rvChat.setAdapter(chatAdapter);

        // Hiển thị tin nhắn chào mừng từ bot
        addBotMessage("Xin chào! Tôi là trợ lý ảo AI của Trendify. Tôi có thể giúp gì cho bạn?");

        btnSend.setOnClickListener(v -> sendMessage());
    }

    private void sendMessage() {
        String text = etMessage.getText().toString().trim();
        if (!TextUtils.isEmpty(text)) {
            // Thêm tin nhắn của người dùng
            messageList.add(new ChatMessage(text, ChatMessage.TYPE_USER));
            chatAdapter.notifyItemInserted(messageList.size() - 1);
            rvChat.scrollToPosition(messageList.size() - 1);
            etMessage.setText("");

            callGeminiAPI(text);
        }
    }

    private void addBotMessage(String text) {
        mainHandler.post(() -> {
            messageList.add(new ChatMessage(text, ChatMessage.TYPE_BOT));
            chatAdapter.notifyItemInserted(messageList.size() - 1);
            rvChat.scrollToPosition(messageList.size() - 1);
        });
    }

    private void callGeminiAPI(String prompt) {
        try {
            JSONObject jsonBody = new JSONObject();
            JSONArray contents = new JSONArray();
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray();
            JSONObject part = new JSONObject();

            part.put("text", "Bạn là một trợ lý ảo tư vấn bán hàng thời trang cho ứng dụng Trendify. Hãy trả lời ngắn gọn, thân thiện và hữu ích. Khách hàng hỏi: " + prompt);
            parts.put(part);
            content.put("parts", parts);
            contents.put(content);
            jsonBody.put("contents", contents);

            RequestBody body = RequestBody.create(jsonBody.toString(), MediaType.parse("application/json; charset=utf-8"));
            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .build();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(@NonNull Call call, @NonNull IOException e) {
                    addBotMessage("Xin lỗi, có lỗi kết nối mạng xảy ra.");
                }

                @Override
                public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                    if (response.isSuccessful() && response.body() != null) {
                        try {
                            String responseBody = response.body().string();
                            JSONObject jsonObject = new JSONObject(responseBody);
                            JSONArray candidates = jsonObject.getJSONArray("candidates");
                            if (candidates.length() > 0) {
                                JSONObject firstCandidate = candidates.getJSONObject(0);
                                JSONObject contentObj = firstCandidate.getJSONObject("content");
                                JSONArray partsArray = contentObj.getJSONArray("parts");
                                if (partsArray.length() > 0) {
                                    String aiText = partsArray.getJSONObject(0).getString("text");
                                    addBotMessage(aiText);
                                }
                            }
                        } catch (JSONException e) {
                            addBotMessage("Xin lỗi, tôi không thể xử lý phản hồi lúc này.");
                        }
                    } else {
                        addBotMessage("Xin lỗi, dịch vụ AI đang gặp sự cố. " + response.code());
                    }
                }
            });

        } catch (Exception e) {
            addBotMessage("Xin lỗi, đã có lỗi hệ thống xảy ra.");
        }
    }
}
