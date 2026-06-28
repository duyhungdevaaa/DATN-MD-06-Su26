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

import com.google.android.material.textfield.TextInputEditText;

import java.util.HashMap;
import java.util.Map;

public class ProfileFragment extends Fragment {

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
    private UserProfile currentProfile;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        ImageView ivSearch = view.findViewById(R.id.ivSearch);
        ImageView ivNotification = view.findViewById(R.id.ivNotification);
        ImageView ivMenu = view.findViewById(R.id.ivMenu);

        if (ivMenu != null) {
            ivMenu.setOnClickListener(v -> Toast.makeText(requireContext(), "Menu chính", Toast.LENGTH_SHORT).show());
        }
        if (ivSearch != null) {
            ivSearch.setOnClickListener(v -> {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).setCurrentPage(1);
                }
            });
        }
        if (ivNotification != null) {
            ivNotification.setOnClickListener(v -> {
                startActivity(new Intent(requireContext(), CartActivity.class));
            });
        }

        tvUserName = view.findViewById(R.id.tvUserName);
        // Old bindings commented out
        /*
        tvUserEmail = view.findViewById(R.id.tvUserEmail);

        llEditProfile = view.findViewById(R.id.llEditProfile);
        llMyOrders = view.findViewById(R.id.llMyOrders);
        llDeliveryAddress = view.findViewById(R.id.llDeliveryAddress);
        llPaymentMethods = view.findViewById(R.id.llPaymentMethods);
        llNotifications = view.findViewById(R.id.llNotifications);
        btnHelpCenter = view.findViewById(R.id.btnHelpCenter);
        btnPrivacyPolicy = view.findViewById(R.id.btnPrivacyPolicy);
        btnTermsOfService = view.findViewById(R.id.btnTermsOfService);
        llSettings = view.findViewById(R.id.llSettings);
        llLogout = view.findViewById(R.id.llLogout);

        llEditProfile.setOnClickListener(v -> handleEditProfile());
        llMyOrders.setOnClickListener(v -> handleMyOrders());
        llDeliveryAddress.setOnClickListener(v -> handleDeliveryAddress());
        llPaymentMethods.setOnClickListener(v -> handlePaymentMethods());
        llNotifications.setOnClickListener(v -> handleNotifications());
        btnHelpCenter.setOnClickListener(v -> handleHelpCenter());
        btnPrivacyPolicy.setOnClickListener(v -> handlePrivacyPolicy());
        btnTermsOfService.setOnClickListener(v -> handleTermsOfService());
        llSettings.setOnClickListener(v -> handleSettings());
        llLogout.setOnClickListener(v -> showLogoutDialog());
        */

        loadUserProfile();
        return view;
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
                // if (tvUserEmail != null) tvUserEmail.setText(profile.getEmail());
            }

            @Override
            public void onFailure(String error) {
                String displayName = "Khách hàng";
                String email = "";
                currentProfile = new UserProfile(SessionManager.getInstance().getUserId(), displayName, email, "", null);
                if (tvUserName != null) tvUserName.setText(displayName);
                // if (tvUserEmail != null) tvUserEmail.setText(email);
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

        etFullName.setText(currentProfile.getFullName());
        etPhone.setText(currentProfile.getPhone());

        builder.setTitle("Cập nhật hồ sơ")
                .setView(dialogView)
                .setPositiveButton("Lưu", (dialog, which) -> {
                    String fullName = etFullName.getText() != null ? etFullName.getText().toString().trim() : "";
                    String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                    if (fullName.isEmpty()) {
                        Toast.makeText(getContext(), "Họ tên không được để trống", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    Map<String, Object> updates = new HashMap<>();
                    updates.put("fullName", fullName);
                    updates.put("phone", phone);
                    FirestoreHelper.updateUserProfile(updates, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            currentProfile.setFullName(fullName);
                            currentProfile.setPhone(phone);
                            tvUserName.setText(fullName);
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

    private void showLoggedOutState() {
        if (tvUserName != null) tvUserName.setText("Chưa đăng nhập");
        // if (tvUserEmail != null) tvUserEmail.setText("");
    }
}
