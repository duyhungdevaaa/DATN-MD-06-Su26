package fpoly.DatnMD06Su26.trendify.activity;

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
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.AdapterView;
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
        btnAddAddress.setOnClickListener(v -> showAddressForm("address", null));
        btnContinue.setOnClickListener(v -> {
            if (selectedAddress == null) {
                showMessage("Vui lòng chọn địa chỉ giao hàng");
                return;
            }
            if (selectedAddress.getPhone() == null || selectedAddress.getPhone().trim().isEmpty()) {
                showMessage("Bắt buộc phải có Số Điện Thoại mới được đặt hàng! Vui lòng cập nhật địa chỉ.");
                return;
            }
            Intent intent = new Intent(this, PaymentMethodActivity.class);
            intent.putExtra("shipping_address", buildAddressSummary(selectedAddress));
            if (getIntent().hasExtra("SELECTED_CART_ITEM_IDS")) {
                intent.putStringArrayListExtra("SELECTED_CART_ITEM_IDS", getIntent().getStringArrayListExtra("SELECTED_CART_ITEM_IDS"));
            }
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
            TextView tvDefaultBadge = itemView.findViewById(R.id.tvDefaultBadge);
            TextView tvName = itemView.findViewById(R.id.tvName);
            TextView tvPhone = itemView.findViewById(R.id.tvPhone);
            TextView tvDetail = itemView.findViewById(R.id.tvAddress);
            android.widget.RadioButton rbSelect = itemView.findViewById(R.id.rbSelect);
            android.widget.ImageView ivEdit = itemView.findViewById(R.id.ivEdit);
            com.google.android.material.card.MaterialCardView cardAddress = itemView.findViewById(R.id.cardAddress);

            tvDefaultBadge.setVisibility(address.isDefault() ? View.VISIBLE : View.GONE);
            tvName.setText(address.getName());
            tvPhone.setText(address.getPhone());
            tvDetail.setText(address.getAddress());

            boolean isSelected = selectedAddress != null && selectedAddress.getId() != null && selectedAddress.getId().equals(address.getId());
            rbSelect.setChecked(isSelected);
            cardAddress.setStrokeColor(android.graphics.Color.parseColor(isSelected ? "#3B82F6" : "#E2E8F0"));
            cardAddress.setStrokeWidth(isSelected ? 4 : 2);
            cardAddress.setCardBackgroundColor(android.graphics.Color.parseColor(isSelected ? "#F8FAFC" : "#FFFFFF"));

            ivEdit.setOnClickListener(v -> showAddressForm("address", address));
            cardAddress.setOnClickListener(v -> selectAddress(address));
            addressContainer.addView(itemView);
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

    private int tempDistrictId = -1;
    private String tempWardCode = "";

    private void showAddressForm(String type, UserAddress existingAddress) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_address_form, null);
        TextInputEditText etName = dialogView.findViewById(R.id.etAddressName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etAddressPhone);
        TextInputEditText etAddress = dialogView.findViewById(R.id.etAddressDetail);

        android.widget.AutoCompleteTextView spinnerProvince = dialogView.findViewById(R.id.spinnerProvince);
        android.widget.AutoCompleteTextView spinnerDistrict = dialogView.findViewById(R.id.spinnerDistrict);
        android.widget.AutoCompleteTextView spinnerWard = dialogView.findViewById(R.id.spinnerWard);

        ArrayAdapter<GHNLocationHelper.Province> provinceAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line);
        spinnerProvince.setAdapter(provinceAdapter);

        ArrayAdapter<GHNLocationHelper.District> districtAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line);
        spinnerDistrict.setAdapter(districtAdapter);

        ArrayAdapter<GHNLocationHelper.Ward> wardAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line);
        spinnerWard.setAdapter(wardAdapter);

        tempDistrictId = -1;
        tempWardCode = "";

        GHNLocationHelper.getProvinces(new GHNLocationHelper.LocationCallback<GHNLocationHelper.Province>() {
            @Override
            public void onSuccess(List<GHNLocationHelper.Province> items) {
                provinceAdapter.clear();
                provinceAdapter.addAll(items);
            }
            @Override
            public void onFailure(String error) { showMessage(error); }
        });

        spinnerProvince.setOnItemClickListener((parent, view, position, id) -> {
            GHNLocationHelper.Province p = provinceAdapter.getItem(position);
            if (p != null) {
                GHNLocationHelper.getDistricts(p.id, new GHNLocationHelper.LocationCallback<GHNLocationHelper.District>() {
                    @Override
                    public void onSuccess(List<GHNLocationHelper.District> items) {
                        districtAdapter.clear();
                        districtAdapter.addAll(items);
                        spinnerDistrict.setText("", false);
                        wardAdapter.clear();
                        spinnerWard.setText("", false);
                        tempDistrictId = -1;
                        tempWardCode = "";
                    }
                    @Override
                    public void onFailure(String error) { showMessage(error); }
                });
            }
        });

        spinnerDistrict.setOnItemClickListener((parent, view, position, id) -> {
            GHNLocationHelper.District d = districtAdapter.getItem(position);
            if (d != null) {
                tempDistrictId = d.id;
                GHNLocationHelper.getWards(d.id, new GHNLocationHelper.LocationCallback<GHNLocationHelper.Ward>() {
                    @Override
                    public void onSuccess(List<GHNLocationHelper.Ward> items) {
                        wardAdapter.clear();
                        wardAdapter.addAll(items);
                        spinnerWard.setText("", false);
                        tempWardCode = "";
                    }
                    @Override
                    public void onFailure(String error) { showMessage(error); }
                });
            }
        });

        spinnerWard.setOnItemClickListener((parent, view, position, id) -> {
            GHNLocationHelper.Ward w = wardAdapter.getItem(position);
            if (w != null) {
                tempWardCode = w.code;
            }
        });

        if (existingAddress != null) {
            etName.setText(existingAddress.getName());
            etPhone.setText(existingAddress.getPhone());
            // It's tricky to re-select the spinners based on existing address without mapping IDs.
            // For now just fill the text field.
            String existingAddrText = existingAddress.getAddress();
            if (existingAddrText.contains(", ")) {
                 String[] parts = existingAddrText.split(", ");
                 etAddress.setText(parts[0]);
            } else {
                 etAddress.setText(existingAddress.getAddress());
            }
            tempDistrictId = existingAddress.getDistrictId();
            tempWardCode = existingAddress.getWardCode();
        }

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle(existingAddress == null ? "Thêm địa chỉ" : "Sửa địa chỉ")
                .setView(dialogView)
                .setPositiveButton("Lưu", null)
                .setNegativeButton("Hủy", null)
                .create();

        dialog.show();
        android.widget.Button btnSave = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
        btnSave.setOnClickListener(v -> {
            String name = etName.getText() != null ? etName.getText().toString().trim() : "";
            String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
            String addressText = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";

            if (name.isEmpty() || phone.isEmpty() || addressText.isEmpty()) {
                showMessage("Vui lòng nhập đầy đủ thông tin");
                return;
            } 
            if (tempDistrictId == -1 || tempWardCode.isEmpty()) {
                showMessage("Vui lòng chọn Tỉnh/Huyện/Xã");
                return;
            }

            String fullAddress = addressText;
            String prov = spinnerProvince.getText().toString();
            String dist = spinnerDistrict.getText().toString();
            String ward = spinnerWard.getText().toString();

            if (!ward.isEmpty() && !dist.isEmpty() && !prov.isEmpty()) {
                 fullAddress = addressText + ", " + ward + ", " + dist + ", " + prov;
            }

            UserAddress address = existingAddress != null ? existingAddress : new UserAddress();
            address.setType(type);
            address.setLabel("Địa chỉ");
            address.setName(name);
            address.setPhone(phone);
            address.setAddress(fullAddress);
            if (tempDistrictId != -1) address.setDistrictId(tempDistrictId);
            if (!tempWardCode.isEmpty()) address.setWardCode(tempWardCode);

            FirestoreHelper.saveAddress(address, new FirestoreHelper.SimpleCallback() {
                @Override
                public void onSuccess() {
                    showMessage("Lưu địa chỉ thành công");
                    if (selectedAddress == null || (selectedAddress.getId() != null && selectedAddress.getId().equals(address.getId()))) {
                        selectedAddress = address;
                    }
                    loadAddresses();
                    dialog.dismiss();
                }

                @Override
                public void onFailure(String error) {
                    showMessage("Lưu địa chỉ thất bại: " + error);
                }
            });
        });
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
        return address.getId() + "|||" + address.getDistrictId() + "|||" + address.getWardCode() + "|||" + address.getLabel() + ": " + address.getName() + " - " + address.getPhone() + "\n" + address.getAddress();
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
