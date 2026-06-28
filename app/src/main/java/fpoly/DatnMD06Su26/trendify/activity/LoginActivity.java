package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.JwtHelper;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

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

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etEmail, etPassword;
    private MaterialButton btnLogin;
    private TextView tvForgotPassword, tvRegister;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        if (getSupportActionBar() != null) getSupportActionBar().hide();

        // Nếu đã đăng nhập rồi thì vào thẳng MainActivity
        if (SessionManager.getInstance().isLoggedIn()) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        tvRegister = findViewById(R.id.tvRegister);
        progressBar = findViewById(R.id.progressBar); 

        tvForgotPassword.setOnClickListener(v ->
                startActivity(new Intent(this, ForgotPasswordActivity.class)));

        tvRegister.setOnClickListener(v ->
                startActivity(new Intent(this, RegisterActivity.class)));

        btnLogin.setOnClickListener(v -> loginUser());
    }

    private void loginUser() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Nhập email");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Nhập mật khẩu");
            return;
        }

        setLoading(true);

        com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                .orderByChild("email").equalTo(email)
                .addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
                    @Override
                    public void onDataChange(com.google.firebase.database.DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            for (com.google.firebase.database.DataSnapshot userSnapshot : snapshot.getChildren()) {
                                String storedPassword = userSnapshot.child("password").getValue(String.class);
                                String uid = userSnapshot.child("uid").getValue(String.class);

                                if (storedPassword != null && org.mindrot.jbcrypt.BCrypt.checkpw(password, storedPassword)) {
                                    // Tạo JWT Token và lưu Session
                                    String token = JwtHelper.generateToken(uid, email);
                                    SessionManager.getInstance().saveSession(uid, token);

                                    setLoading(false);
                                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                                    finish();
                                    return;
                                }
                            }
                        }
                        setLoading(false);
                        Toast.makeText(LoginActivity.this, "Sai email hoặc mật khẩu", Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onCancelled(com.google.firebase.database.DatabaseError error) {
                        setLoading(false);
                        Toast.makeText(LoginActivity.this, error.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void setLoading(boolean loading) {
        btnLogin.setEnabled(!loading);
        if (progressBar != null)
            progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}