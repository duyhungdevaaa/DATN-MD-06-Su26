package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;

import fpoly.DatnMD06Su26.trendify.R;

import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.net.Uri;
import android.provider.MediaStore;
import java.io.File;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import com.google.android.material.textfield.TextInputEditText;

import java.util.HashMap;
import java.util.Map;

public class ProfileFragment extends Fragment {

    private static final int PICK_IMAGE_REQUEST = 101;
    private static final int CAPTURE_IMAGE_REQUEST = 102;
    private ImageView activeIvAvatarPreview;
    private TextInputEditText activeEtAvatarUrl;
    private Uri cameraImageUri;

    private LinearLayout llEditProfile;
    private LinearLayout llMyOrders;
    private LinearLayout llDeliveryAddress;
    private LinearLayout llPaymentMethods;
    private LinearLayout llNotifications;
    private LinearLayout btnHelpCenter;
    private LinearLayout btnPrivacyPolicy;
    private LinearLayout btnTermsOfService;
    private LinearLayout llSettings;
    private LinearLayout llLogout;
    private TextView tvUserName;
    private TextView tvUserEmail;
    private ImageView ivUserAvatar;
    private UserProfile currentProfile;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        ImageView ivSettings = view.findViewById(R.id.ivSettings);
        ImageView ivCart = view.findViewById(R.id.ivCart);
        ImageView ivChat = view.findViewById(R.id.ivChat);

        if (ivSettings != null) {
            ivSettings.setOnClickListener(v -> handleSettings());
        }
        if (ivCart != null) {
            ivCart.setOnClickListener(v -> {
                startActivity(new Intent(requireContext(), CartActivity.class));
            });
        }
        if (ivChat != null) {
            ivChat.setOnClickListener(v -> handleNotifications());
        }

        tvUserName = view.findViewById(R.id.tvUserName);
        if (tvUserName != null) {
            tvUserName.setOnClickListener(v -> handleEditProfile());
        }

        llMyOrders = view.findViewById(R.id.llMyOrders);
        if (llMyOrders != null) {
            llMyOrders.setOnClickListener(v -> handleMyOrders());
        }

        LinearLayout llWaitingConfirm = view.findViewById(R.id.llWaitingConfirm);
        LinearLayout llWaitingPickup = view.findViewById(R.id.llWaitingPickup);
        LinearLayout llShipping = view.findViewById(R.id.llShipping);
        LinearLayout llRate = view.findViewById(R.id.llRate);

        if (llWaitingConfirm != null) {
            llWaitingConfirm.setOnClickListener(v -> openOrderHistoryWithFilter("CHO_XAC_NHAN"));
        }
        if (llWaitingPickup != null) {
            llWaitingPickup.setOnClickListener(v -> openOrderHistoryWithFilter("CHO_LAY_HANG"));
        }
        if (llShipping != null) {
            llShipping.setOnClickListener(v -> openOrderHistoryWithFilter("DANG_GIAO"));
        }
        if (llRate != null) {
            llRate.setOnClickListener(v -> openPlayStoreForRating());
        }

        ivUserAvatar = view.findViewById(R.id.ivUserAvatar);

        return view;
    }

    private void openPlayStoreForRating() {
        if (getContext() == null) return;
        String packageName = getContext().getPackageName();
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("market://details?id=" + packageName));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (android.content.ActivityNotFoundException e) {
            Intent intent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://play.google.com/store/apps/details?id=" + packageName));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }
    }

    private void openOrderHistoryWithFilter(String statusFilter) {
        Intent intent = new Intent(getContext(), OrderHistoryActivity.class);
        intent.putExtra("ORDER_STATUS_FILTER", statusFilter);
        startActivity(intent);
    }

    private void loadUserProfile() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            showLoggedOutState();
            return;
        }

        FirestoreHelper.loadUserProfile(new FirestoreHelper.ProfileCallback() {
            @Override
            public void onLoaded(UserProfile profile) {
                currentProfile = profile;
                if (tvUserName != null) tvUserName.setText(profile.getFullName());
                if (ivUserAvatar != null) {
                    updateAvatarUI(profile.getAvatar());
                }
                
                View view = getView();
                if (view != null) {
                    TextView tvWalletBalance = view.findViewById(R.id.tvWalletBalance);
                    if (tvWalletBalance != null) {
                        tvWalletBalance.setText(String.format("%,dđ", profile.getWalletBalance()).replace(",", "."));
                    }
                }
            }

            @Override
            public void onFailure(String error) {
                String displayName = "Khách hàng";
                String email = "";
                currentProfile = new UserProfile(SessionManager.getInstance().getUserId(), displayName, email, "", null);
                if (tvUserName != null) tvUserName.setText(displayName);
                // if (tvUserEmail != null) tvUserEmail.setText(email);
                if (ivUserAvatar != null) {
                    showAvatarPlaceholder();
                }
                Toast.makeText(getContext(), "Không thể tải hồ sơ: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void handleEditProfile() {
        if (!SessionManager.getInstance().isLoggedIn()) {
            startActivity(new Intent(requireContext(), LoginActivity.class));
            return;
        }
        if (currentProfile == null) {
            Toast.makeText(getContext(), "Đang tải hồ sơ...", Toast.LENGTH_SHORT).show();
            loadUserProfile();
            return;
        }
        showEditProfileDialog();
    }

    private void showEditProfileDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        View dialogView = LayoutInflater.from(getContext()).inflate(R.layout.dialog_edit_profile, null);
        TextInputEditText etFullName = dialogView.findViewById(R.id.etFullName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etPhone);
        TextInputEditText etEmail = dialogView.findViewById(R.id.etEmail);
        TextInputEditText etAvatarUrl = dialogView.findViewById(R.id.etAvatarUrl);
        ImageView ivDialogAvatarPreview = dialogView.findViewById(R.id.ivDialogAvatarPreview);

        etFullName.setText(currentProfile.getFullName());
        etPhone.setText(currentProfile.getPhone());
        etEmail.setText(currentProfile.getEmail());
        etAvatarUrl.setText(currentProfile.getAvatar());

        if (currentProfile.getAvatar() != null && !currentProfile.getAvatar().isEmpty()) {
            com.bumptech.glide.Glide.with(this)
                    .load(currentProfile.getAvatar())
                    .placeholder(R.drawable.ic_person)
                    .error(R.drawable.ic_person)
                    .into(ivDialogAvatarPreview);
        } else {
            ivDialogAvatarPreview.setImageResource(R.drawable.ic_person);
        }

        ivDialogAvatarPreview.setOnClickListener(v -> {
            activeIvAvatarPreview = ivDialogAvatarPreview;
            activeEtAvatarUrl = etAvatarUrl;
            showImagePickerDialog();
        });

        etAvatarUrl.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(android.text.Editable s) {
                String newUrl = s.toString().trim();
                if (!newUrl.isEmpty()) {
                    com.bumptech.glide.Glide.with(ProfileFragment.this)
                            .load(newUrl)
                            .placeholder(R.drawable.ic_person)
                            .error(R.drawable.ic_person)
                            .into(ivDialogAvatarPreview);
                } else {
                    ivDialogAvatarPreview.setImageResource(R.drawable.ic_person);
                }
            }
        });

        builder.setTitle("Cập nhật hồ sơ")
                .setView(dialogView)
                .setPositiveButton("Lưu", (dialog, which) -> {
                    String fullName = etFullName.getText() != null ? etFullName.getText().toString().trim() : "";
                    String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                    String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
                    String avatar = etAvatarUrl.getText() != null ? etAvatarUrl.getText().toString().trim() : "";

                    if (fullName.isEmpty()) {
                        Toast.makeText(getContext(), "Họ tên không được để trống", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    Map<String, Object> updates = new HashMap<>();
                    updates.put("fullName", fullName);
                    updates.put("phone", phone);
                    updates.put("email", email);
                    updates.put("avatar", avatar);

                    FirestoreHelper.updateUserProfile(updates, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            currentProfile.setFullName(fullName);
                            currentProfile.setPhone(phone);
                            currentProfile.setEmail(email);
                            currentProfile.setAvatar(avatar);
                            tvUserName.setText(fullName);
                            updateAvatarUI(avatar);
                            Toast.makeText(getContext(), "Cập nhật hồ sơ thành công", Toast.LENGTH_SHORT).show();
                        }

                        @Override
                        public void onFailure(String error) {
                            Toast.makeText(getContext(), "Cập nhật hồ sơ thất bại: " + error, Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void handleMyOrders() {
        startActivity(new Intent(getContext(), OrderHistoryActivity.class));
    }

    private void handleDeliveryAddress() {
        startActivity(new Intent(getContext(), AddressManagementActivity.class));
    }

    private void handlePaymentMethods() {
        startActivity(new Intent(getContext(), PaymentMethodActivity.class));
    }

    private void handleNotifications() {
        startActivity(new Intent(getContext(), NotificationsActivity.class));
    }

    private void handleHelpCenter() {
        startActivity(new Intent(getContext(), HelpCenterActivity.class));
    }

    private void handlePrivacyPolicy() {
        startActivity(new Intent(getContext(), PrivacyPolicyActivity.class));
    }

    private void handleTermsOfService() {
        startActivity(new Intent(getContext(), TermsActivity.class));
    }

    private void handleSettings() {
        startActivity(new Intent(getContext(), SettingsActivity.class));
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Đăng Xuất")
                .setMessage("Bạn có chắc chắn muốn đăng xuất?")
                .setPositiveButton("Có", (dialog, which) -> performLogout())
                .setNegativeButton("Không", null)
                .show();
    }

    private void performLogout() {
        SessionManager.getInstance().logout();
        Intent intent = new Intent(getContext(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }

    private void showAvatarPlaceholder() {
        if (ivUserAvatar == null) return;
        // Convert 12dp to px correctly
        int pad = (int) (12 * getResources().getDisplayMetrics().density);
        ivUserAvatar.setImageResource(R.drawable.ic_person);
        ivUserAvatar.setPadding(pad, pad, pad, pad);
        ivUserAvatar.setColorFilter(android.graphics.Color.parseColor("#BDBDBD"),
                android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private void updateAvatarUI(String avatar) {
        if (ivUserAvatar == null) return;
        if (avatar != null && !avatar.isEmpty()) {
            ivUserAvatar.setPadding(0, 0, 0, 0);
            ivUserAvatar.setColorFilter(null);
            com.bumptech.glide.Glide.with(ProfileFragment.this)
                    .load(avatar)
                    .placeholder(R.drawable.ic_person)
                    .error(R.drawable.ic_person)
                    .into(ivUserAvatar);
        } else {
            showAvatarPlaceholder();
        }
    }

    private void showLoggedOutState() {
        if (tvUserName != null) tvUserName.setText("Chưa đăng nhập");
        // if (tvUserEmail != null) tvUserEmail.setText("");
        showAvatarPlaceholder();
    }

    @Override
    public void onResume() {
        super.onResume();
        loadUserProfile();
    }

    private void showImagePickerDialog() {
        CharSequence[] options = {"Chụp ảnh", "Chọn từ thư viện"};
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle("Chọn ảnh đại diện");
        builder.setItems(options, (dialog, item) -> {
            if (options[item].equals("Chụp ảnh")) {
                openCamera();
            } else if (options[item].equals("Chọn từ thư viện")) {
                openGallery();
            }
        });
        builder.show();
    }

    private void openGallery() {
        Intent pickIntent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(pickIntent, PICK_IMAGE_REQUEST);
    }

    private void openCamera() {
        Intent takePictureIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(requireContext().getPackageManager()) != null) {
            try {
                java.io.File photoFile = java.io.File.createTempFile(
                        "avatar_capture_",
                        ".jpg",
                        requireContext().getCacheDir()
                );
                cameraImageUri = androidx.core.content.FileProvider.getUriForFile(
                        requireContext(),
                        "fpoly.DatnMD06Su26.trendify.fileprovider",
                        photoFile
                );
                takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, cameraImageUri);
                takePictureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                startActivityForResult(takePictureIntent, CAPTURE_IMAGE_REQUEST);
            } catch (Exception e) {
                Toast.makeText(getContext(), "Không thể chụp ảnh: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(getContext(), "Không tìm thấy ứng dụng chụp ảnh", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == android.app.Activity.RESULT_OK) {
            if (requestCode == PICK_IMAGE_REQUEST && data != null && data.getData() != null) {
                android.net.Uri selectedImageUri = data.getData();
                uploadAvatarToFirebaseStorage(selectedImageUri);
            } else if (requestCode == CAPTURE_IMAGE_REQUEST && cameraImageUri != null) {
                uploadAvatarToFirebaseStorage(cameraImageUri);
            }
        }
    }

    private void uploadAvatarToFirebaseStorage(android.net.Uri imageUri) {
        if (activeIvAvatarPreview == null || activeEtAvatarUrl == null) return;

        String uid = currentProfile != null ? currentProfile.getUid() : (SessionManager.getInstance().getUserId() != null ? SessionManager.getInstance().getUserId() : "unknown");

        android.app.ProgressDialog progressDialog = new android.app.ProgressDialog(getContext());
        progressDialog.setTitle("Đang tải ảnh lên...");
        progressDialog.setMessage("Vui lòng chờ giây lát...");
        progressDialog.setCancelable(false);
        progressDialog.show();

        com.google.firebase.storage.StorageReference ref = com.google.firebase.storage.FirebaseStorage.getInstance().getReference("avatars/" + uid + "_" + System.currentTimeMillis() + ".jpg");
        ref.putFile(imageUri)
                .addOnSuccessListener(taskSnapshot -> {
                    ref.getDownloadUrl().addOnSuccessListener(uri -> {
                        progressDialog.dismiss();
                        String downloadUrl = uri.toString();

                        activeEtAvatarUrl.setText(downloadUrl);

                        com.bumptech.glide.Glide.with(ProfileFragment.this)
                                .load(downloadUrl)
                                .placeholder(R.drawable.ic_person)
                                .error(R.drawable.ic_person)
                                .into(activeIvAvatarPreview);

                        Toast.makeText(getContext(), "Tải ảnh lên thành công!", Toast.LENGTH_SHORT).show();
                    });
                })
                .addOnFailureListener(e -> {
                    progressDialog.dismiss();
                    Toast.makeText(getContext(), "Tải ảnh lên thất bại: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
    }
}
