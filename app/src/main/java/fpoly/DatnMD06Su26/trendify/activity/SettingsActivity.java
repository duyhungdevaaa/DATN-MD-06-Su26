package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class SettingsActivity extends AppCompatActivity {

    private static final int PICK_IMAGE_REQUEST = 1001;
    private UserProfile currentProfile = null;
    private android.widget.EditText activeEtAvatarUrl = null;
    private android.widget.ImageView activeIvAvatarPreview = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        loadUserProfile();

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), systemBars.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        ImageView ivBack = findViewById(R.id.ivBack);
        ivBack.setOnClickListener(v -> finish());

        View btnLogout = findViewById(R.id.btnLogout);
        if (btnLogout != null) {
            btnLogout.setOnClickListener(v -> {
                SessionManager.getInstance().logout();
                com.google.firebase.auth.FirebaseAuth.getInstance().signOut();
                android.content.Intent intent = new android.content.Intent(this, LoginActivity.class);
                intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            });
        }

        // Account & Security
        View btnAccountSecurity = findViewById(R.id.btnAccountSecurity);
        if (btnAccountSecurity != null) {
            btnAccountSecurity.setOnClickListener(v -> showAccountSecurityDialog());
        }

        // Addresses
        View btnAddresses = findViewById(R.id.btnAddresses);
        if (btnAddresses != null) {
            btnAddresses.setOnClickListener(v -> {
                startActivity(new android.content.Intent(this, AddressManagementActivity.class));
            });
        }

        // Linked Accounts
        View btnLinkedAccounts = findViewById(R.id.btnLinkedAccounts);
        if (btnLinkedAccounts != null) {
            btnLinkedAccounts.setOnClickListener(v -> showLinkedAccountsDialog());
        }

        // Chat Settings
        View btnChatSettings = findViewById(R.id.btnChatSettings);
        if (btnChatSettings != null) {
            btnChatSettings.setOnClickListener(v -> showChatSettingsDialog());
        }

        // Notification Settings
        View btnNotificationSettings = findViewById(R.id.btnNotificationSettings);
        if (btnNotificationSettings != null) {
            btnNotificationSettings.setOnClickListener(v -> showNotificationSettingsDialog());
        }

        // Language
        View btnLanguage = findViewById(R.id.btnLanguage);
        if (btnLanguage != null) {
            btnLanguage.setOnClickListener(v -> showLanguageSettingsDialog());
        }

        // Help Center
        View btnHelpCenter = findViewById(R.id.btnHelpCenter);
        if (btnHelpCenter != null) {
            btnHelpCenter.setOnClickListener(v -> showHelpCenterDialog());
        }

        // Privacy Policy
        View btnPrivacyPolicy = findViewById(R.id.btnPrivacyPolicy);
        if (btnPrivacyPolicy != null) {
            btnPrivacyPolicy.setOnClickListener(v -> showPrivacyPolicyDialog());
        }
    }

    private void loadUserProfile() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            return;
        }
        FirestoreHelper.loadUserProfile(new FirestoreHelper.ProfileCallback() {
            @Override
            public void onLoaded(UserProfile profile) {
                currentProfile = profile;
            }

            @Override
            public void onFailure(String error) {
                // Ignore or handle
            }
        });
    }

    private void showAccountSecurityDialog() {
        String email = currentProfile != null ? currentProfile.getEmail() : "Chưa cập nhật";
        String uid = currentProfile != null ? currentProfile.getUid() : (SessionManager.getInstance().getUserId() != null ? SessionManager.getInstance().getUserId() : "Chưa có");
        String fullName = currentProfile != null ? currentProfile.getFullName() : "";
        String phone = currentProfile != null ? currentProfile.getPhone() : "";
        String avatar = currentProfile != null ? currentProfile.getAvatar() : "";

        android.view.View dialogView = android.view.LayoutInflater.from(this).inflate(R.layout.dialog_account_security, null);
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setView(dialogView);

        androidx.appcompat.app.AlertDialog dialog = builder.create();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
        }

        // Bind views
        android.widget.ImageView ivAvatarPreview = dialogView.findViewById(R.id.ivAvatarPreview);
        android.widget.TextView tvEmailInfo = dialogView.findViewById(R.id.tvEmailInfo);
        android.widget.TextView tvUidInfo = dialogView.findViewById(R.id.tvUidInfo);
        android.widget.EditText etFullName = dialogView.findViewById(R.id.etFullName);
        android.widget.EditText etPhone = dialogView.findViewById(R.id.etPhone);
        android.widget.EditText etAvatar = dialogView.findViewById(R.id.etAvatarUrl);
        android.widget.Button btnSave = dialogView.findViewById(R.id.btnSave);
        android.widget.Button btnResetPassword = dialogView.findViewById(R.id.btnResetPassword);
        android.widget.Button btnCancel = dialogView.findViewById(R.id.btnCancel);

        // Load data
        tvEmailInfo.setText("Email: " + email);
        tvUidInfo.setText("UID: " + uid);
        etFullName.setText(fullName);
        etPhone.setText(phone);
        etAvatar.setText(avatar);

        // Load avatar image preview
        if (avatar != null && !avatar.isEmpty()) {
            com.bumptech.glide.Glide.with(this)
                    .load(avatar)
                    .placeholder(R.drawable.ic_person)
                    .error(R.drawable.ic_person)
                    .into(ivAvatarPreview);
        } else {
            ivAvatarPreview.setImageResource(R.drawable.ic_person);
        }

        // Click listener to pick avatar image from gallery
        ivAvatarPreview.setOnClickListener(v -> {
            activeIvAvatarPreview = ivAvatarPreview;
            activeEtAvatarUrl = etAvatar;
            android.content.Intent pickIntent = new android.content.Intent(android.content.Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickIntent, PICK_IMAGE_REQUEST);
        });

        // Image preview auto update text listener
        etAvatar.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(android.text.Editable s) {
                String newUrl = s.toString().trim();
                if (!newUrl.isEmpty()) {
                    com.bumptech.glide.Glide.with(SettingsActivity.this)
                            .load(newUrl)
                            .placeholder(R.drawable.ic_person)
                            .error(R.drawable.ic_person)
                            .into(ivAvatarPreview);
                } else {
                    ivAvatarPreview.setImageResource(R.drawable.ic_person);
                }
            }
        });

        // Set action click listeners
        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnResetPassword.setOnClickListener(v -> {
            showChangePasswordDialog(uid);
        });

        btnSave.setOnClickListener(v -> {
            String newFullName = etFullName.getText().toString().trim();
            String newPhone = etPhone.getText().toString().trim();
            String newAvatar = etAvatar.getText().toString().trim();

            if (newFullName.isEmpty()) {
                android.widget.Toast.makeText(this, "Họ tên không được để trống", android.widget.Toast.LENGTH_SHORT).show();
                return;
            }

            // Update in Firestore
            UserProfile updatedProfile = new UserProfile(
                    uid,
                    newFullName,
                    email,
                    newPhone,
                    currentProfile != null ? currentProfile.getCreatedAt() : com.google.firebase.Timestamp.now()
            );
            updatedProfile.setAvatar(newAvatar);

            FirestoreHelper.saveUserProfile(updatedProfile, new FirestoreHelper.SimpleCallback() {
                @Override
                public void onSuccess() {
                    // Update in Realtime Database as well for full consistency
                    com.google.firebase.database.DatabaseReference userRef = com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users").child(uid);
                    userRef.child("fullName").setValue(newFullName);
                    userRef.child("avatar").setValue(newAvatar);
                    userRef.child("avatarUrl").setValue(newAvatar).addOnCompleteListener(task -> {
                        currentProfile = updatedProfile;
                        android.widget.Toast.makeText(SettingsActivity.this, "Đã cập nhật thông tin thành công!", android.widget.Toast.LENGTH_SHORT).show();
                        dialog.dismiss();
                    });
                }

                @Override
                public void onFailure(String error) {
                    android.widget.Toast.makeText(SettingsActivity.this, "Lỗi cập nhật Firestore: " + error, android.widget.Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.show();
    }

    private void showChangePasswordDialog(String uid) {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Đổi mật khẩu");

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(50, 40, 50, 40);

        android.widget.EditText etNewPassword = new android.widget.EditText(this);
        etNewPassword.setHint("Nhập mật khẩu mới");
        etNewPassword.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        layout.addView(etNewPassword);

        builder.setView(layout);
        builder.setPositiveButton("Lưu", (dialog, which) -> {
            String newPassword = etNewPassword.getText().toString().trim();
            if (newPassword.isEmpty()) {
                android.widget.Toast.makeText(this, "Mật khẩu không được để trống", android.widget.Toast.LENGTH_SHORT).show();
                return;
            }
            if (newPassword.length() < 6) {
                android.widget.Toast.makeText(this, "Mật khẩu phải dài ít nhất 6 ký tự", android.widget.Toast.LENGTH_SHORT).show();
                return;
            }

            String hashed = org.mindrot.jbcrypt.BCrypt.hashpw(newPassword, org.mindrot.jbcrypt.BCrypt.gensalt());
            com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                .child(uid)
                .child("password")
                .setValue(hashed)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        android.widget.Toast.makeText(this, "Đã đổi mật khẩu thành công!", android.widget.Toast.LENGTH_SHORT).show();
                    } else {
                        android.widget.Toast.makeText(this, "Lỗi đổi mật khẩu", android.widget.Toast.LENGTH_SHORT).show();
                    }
                });
        });
        builder.setNegativeButton("Hủy", null);
        builder.show();
    }

    private void showLinkedAccountsDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Tài khoản liên kết");

        String[] items = {"Google (Đã liên kết)", "Facebook (Chưa liên kết)", "TikTok (Chưa liên kết)"};
        boolean[] checked = {true, false, false};

        builder.setMultiChoiceItems(items, checked, (dialog, which, isChecked) -> {
            if (which == 0) {
                ((androidx.appcompat.app.AlertDialog) dialog).getListView().setItemChecked(0, true);
                android.widget.Toast.makeText(this, "Không thể hủy liên kết tài khoản Google hiện tại", android.widget.Toast.LENGTH_SHORT).show();
            } else {
                String provider = which == 1 ? "Facebook" : "TikTok";
                if (isChecked) {
                    android.widget.Toast.makeText(this, "Đã liên kết tài khoản " + provider + " thành công!", android.widget.Toast.LENGTH_SHORT).show();
                } else {
                    android.widget.Toast.makeText(this, "Đã hủy liên kết tài khoản " + provider, android.widget.Toast.LENGTH_SHORT).show();
                }
            }
        });
        builder.setPositiveButton("Hoàn tất", null);
        builder.show();
    }

    private void showChatSettingsDialog() {
        android.content.SharedPreferences prefs = getSharedPreferences("chat_prefs", MODE_PRIVATE);
        boolean autoGreeting = prefs.getBoolean("auto_greeting", true);
        boolean saveHistory = prefs.getBoolean("save_history", true);

        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Cài đặt Chat");

        String[] options = {"Gửi lời chào tự động khi mở Chat", "Lưu lịch sử hội thoại ngoại tuyến"};
        boolean[] checked = {autoGreeting, saveHistory};

        builder.setMultiChoiceItems(options, checked, (dialog, which, isChecked) -> {
            android.content.SharedPreferences.Editor editor = prefs.edit();
            if (which == 0) {
                editor.putBoolean("auto_greeting", isChecked);
            } else if (which == 1) {
                editor.putBoolean("save_history", isChecked);
            }
            editor.apply();
            android.widget.Toast.makeText(this, "Đã cập nhật cài đặt Chat", android.widget.Toast.LENGTH_SHORT).show();
        });
        builder.setPositiveButton("Xác nhận", null);
        builder.show();
    }

    private void showNotificationSettingsDialog() {
        android.content.SharedPreferences prefs = getSharedPreferences("notif_prefs", MODE_PRIVATE);
        boolean promo = prefs.getBoolean("promo", true);
        boolean order = prefs.getBoolean("order", true);
        boolean system = prefs.getBoolean("system", true);

        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Cài đặt Thông báo");

        String[] options = {"Thông báo khuyến mãi & ưu đãi", "Cập nhật trạng thái đơn hàng", "Thông báo hoạt động hệ thống"};
        boolean[] checked = {promo, order, system};

        builder.setMultiChoiceItems(options, checked, (dialog, which, isChecked) -> {
            android.content.SharedPreferences.Editor editor = prefs.edit();
            if (which == 0) {
                editor.putBoolean("promo", isChecked);
            } else if (which == 1) {
                editor.putBoolean("order", isChecked);
            } else if (which == 2) {
                editor.putBoolean("system", isChecked);
            }
            editor.apply();
            android.widget.Toast.makeText(this, "Đã cập nhật cài đặt thông báo", android.widget.Toast.LENGTH_SHORT).show();
        });
        builder.setPositiveButton("Xác nhận", null);
        builder.show();
    }

    private void showLanguageSettingsDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Chọn Ngôn ngữ");

        String[] languages = {"Tiếng Việt (Vietnamese)", "English (Tiếng Anh)"};
        int currentLang = 0;

        builder.setSingleChoiceItems(languages, currentLang, (dialog, which) -> {
            if (which == 0) {
                android.widget.Toast.makeText(this, "Đã chuyển đổi sang Tiếng Việt", android.widget.Toast.LENGTH_SHORT).show();
            } else {
                android.widget.Toast.makeText(this, "Đã chuyển đổi sang Tiếng Anh (English)", android.widget.Toast.LENGTH_SHORT).show();
            }
            dialog.dismiss();
        });
        builder.setNegativeButton("Hủy", null);
        builder.show();
    }

    private void showHelpCenterDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Trung tâm Trợ giúp");

        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(50, 40, 50, 40);

        android.widget.TextView tvInfo = new android.widget.TextView(this);
        tvInfo.setText("Nếu bạn gặp bất kỳ vấn đề gì về đơn hàng hoặc ứng dụng, vui lòng liên hệ với bộ phận CSKH của Trendify:");
        tvInfo.setTextSize(14);
        tvInfo.setTextColor(0xFF333333);
        tvInfo.setPadding(0, 0, 0, 30);
        layout.addView(tvInfo);

        android.widget.Button btnCall = new android.widget.Button(this);
        btnCall.setText("Gọi Hotline: 1900 1234");
        btnCall.setBackgroundColor(0xFF4CAF50);
        btnCall.setTextColor(android.graphics.Color.WHITE);
        btnCall.setOnClickListener(v -> {
            try {
                android.content.Intent dialIntent = new android.content.Intent(android.content.Intent.ACTION_DIAL);
                dialIntent.setData(android.net.Uri.parse("tel:19001234"));
                startActivity(dialIntent);
            } catch (Exception e) {
                android.widget.Toast.makeText(this, "Không thể thực hiện cuộc gọi", android.widget.Toast.LENGTH_SHORT).show();
            }
        });
        layout.addView(btnCall);

        android.view.View spacer = new android.view.View(this);
        spacer.setLayoutParams(new android.widget.LinearLayout.LayoutParams(1, 20));
        layout.addView(spacer);

        android.widget.Button btnEmail = new android.widget.Button(this);
        btnEmail.setText("Gửi Email: support@trendify.vn");
        btnEmail.setBackgroundColor(0xFF2196F3);
        btnEmail.setTextColor(android.graphics.Color.WHITE);
        btnEmail.setOnClickListener(v -> {
            try {
                android.content.Intent emailIntent = new android.content.Intent(android.content.Intent.ACTION_SENDTO);
                emailIntent.setData(android.net.Uri.parse("mailto:support@trendify.vn"));
                emailIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, "Hỗ trợ khách hàng Trendify");
                startActivity(emailIntent);
            } catch (Exception e) {
                android.widget.Toast.makeText(this, "Không tìm thấy ứng dụng gửi email", android.widget.Toast.LENGTH_SHORT).show();
            }
        });
        layout.addView(btnEmail);

        builder.setView(layout);
        builder.setPositiveButton("Đóng", null);
        builder.show();
    }

    private void showPrivacyPolicyDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("Chính sách bảo mật Trendify");

        android.widget.ScrollView scrollView = new android.widget.ScrollView(this);
        android.widget.TextView tvPolicy = new android.widget.TextView(this);
        tvPolicy.setPadding(40, 30, 40, 30);
        tvPolicy.setTextSize(14);
        tvPolicy.setTextColor(0xFF333333);

        String policyText = "Chào mừng bạn đến với Trendify. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn sử dụng ứng dụng di động Trendify của chúng tôi.\n\n" +
                "1. Thu thập thông tin:\n" +
                "Chúng tôi thu thập các thông tin cá nhân mà bạn tự nguyện cung cấp khi đăng ký tài khoản, cập nhật hồ sơ, đặt hàng hoặc liên hệ với bộ phận hỗ trợ khách hàng. Thông tin này bao gồm họ và tên, địa chỉ email, số điện thoại, địa chỉ giao hàng và thông tin thanh toán.\n\n" +
                "2. Sử dụng thông tin:\n" +
                "Chúng tôi sử dụng thông tin thu thập được để xử lý đơn hàng, gửi cập nhật trạng thái giao hàng, cải thiện dịch vụ khách hàng, gửi thông báo khuyến mãi cá nhân hóa và cải tiến ứng dụng.\n\n" +
                "3. Chia sẻ thông tin:\n" +
                "Trendify cam kết không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin cần thiết với các đối tác giao hàng (như đơn vị vận chuyển) và cổng thanh toán để thực hiện việc giao dịch.\n\n" +
                "4. Bảo mật dữ liệu:\n" +
                "Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn công nghiệp (như mã hóa SSL/TLS và cơ sở dữ liệu Firebase bảo mật) để bảo vệ dữ liệu cá nhân của bạn tránh khỏi mất mát, mất cắp, truy cập trái phép hoặc tiết lộ trái phép.\n\n" +
                "5. Quyền lợi của bạn:\n" +
                "Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa tài khoản và thông tin cá nhân của mình bất kỳ lúc nào thông qua phần Thiết lập tài khoản trong ứng dụng.\n\n" +
                "Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ với chúng tôi qua email support@trendify.vn.";

        tvPolicy.setText(policyText);
        scrollView.addView(tvPolicy);

        builder.setView(scrollView);
        builder.setPositiveButton("Tôi đã hiểu", null);
        builder.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            android.net.Uri imageUri = data.getData();
            uploadAvatarToFirebaseStorage(imageUri);
        }
    }

    private void uploadAvatarToFirebaseStorage(android.net.Uri imageUri) {
        if (activeIvAvatarPreview == null || activeEtAvatarUrl == null) return;

        String uid = currentProfile != null ? currentProfile.getUid() : (SessionManager.getInstance().getUserId() != null ? SessionManager.getInstance().getUserId() : "unknown");

        android.app.ProgressDialog progressDialog = new android.app.ProgressDialog(this);
        progressDialog.setTitle("Đang tải ảnh lên...");
        progressDialog.setMessage("Vui lòng chờ giây lát...");
        progressDialog.setCancelable(false);
        progressDialog.show();

        com.google.firebase.storage.StorageReference ref = com.google.firebase.storage.FirebaseStorage.getInstance().getReference("avatars/" + uid + ".jpg");
        ref.putFile(imageUri)
                .addOnSuccessListener(taskSnapshot -> {
                    ref.getDownloadUrl().addOnSuccessListener(uri -> {
                        progressDialog.dismiss();
                        String downloadUrl = uri.toString();

                        activeEtAvatarUrl.setText(downloadUrl);

                        com.bumptech.glide.Glide.with(SettingsActivity.this)
                                .load(downloadUrl)
                                .placeholder(R.drawable.ic_person)
                                .error(R.drawable.ic_person)
                                .into(activeIvAvatarPreview);

                        android.widget.Toast.makeText(SettingsActivity.this, "Tải ảnh lên thành công!", android.widget.Toast.LENGTH_SHORT).show();
                    });
                })
                .addOnFailureListener(e -> {
                    progressDialog.dismiss();
                    android.widget.Toast.makeText(SettingsActivity.this, "Tải ảnh lên thất bại: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
                });
    }
}
