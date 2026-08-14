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
import fpoly.DatnMD06Su26.trendify.model.ProductItem;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableResult;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import java.util.HashMap;
import java.util.Map;

public class ChatActivity extends AppCompatActivity {

    private RecyclerView rvChat;
    private EditText etMessage;
    private ImageButton btnSend;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> messageList;

    private Handler mainHandler;
    private String productContext = "Hiện tại cửa hàng chưa tải được danh mục sản phẩm.";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

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

        loadProductsForContext();

        etMessage.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(android.text.Editable s) {
                boolean isTyping = s.toString().trim().length() > 0;
                chatAdapter.setUserTyping(isTyping);
            }
        });

        btnSend.setOnClickListener(v -> sendMessage());
    }

    private void loadProductsForContext() {
        FirestoreHelper.loadAllProducts(new FirestoreHelper.ProductsCallback() {
            @Override
            public void onLoaded(List<ProductItem> products) {
                if (products == null || products.isEmpty()) {
                    productContext = "Hiện tại cửa hàng không có sản phẩm nào.";
                    return;
                }
                StringBuilder sb = new StringBuilder("Danh sách sản phẩm hiện tại của cửa hàng Trendify:\n");
                for (int i = 0; i < products.size(); i++) {
                    ProductItem p = products.get(i);
                    sb.append("- ").append(p.getName())
                      .append(" (Giá: ").append(p.getPrice()).append("đ");
                    if (p.getSizes() != null && !p.getSizes().isEmpty()) {
                        sb.append(", Size: ").append(android.text.TextUtils.join("/", p.getSizes()));
                    }
                    if (p.getColors() != null && !p.getColors().isEmpty()) {
                        sb.append(", Màu: ").append(android.text.TextUtils.join("/", p.getColors()));
                    }
                    sb.append(")\n");
                }
                productContext = sb.toString();
            }

            @Override
            public void onFailure(String error) {
                productContext = "Danh sách sản phẩm tạm thời không khả dụng do lỗi hệ thống.";
            }
        });
    }

    private ChatMessage typingMessage;

    private void sendMessage() {
        String text = etMessage.getText().toString().trim();
        if (!TextUtils.isEmpty(text)) {
            // Thêm tin nhắn của người dùng
            messageList.add(new ChatMessage(text, ChatMessage.TYPE_USER));
            chatAdapter.notifyItemInserted(messageList.size() - 1);
            rvChat.scrollToPosition(messageList.size() - 1);
            etMessage.setText("");

            typingMessage = new ChatMessage("", ChatMessage.TYPE_BOT_TYPING);
            messageList.add(typingMessage);
            chatAdapter.notifyItemInserted(messageList.size() - 1);
            rvChat.scrollToPosition(messageList.size() - 1);

            callGeminiAPI(text);
        }
    }

    private void addBotMessage(String text) {
        mainHandler.post(() -> {
            if (typingMessage != null) {
                int index = messageList.indexOf(typingMessage);
                if (index != -1) {
                    messageList.remove(index);
                    chatAdapter.notifyItemRemoved(index);
                }
                typingMessage = null;
            }
            messageList.add(new ChatMessage(text, ChatMessage.TYPE_BOT));
            chatAdapter.notifyItemInserted(messageList.size() - 1);
            rvChat.scrollToPosition(messageList.size() - 1);
        });
    }

    private void callGeminiAPI(String prompt) {
        try {
            Map<String, Object> data = new HashMap<>();
            
            String sysInst = "Bạn là một trợ lý ảo tư vấn bán hàng thời trang cho ứng dụng Trendify. Hãy tư vấn nhiệt tình, thân thiện dựa vào dữ liệu sản phẩm có sẵn.\n" +
                                   "--- DỮ LIỆU SẢN PHẨM ---\n" +
                                   productContext + "\n" +
                                   "------------------------";
            data.put("systemInstruction", sysInst);

            List<Map<String, Object>> contents = new ArrayList<>();
            for (ChatMessage msg : messageList) {
                if (msg.getType() == ChatMessage.TYPE_BOT_TYPING) {
                    continue;
                }
                Map<String, Object> contentObj = new HashMap<>();
                String role = (msg.getType() == ChatMessage.TYPE_USER) ? "user" : "model";
                contentObj.put("role", role);

                List<Map<String, String>> parts = new ArrayList<>();
                Map<String, String> part = new HashMap<>();
                part.put("text", msg.getText());
                parts.add(part);

                contentObj.put("parts", parts);
                contents.add(contentObj);
            }
            data.put("contents", contents);

            FirebaseFunctions mFunctions = FirebaseFunctions.getInstance("asia-southeast1");
            mFunctions.getHttpsCallable("chatWithGemini")
                    .call(data)
                    .addOnCompleteListener(new OnCompleteListener<HttpsCallableResult>() {
                        @Override
                        public void onComplete(@NonNull Task<HttpsCallableResult> task) {
                            if (task.isSuccessful()) {
                                HashMap<String, Object> result = (HashMap<String, Object>) task.getResult().getData();
                                String reply = (String) result.get("reply");
                                addBotMessage(reply);
                            } else {
                                addBotMessage("Xin lỗi, dịch vụ AI đang gặp sự cố: " + task.getException().getMessage());
                            }
                        }
                    });

        } catch (Exception e) {
            addBotMessage("Xin lỗi, đã có lỗi hệ thống xảy ra.");
        }
    }
}
