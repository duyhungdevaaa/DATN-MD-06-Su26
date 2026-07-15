package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.model.UserAddress;
import fpoly.DatnMD06Su26.trendify.helper.FirestoreHelper;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;
import java.util.List;

public class ShippingAddressActivity extends AppCompatActivity {

    private LinearLayout addressContainer;
    private TextView tvEmptyAddresses;
    private MaterialButton btnAddAddress;
    private MaterialButton btnContinue;

    private final List<UserAddress> addresses = new ArrayList<>();
    private UserAddress selectedAddress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shipping_address);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.topBar), (v, insets) -> {
            Insets s = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(v.getPaddingLeft(), s.top, v.getPaddingRight(), v.getPaddingBottom());
            return insets;
        });

        initViews();
        setupActions();
        loadAddresses();
    }

    private void initViews() {
        addressContainer = findViewById(R.id.addressContainer);
        tvEmptyAddresses = findViewById(R.id.tvEmptyAddresses);
        btnAddAddress = findViewById(R.id.btnAddAddress);
        btnContinue = findViewById(R.id.btnContinue);
    }

    private void setupActions() {
        findViewById(R.id.ivBack).setOnClickListener(v -> finish());
        btnAddAddress.setOnClickListener(v -> showAddressTypeSelector());
        btnContinue.setOnClickListener(v -> {
            if (selectedAddress == null) {
                showMessage("Vui lòng chọn địa chỉ giao hàng");
                return;
            }
            Intent intent = new Intent(this, PaymentMethodActivity.class);
            intent.putExtra("shipping_address", buildAddressSummary(selectedAddress));
            startActivity(intent);
        });
    }

    private void loadAddresses() {
        FirestoreHelper.loadAddresses(new FirestoreHelper.AddressesCallback() {
            @Override
            public void onLoaded(List<UserAddress> loadedAddresses) {
                addresses.clear();
                addresses.addAll(loadedAddresses);

                if (selectedAddress != null) {
                    for (UserAddress address : addresses) {
                        if (selectedAddress.getId() != null && selectedAddress.getId().equals(address.getId())) {
                            selectedAddress = address;
                            break;
                        }
                    }
                }

                if (selectedAddress == null && !addresses.isEmpty()) {
                    for (UserAddress address : addresses) {
                        if (address.isDefault()) {
                            selectedAddress = address;
                            break;
                        }
                    }
                    if (selectedAddress == null) {
                        selectedAddress = addresses.get(0);
                    }
                }

                refreshViews();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Không thể tải địa chỉ: " + error);
            }
        });
    }

    private void refreshViews() {
        addressContainer.removeAllViews();
        tvEmptyAddresses.setVisibility(addresses.isEmpty() ? View.VISIBLE : View.GONE);

        for (UserAddress address : addresses) {
            View itemView = LayoutInflater.from(this).inflate(R.layout.item_shipping_address, addressContainer, false);
            MaterialCardView card = (MaterialCardView) itemView;
            TextView tvLabel = itemView.findViewById(R.id.tvAddressLabel);
            TextView tvDefaultBadge = itemView.findViewById(R.id.tvDefaultBadge);
            TextView tvName = itemView.findViewById(R.id.tvAddressName);
            TextView tvPhone = itemView.findViewById(R.id.tvAddressPhone);
            TextView tvDetail = itemView.findViewById(R.id.tvAddressDetail);

            tvLabel.setText(address.getLabel() != null ? address.getLabel() : "Địa chỉ");
            tvDefaultBadge.setVisibility(address.isDefault() ? View.VISIBLE : View.GONE);
            tvName.setText(address.getName());
            tvPhone.setText(address.getPhone());
            tvDetail.setText(address.getAddress());

            boolean isSelected = selectedAddress != null && selectedAddress.getId() != null && selectedAddress.getId().equals(address.getId());
            card.setStrokeWidth(isSelected ? 4 : 1);
            card.setStrokeColor(getColor(isSelected ? R.color.trend_text : R.color.trend_border));

            card.setOnClickListener(v -> selectAddress(address));
            addressContainer.addView(card);
        }
    }

    private void selectAddress(UserAddress address) {
        if (address == null) {
            showMessage("Địa chỉ chưa có. Vui lòng thêm địa chỉ mới.");
            return;
        }
        selectedAddress = address;
        showMessage("Đã chọn: " + address.getLabel());
        refreshViews();
    }

    private void updateCardSelection(MaterialCardView card, boolean selected) {
        if (card == null) {
            return;
        }
        card.setStrokeWidth(selected ? 4 : 1);
        card.setStrokeColor(getColor(selected ? R.color.trend_text : R.color.trend_border));
    }

    private void showAddressTypeSelector() {
        String[] types = {"Nhà riêng", "Văn phòng"};
        new AlertDialog.Builder(this)
                .setTitle("Chọn loại địa chỉ")
                .setItems(types, (dialog, which) -> {
                    if (which == 0) {
                        showAddressForm("home", null);
                    } else if (which == 1) {
                        showAddressForm("office", null);
                    }
                })
                .show();
    }

    private void showAddressForm(String type, UserAddress existingAddress) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_address_form, null);
        TextInputEditText etName = dialogView.findViewById(R.id.etAddressName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etAddressPhone);
        TextInputEditText etAddress = dialogView.findViewById(R.id.etAddressDetail);

        if (existingAddress != null) {
            etName.setText(existingAddress.getName());
            etPhone.setText(existingAddress.getPhone());
            etAddress.setText(existingAddress.getAddress());
        }

        new AlertDialog.Builder(this)
                .setTitle(existingAddress == null ? "Thêm địa chỉ" : "Sửa địa chỉ")
                .setView(dialogView)
                .setPositiveButton("Lưu", (dialog, which) -> {
                    String name = etName.getText() != null ? etName.getText().toString().trim() : "";
                    String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
                    String addressText = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
                    if (name.isEmpty() || phone.isEmpty() || addressText.isEmpty()) {
                        showMessage("Vui lòng nhập đầy đủ thông tin địa chỉ");
                        return;
                    }
                    UserAddress address = existingAddress != null ? existingAddress : new UserAddress();
                    address.setType(type);
                    address.setLabel(type.equals("home") ? "Nhà riêng" : "Văn phòng");
                    address.setName(name);
                    address.setPhone(phone);
                    address.setAddress(addressText);
                    FirestoreHelper.saveAddress(address, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            showMessage("Lưu địa chỉ thành công");
                            if (selectedAddress == null) {
                                selectedAddress = address;
                            }
                            loadAddresses();
                        }

                        @Override
                        public void onFailure(String error) {
                            showMessage("Lưu địa chỉ thất bại: " + error);
                        }
                    });
                })
                .setNegativeButton("Hủy", null)
                .show();
    }

    private String formatAddressSummary(UserAddress address) {
        if (address == null) {
            return "";
        }
        return address.getName() + "\n" + address.getPhone() + "\n" + address.getAddress();
    }

    private String buildAddressSummary(UserAddress address) {
        if (address == null) {
            return "";
        }
        return address.getLabel() + ": " + address.getName() + " - " + address.getPhone() + "\n" + address.getAddress();
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
