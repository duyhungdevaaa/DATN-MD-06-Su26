package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.JwtHelper;
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.MainActivity;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.Timestamp;
import com.google.firebase.auth.FirebaseAuth;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etFullName, etEmail, etPassword;
    private MaterialButton btnRegister;
    private TextView tvLogin;
    private ProgressBar progressBar;
    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        if (getSupportActionBar() != null) getSupportActionBar().hide();

        mAuth = FirebaseAuth.getInstance();

        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        progressBar = findViewById(R.id.progressBar);

        tvLogin.setOnClickListener(v ->
                startActivity(new Intent(this, LoginActivity.class)));

        btnRegister.setOnClickListener(v -> registerUser());
    }

    private void registerUser() {
        String fullName = etFullName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(fullName)) {
            etFullName.setError("Nhập họ tên");
            return;
        }
        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Nhập email");
            return;
        }
        if (password.length() < 6) {
            etPassword.setError("Mật khẩu tối thiểu 6 ký tự");
            return;
        }

        setLoading(true);

        // Check if email already exists
        com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                .orderByChild("email").equalTo(email)
                .addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
                    @Override
                    public void onDataChange(com.google.firebase.database.DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            setLoading(false);
                            Toast.makeText(RegisterActivity.this, "Email đã tồn tại", Toast.LENGTH_LONG).show();
                        } else {
                            // Hash password
                            String hashedPassword = org.mindrot.jbcrypt.BCrypt.hashpw(password, org.mindrot.jbcrypt.BCrypt.gensalt());
                            
                            // Generate unique UserID
                            String newUserId = java.util.UUID.randomUUID().toString();
                            
                            // Save to Realtime Database
                            java.util.Map<String, Object> userData = new java.util.HashMap<>();
                            userData.put("uid", newUserId);
                            userData.put("email", email);
                            userData.put("password", hashedPassword);
                            userData.put("fullName", fullName);
                            userData.put("createdAt", System.currentTimeMillis());
                            
                            com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                                    .child(newUserId)
                                    .setValue(userData)
                                    .addOnSuccessListener(aVoid -> {
                                        // Generate JWT and auto login
                                        String token = JwtHelper.generateToken(newUserId, email);
                                        SessionManager.getInstance().saveSession(newUserId, token);

                                        // Also save profile to Firestore to maintain compatibility with existing app logic
                                        UserProfile profile = new UserProfile(newUserId, fullName, email, "", Timestamp.now());
                                        FirestoreHelper.saveUserProfile(profile, new FirestoreHelper.SimpleCallback() {
                                            @Override
                                            public void onSuccess() {
                                                setLoading(false);
                                                Toast.makeText(RegisterActivity.this, "Đăng ký thành công!", Toast.LENGTH_SHORT).show();
                                                startActivity(new Intent(RegisterActivity.this, MainActivity.class));
                                                finish();
                                            }

                                            @Override
                                            public void onFailure(String error) {
                                                setLoading(false);
                                                Toast.makeText(RegisterActivity.this, "Đăng ký thành công, nhưng lỗi lưu hồ sơ: " + error, Toast.LENGTH_LONG).show();
                                                startActivity(new Intent(RegisterActivity.this, MainActivity.class));
                                                finish();
                                            }
                                        });
                                    })
                                    .addOnFailureListener(e -> {
                                        setLoading(false);
                                        Toast.makeText(RegisterActivity.this, e.getMessage(), Toast.LENGTH_LONG).show();
                                    });
                        }
                    }

                    @Override
                    public void onCancelled(com.google.firebase.database.DatabaseError error) {
                        setLoading(false);
                        Toast.makeText(RegisterActivity.this, error.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void setLoading(boolean loading) {
        btnRegister.setEnabled(!loading);
        if (progressBar != null)
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}
