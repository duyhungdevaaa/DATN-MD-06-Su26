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

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;

import org.json.JSONObject;
import org.json.JSONException;
import java.util.Arrays;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etEmail, etPassword;
    private MaterialButton btnLogin;
    private TextView tvForgotPassword, tvRegister;
    private ProgressBar progressBar;

    private GoogleSignInClient mGoogleSignInClient;
    private CallbackManager mCallbackManager;
    private static final int RC_SIGN_IN = 9001;

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

        // Khởi tạo Google Sign-In
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        // Khởi tạo Facebook SDK & CallbackManager
        mCallbackManager = CallbackManager.Factory.create();
        LoginManager.getInstance().registerCallback(mCallbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                com.facebook.AccessToken accessToken = loginResult.getAccessToken();
                GraphRequest request = GraphRequest.newMeRequest(accessToken, new GraphRequest.GraphJSONObjectCallback() {
                    @Override
                    public void onCompleted(JSONObject object, GraphResponse response) {
                        try {
                            if (object != null) {
                                String name = object.optString("name", "Người dùng Facebook");
                                String email = object.optString("email", "");
                                if (email.isEmpty()) {
                                    email = object.optString("id", "") + "@facebook.com";
                                }
                                signInWithFacebookOnFirebase(accessToken.getToken(), name, email);
                            }
                        } catch (Exception e) {
                            Toast.makeText(LoginActivity.this, "Lỗi lấy thông tin Facebook: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }
                });
                Bundle parameters = new Bundle();
                parameters.putString("fields", "id,name,email");
                request.setParameters(parameters);
                request.executeAsync();
            }

            @Override
            public void onCancel() {
                Toast.makeText(LoginActivity.this, "Đăng nhập bằng Facebook bị hủy", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(FacebookException error) {
                Toast.makeText(LoginActivity.this, "Lỗi Facebook: " + error.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

        View btnGoogleLogin = findViewById(R.id.btnGoogleLogin);
        if (btnGoogleLogin != null) {
            btnGoogleLogin.setOnClickListener(v -> handleGoogleLogin());
        }

        View btnFacebookLogin = findViewById(R.id.btnFacebookLogin);
        if (btnFacebookLogin != null) {
            btnFacebookLogin.setOnClickListener(v -> handleFacebookLogin());
        }
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

    private void handleGoogleLogin() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    private void handleFacebookLogin() {
        LoginManager.getInstance().logInWithReadPermissions(this, Arrays.asList("public_profile"));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        mCallbackManager.onActivityResult(requestCode, resultCode, data);
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null) {
                    String name = account.getDisplayName();
                    String email = account.getEmail();
                    String idToken = account.getIdToken();
                    signInWithGoogleOnFirebase(idToken, name, email);
                }
            } catch (ApiException e) {
                Toast.makeText(this, "Google Sign-In failed: " + e.getStatusCode(), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void signInWithGoogleOnFirebase(String idToken, String name, String email) {
        setLoading(true);
        com.google.firebase.auth.AuthCredential credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null);
        com.google.firebase.auth.FirebaseAuth.getInstance().signInWithCredential(credential)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        com.google.firebase.auth.FirebaseUser user = task.getResult().getUser();
                        if (user != null) {
                            String photoUrl = user.getPhotoUrl() != null ? user.getPhotoUrl().toString() : "";
                            processFirebaseSocialUser(user.getUid(), name, email, photoUrl);
                        } else {
                            setLoading(false);
                            Toast.makeText(LoginActivity.this, "Không thể lấy thông tin Firebase User", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        setLoading(false);
                        Toast.makeText(LoginActivity.this, "Đăng nhập Firebase Auth thất bại: " + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void signInWithFacebookOnFirebase(String tokenString, String name, String email) {
        setLoading(true);
        com.google.firebase.auth.AuthCredential credential = com.google.firebase.auth.FacebookAuthProvider.getCredential(tokenString);
        com.google.firebase.auth.FirebaseAuth.getInstance().signInWithCredential(credential)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        com.google.firebase.auth.FirebaseUser user = task.getResult().getUser();
                        if (user != null) {
                            String photoUrl = user.getPhotoUrl() != null ? user.getPhotoUrl().toString() : "";
                            processFirebaseSocialUser(user.getUid(), name, email, photoUrl);
                        } else {
                            setLoading(false);
                            Toast.makeText(LoginActivity.this, "Không thể lấy thông tin Firebase User", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        setLoading(false);
                        Toast.makeText(LoginActivity.this, "Đăng nhập Firebase Auth thất bại: " + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void processFirebaseSocialUser(String uid, String fullName, String email, String avatarUrl) {
        com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                .child(uid)
                .addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
                    @Override
                    public void onDataChange(com.google.firebase.database.DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            String token = JwtHelper.generateToken(uid, email);
                            SessionManager.getInstance().saveSession(uid, token);

                            setLoading(false);
                            Toast.makeText(LoginActivity.this, "Đăng nhập thành công!", Toast.LENGTH_SHORT).show();
                            startActivity(new Intent(LoginActivity.this, MainActivity.class));
                            finish();
                        } else {
                            String hashedDummyPassword = org.mindrot.jbcrypt.BCrypt.hashpw("social_login_dummy_password", org.mindrot.jbcrypt.BCrypt.gensalt());

                            java.util.Map<String, Object> userData = new java.util.HashMap<>();
                            userData.put("uid", uid);
                            userData.put("email", email);
                            userData.put("password", hashedDummyPassword);
                            userData.put("fullName", fullName);
                            userData.put("avatar", avatarUrl);
                            userData.put("avatarUrl", avatarUrl);
                            userData.put("createdAt", System.currentTimeMillis());

                            com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                                    .child(uid)
                                    .setValue(userData)
                                    .addOnSuccessListener(aVoid -> {
                                        String token = JwtHelper.generateToken(uid, email);
                                        SessionManager.getInstance().saveSession(uid, token);

                                        UserProfile profile = new UserProfile(uid, fullName, email, "", com.google.firebase.Timestamp.now());
                                        profile.setAvatar(avatarUrl);
                                        FirestoreHelper.saveUserProfile(profile, new FirestoreHelper.SimpleCallback() {
                                            @Override
                                            public void onSuccess() {
                                                setLoading(false);
                                                Toast.makeText(LoginActivity.this, "Đăng nhập & tạo tài khoản thành công!", Toast.LENGTH_SHORT).show();
                                                startActivity(new Intent(LoginActivity.this, MainActivity.class));
                                                finish();
                                            }

                                            @Override
                                            public void onFailure(String error) {
                                                setLoading(false);
                                                Toast.makeText(LoginActivity.this, "Đăng nhập thành công!", Toast.LENGTH_SHORT).show();
                                                startActivity(new Intent(LoginActivity.this, MainActivity.class));
                                                finish();
                                            }
                                        });
                                    })
                                    .addOnFailureListener(e -> {
                                        setLoading(false);
                                        Toast.makeText(LoginActivity.this, "Đăng ký thất bại: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                                    });
                        }
                    }

                    @Override
                    public void onCancelled(com.google.firebase.database.DatabaseError error) {
                        setLoading(false);
                        Toast.makeText(LoginActivity.this, error.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }
}