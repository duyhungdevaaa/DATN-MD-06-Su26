package fpoly.DatnMD06Su26.trendify.fragment;

import fpoly.DatnMD06Su26.trendify.SessionManager;
import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.LoginActivity;
import fpoly.DatnMD06Su26.trendify.model.UserProfile;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.textfield.TextInputEditText;

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

        tvUserName = view.findViewById(R.id.tvUserName);
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

        loadUserProfile();
        return view;
    }

    private void loadUserProfile() {
        // Sử dụng dữ liệu giả lập (Mock) cho Front-end
        currentProfile = new UserProfile("mock_uid", "Nguyễn Văn A", "nguyenvana@email.com", "0123456789", null);
        tvUserName.setText(currentProfile.getFullName());
        tvUserEmail.setText(currentProfile.getEmail());
    }

    private void handleEditProfile() {
        if (currentProfile == null) {
            loadUserProfile();
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
                    
                    // Giả lập lưu cục bộ cho Front-end
                    currentProfile.setFullName(fullName);
                    currentProfile.setPhone(phone);
                    tvUserName.setText(fullName);
                    Toast.makeText(getContext(), "Cập nhật hồ sơ thành công", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private void handleMyOrders() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handleDeliveryAddress() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handlePaymentMethods() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handleNotifications() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handleHelpCenter() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handlePrivacyPolicy() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handleTermsOfService() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
    }

    private void handleSettings() {
        Toast.makeText(getContext(), "Tính năng đang phát triển", Toast.LENGTH_SHORT).show();
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
}
