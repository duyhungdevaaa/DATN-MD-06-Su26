package fpoly.DatnMD06Su26.trendify.activity;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.Timestamp;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import fpoly.DatnMD06Su26.trendify.JwtHelper;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etFullName, etEmail, etPassword, etConfirmPassword, etPhone;
    private MaterialButton btnRegister;
    private TextView tvLogin;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        if (getSupportActionBar() != null) getSupportActionBar().hide();

        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        etPhone = findViewById(R.id.etPhone);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        progressBar = findViewById(R.id.progressBar);

        btnRegister.setText("ĐĂNG KÝ");

        tvLogin.setOnClickListener(v ->
                startActivity(new Intent(this, LoginActivity.class)));

        btnRegister.setOnClickListener(v -> registerUser());
    }

    private void registerUser() {
        String fullName = etFullName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();

        if (TextUtils.isEmpty(fullName)) {
            etFullName.setError("Nhập họ tên");
            return;
        }
        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Email không hợp lệ");
            return;
        }
        if (TextUtils.isEmpty(phone) || !phone.matches("^0[35789][0-9]{8}$")) {
            etPhone.setError("Số điện thoại không hợp lệ (10 số, đầu số VN)");
            return;
        }
        if (password.length() < 6) {
            etPassword.setError("Mật khẩu tối thiểu 6 ký tự");
            return;
        }
        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Mật khẩu không khớp");
            return;
        }

        setLoading(true);

        // Check for uniqueness of email and phone
        FirebaseDatabase.getInstance().getReference("users")
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        boolean emailExists = false;
                        boolean phoneExists = false;

                        for (DataSnapshot userSnapshot : snapshot.getChildren()) {
                            String storedEmail = userSnapshot.child("email").getValue(String.class);
                            String storedPhone = userSnapshot.child("phone").getValue(String.class);

                            if (email.equalsIgnoreCase(storedEmail)) emailExists = true;
                            if (phone.equals(storedPhone)) phoneExists = true;
                        }

                        if (emailExists) {
                            setLoading(false);
                            etEmail.setError("Email đã tồn tại");
                        } else if (phoneExists) {
                            setLoading(false);
                            etPhone.setError("Số điện thoại đã tồn tại");
                        } else {
                            performRegistration(fullName, email, password, phone);
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        setLoading(false);
                        Toast.makeText(RegisterActivity.this, "Lỗi: " + error.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void performRegistration(String fullName, String email, String password, String phone) {
        // Hash password
        String hashedPassword = org.mindrot.jbcrypt.BCrypt.hashpw(password, org.mindrot.jbcrypt.BCrypt.gensalt());
        
        // Generate unique UserID
        String newUserId = UUID.randomUUID().toString();
        
        // Save to Realtime Database
        Map<String, Object> userData = new HashMap<>();
        userData.put("uid", newUserId);
        userData.put("email", email);
        userData.put("password", hashedPassword);
        userData.put("fullName", fullName);
        userData.put("phone", phone);
        userData.put("phoneVerified", false);
        userData.put("createdAt", System.currentTimeMillis());
        
        FirebaseDatabase.getInstance().getReference("users")
                .child(newUserId)
                .setValue(userData)
                .addOnSuccessListener(aVoid -> {
                    // Generate JWT and auto login
                    String token = JwtHelper.generateToken(newUserId, email);
                    SessionManager.getInstance().saveSession(newUserId, token);

                    // Save profile to Firestore
                    UserProfile profile = new UserProfile(newUserId, fullName, email, phone, false, Timestamp.now());
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
                            Toast.makeText(RegisterActivity.this, "Lỗi lưu hồ sơ: " + error, Toast.LENGTH_LONG).show();
                            startActivity(new Intent(RegisterActivity.this, MainActivity.class));
                            finish();
                        }
                    });
                })
                .addOnFailureListener(e -> {
                    setLoading(false);
                    Toast.makeText(RegisterActivity.this, "Lỗi đăng ký: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }

    private void setLoading(boolean loading) {
        btnRegister.setEnabled(!loading);
        if (progressBar != null)
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}
