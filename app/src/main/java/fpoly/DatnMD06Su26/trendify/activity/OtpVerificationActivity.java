package fpoly.DatnMD06Su26.trendify.activity;

import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.firebase.Timestamp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthProvider;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import fpoly.DatnMD06Su26.trendify.JwtHelper;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;

public class OtpVerificationActivity extends AppCompatActivity {

    private TextView tvDescription, tvCountdown;
    private EditText etOtp1, etOtp2, etOtp3, etOtp4, etOtp5, etOtp6;
    private MaterialButton btnVerify, btnResend;
    private ProgressBar progressBar;

    private String verificationId;
    private PhoneAuthProvider.ForceResendingToken resendToken;
    private String fullName, email, password, phone, formattedPhone;
    
    private CountDownTimer countDownTimer;
    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_otp_verification);

        if (getSupportActionBar() != null) getSupportActionBar().hide();

        mAuth = FirebaseAuth.getInstance();

        // Get data from intent
        Intent intent = getIntent();
        verificationId = intent.getStringExtra("verificationId");
        resendToken = intent.getParcelableExtra("resendToken");
        fullName = intent.getStringExtra("fullName");
        email = intent.getStringExtra("email");
        password = intent.getStringExtra("password");
        phone = intent.getStringExtra("phone");
        formattedPhone = intent.getStringExtra("formattedPhone");

        initViews();
        setupOtpInputs();
        startCountdown();

        findViewById(R.id.ivBack).setOnClickListener(v -> finish());
        btnVerify.setOnClickListener(v -> verifyOtp());
        btnResend.setOnClickListener(v -> resendOtp());
    }

    private void initViews() {
        tvDescription = findViewById(R.id.tvDescription);
        tvCountdown = findViewById(R.id.tvCountdown);
        etOtp1 = findViewById(R.id.etOtp1);
        etOtp2 = findViewById(R.id.etOtp2);
        etOtp3 = findViewById(R.id.etOtp3);
        etOtp4 = findViewById(R.id.etOtp4);
        etOtp5 = findViewById(R.id.etOtp5);
        etOtp6 = findViewById(R.id.etOtp6);
        btnVerify = findViewById(R.id.btnVerify);
        btnResend = findViewById(R.id.btnResend);
        progressBar = findViewById(R.id.progressBar);

        tvDescription.setText("Đã gửi mã xác nhận đến\n" + phone);
    }

    private void setupOtpInputs() {
        EditText[] inputs = {etOtp1, etOtp2, etOtp3, etOtp4, etOtp5, etOtp6};
        for (int i = 0; i < inputs.length; i++) {
            final int index = i;
            inputs[i].addTextChangedListener(new TextWatcher() {
                @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
                @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                    if (s.length() == 1 && index < inputs.length - 1) {
                        inputs[index + 1].requestFocus();
                    }
                }
                @Override public void afterTextChanged(Editable s) {}
            });
        }
    }

    private void startCountdown() {
        btnResend.setEnabled(false);
        countDownTimer = new CountDownTimer(60000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                tvCountdown.setText(millisUntilFinished / 1000 + "s");
            }

            @Override
            public void onFinish() {
                tvCountdown.setText("0s");
                btnResend.setEnabled(true);
                Toast.makeText(OtpVerificationActivity.this, "Mã OTP đã hết hạn.", Toast.LENGTH_SHORT).show();
            }
        }.start();
    }

    private void verifyOtp() {
        String code = etOtp1.getText().toString() + etOtp2.getText() + etOtp3.getText() +
                     etOtp4.getText() + etOtp5.getText() + etOtp6.getText();

        if (code.length() < 6) {
            Toast.makeText(this, "Vui lòng nhập đầy đủ mã OTP", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);
        PhoneAuthCredential credential = PhoneAuthProvider.getCredential(verificationId, code);
        signInWithPhoneAuthCredential(credential);
    }

    private void signInWithPhoneAuthCredential(PhoneAuthCredential credential) {
        mAuth.signInWithCredential(credential)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        // Verification successful, proceed to create account
                        registerUserInSystem();
                    } else {
                        setLoading(false);
                        Toast.makeText(OtpVerificationActivity.this, "Mã OTP không đúng.", Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void registerUserInSystem() {
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
        userData.put("phoneVerified", true); // Requirement
        userData.put("createdAt", System.currentTimeMillis());
        
        FirebaseDatabase.getInstance().getReference("users")
                .child(newUserId)
                .setValue(userData)
                .addOnSuccessListener(aVoid -> {
                    // Generate JWT and auto login
                    String token = JwtHelper.generateToken(newUserId, email);
                    SessionManager.getInstance().saveSession(newUserId, token);

                    // Save profile to Firestore
                    UserProfile profile = new UserProfile(newUserId, fullName, email, phone, Timestamp.now());
                    FirestoreHelper.saveUserProfile(profile, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            setLoading(false);
                            Toast.makeText(OtpVerificationActivity.this, "Đăng ký thành công!", Toast.LENGTH_SHORT).show();
                            Intent intent = new Intent(OtpVerificationActivity.this, MainActivity.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(intent);
                            finish();
                        }

                        @Override
                        public void onFailure(String error) {
                            setLoading(false);
                            Toast.makeText(OtpVerificationActivity.this, "Đăng ký thành công, nhưng lỗi lưu hồ sơ: " + error, Toast.LENGTH_LONG).show();
                            startActivity(new Intent(OtpVerificationActivity.this, MainActivity.class));
                            finish();
                        }
                    });
                })
                .addOnFailureListener(e -> {
                    setLoading(false);
                    Toast.makeText(OtpVerificationActivity.this, "Lỗi đăng ký: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }

    private void resendOtp() {
        setLoading(true);
        com.google.firebase.auth.PhoneAuthOptions options =
                com.google.firebase.auth.PhoneAuthOptions.newBuilder(mAuth)
                        .setPhoneNumber(formattedPhone)
                        .setTimeout(60L, TimeUnit.SECONDS)
                        .setActivity(this)
                        .setCallbacks(new com.google.firebase.auth.PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                            @Override
                            public void onVerificationCompleted(@NonNull com.google.firebase.auth.PhoneAuthCredential credential) {
                                setLoading(false);
                            }

                            @Override
                            public void onVerificationFailed(@NonNull com.google.firebase.FirebaseException e) {
                                setLoading(false);
                                Toast.makeText(OtpVerificationActivity.this, "Gửi lại OTP thất bại: " + e.getMessage(), Toast.LENGTH_LONG).show();
                            }

                            @Override
                            public void onCodeSent(@NonNull String verId, @NonNull PhoneAuthProvider.ForceResendingToken token) {
                                setLoading(false);
                                verificationId = verId;
                                resendToken = token;
                                startCountdown();
                                Toast.makeText(OtpVerificationActivity.this, "Đã gửi lại mã OTP", Toast.LENGTH_SHORT).show();
                            }
                        })
                        .setForceResendingToken(resendToken)
                        .build();
        PhoneAuthProvider.verifyPhoneNumber(options);
    }

    private void setLoading(boolean loading) {
        btnVerify.setEnabled(!loading);
        btnResend.setEnabled(!loading && tvCountdown.getText().equals("0s"));
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) countDownTimer.cancel();
    }
}
