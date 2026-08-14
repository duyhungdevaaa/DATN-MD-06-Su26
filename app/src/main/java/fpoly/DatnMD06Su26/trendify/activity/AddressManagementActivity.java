package fpoly.DatnMD06Su26.trendify.activity;

import fpoly.DatnMD06Su26.trendify.R;
import fpoly.DatnMD06Su26.trendify.activity.*;
import fpoly.DatnMD06Su26.trendify.fragment.*;
import fpoly.DatnMD06Su26.trendify.adapter.*;
import fpoly.DatnMD06Su26.trendify.model.*;
import fpoly.DatnMD06Su26.trendify.helper.*;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;
import java.util.List;

public class AddressManagementActivity extends AppCompatActivity {

    private ImageView ivBack;
    private MaterialButton btnAddAddress;
    private LinearLayout addressContainer;
    private List<UserAddress> addressesList = new ArrayList<>();
    private int tempDistrictId = -1;
    private String tempWardCode = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_address_management);

        initViews();
        setupToolbar();
        setupPrimaryAction();
        loadAddresses();
    }

    private void initViews() {
        ivBack = findViewById(R.id.ivBack);
        btnAddAddress = findViewById(R.id.btnAddAddress);
        addressContainer = findViewById(R.id.addressContainer);
    }

    private void setupToolbar() {
        ivBack.setOnClickListener(v -> finish());
    }

    private void setupPrimaryAction() {
        btnAddAddress.setOnClickListener(v -> showAddressForm(null));
    }

    private void loadAddresses() {
        FirestoreHelper.loadAddresses(new FirestoreHelper.AddressesCallback() {
            @Override
            public void onLoaded(List<UserAddress> addresses) {
                addressesList.clear();
                addressesList.addAll(addresses);
                refreshAddressViews();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Không thể tải địa chỉ: " + error);
            }
        });
    }

    private void refreshAddressViews() {
        addressContainer.removeAllViews();

        if (addressesList.isEmpty()) {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("Chưa có địa chỉ giao hàng nào");
            tvEmpty.setTextSize(14);
            tvEmpty.setTextColor(getColor(R.color.trend_muted));
            tvEmpty.setPadding(0, 40, 0, 40);
            tvEmpty.setGravity(android.view.Gravity.CENTER);
            addressContainer.addView(tvEmpty);
            return;
        }

        for (UserAddress address : addressesList) {
            View itemView = LayoutInflater.from(this).inflate(R.layout.item_address_management, addressContainer, false);
            TextView tvName = itemView.findViewById(R.id.tvAddressName);
            TextView tvPhone = itemView.findViewById(R.id.tvAddressPhone);
            TextView tvDetail = itemView.findViewById(R.id.tvAddressDetail);
            TextView tvDefaultBadge = itemView.findViewById(R.id.tvDefaultBadge);
            MaterialButton btnEdit = itemView.findViewById(R.id.btnEditAddress);
            MaterialButton btnSetDefault = itemView.findViewById(R.id.btnSetDefault);
            MaterialButton btnDelete = itemView.findViewById(R.id.btnDeleteAddress);

            tvName.setText(address.getName());
            tvPhone.setText(address.getPhone());
            tvDetail.setText(address.getAddress());

            if (address.isDefault()) {
                tvDefaultBadge.setVisibility(View.VISIBLE);
                btnSetDefault.setVisibility(View.GONE);
            } else {
                tvDefaultBadge.setVisibility(View.GONE);
                btnSetDefault.setVisibility(View.VISIBLE);
            }

            btnEdit.setOnClickListener(v -> showAddressForm(address));
            btnDelete.setOnClickListener(v -> deleteAddress(address));
            btnSetDefault.setOnClickListener(v -> setDefaultAddress(address));

            addressContainer.addView(itemView);
        }
    }

    private void showAddressForm(UserAddress existingAddress) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_address_form, null);
        TextInputEditText etName = dialogView.findViewById(R.id.etAddressName);
        TextInputEditText etPhone = dialogView.findViewById(R.id.etAddressPhone);
        TextInputEditText etAddress = dialogView.findViewById(R.id.etAddressDetail);

        Spinner spinnerProvince = dialogView.findViewById(R.id.spinnerProvince);
        Spinner spinnerDistrict = dialogView.findViewById(R.id.spinnerDistrict);
        Spinner spinnerWard = dialogView.findViewById(R.id.spinnerWard);

        ArrayAdapter<GHNLocationHelper.Province> provinceAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
        provinceAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerProvince.setAdapter(provinceAdapter);

        ArrayAdapter<GHNLocationHelper.District> districtAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
        districtAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDistrict.setAdapter(districtAdapter);

        ArrayAdapter<GHNLocationHelper.Ward> wardAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
        wardAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
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

        spinnerProvince.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                GHNLocationHelper.Province p = provinceAdapter.getItem(position);
                if (p != null) {
                    GHNLocationHelper.getDistricts(p.id, new GHNLocationHelper.LocationCallback<GHNLocationHelper.District>() {
                        @Override
                        public void onSuccess(List<GHNLocationHelper.District> items) {
                            districtAdapter.clear();
                            districtAdapter.addAll(items);
                            wardAdapter.clear();
                            tempDistrictId = -1;
                            tempWardCode = "";
                        }
                        @Override
                        public void onFailure(String error) { showMessage(error); }
                    });
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        spinnerDistrict.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                GHNLocationHelper.District d = districtAdapter.getItem(position);
                if (d != null) {
                    tempDistrictId = d.id;
                    GHNLocationHelper.getWards(d.id, new GHNLocationHelper.LocationCallback<GHNLocationHelper.Ward>() {
                        @Override
                        public void onSuccess(List<GHNLocationHelper.Ward> items) {
                            wardAdapter.clear();
                            wardAdapter.addAll(items);
                            tempWardCode = "";
                        }
                        @Override
                        public void onFailure(String error) { showMessage(error); }
                    });
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        spinnerWard.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                GHNLocationHelper.Ward w = wardAdapter.getItem(position);
                if (w != null) {
                    tempWardCode = w.code;
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        if (existingAddress != null) {
            etName.setText(existingAddress.getName());
            etPhone.setText(existingAddress.getPhone());
            String existingAddrText = existingAddress.getAddress();
            if (existingAddrText != null && existingAddrText.contains(", ")) {
                 String[] parts = existingAddrText.split(", ");
                 etAddress.setText(parts[0]);
            } else {
                 etAddress.setText(existingAddress.getAddress());
            }
            tempDistrictId = existingAddress.getDistrictId();
            tempWardCode = existingAddress.getWardCode();
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
                    if (tempDistrictId == -1 || tempWardCode.isEmpty()) {
                        showMessage("Vui lòng chọn Tỉnh/Huyện/Xã");
                        return;
                    }

                    String fullAddress = addressText;
                    if (spinnerWard.getSelectedItem() != null && spinnerDistrict.getSelectedItem() != null && spinnerProvince.getSelectedItem() != null) {
                         fullAddress = addressText + ", " + spinnerWard.getSelectedItem().toString() + ", " + spinnerDistrict.getSelectedItem().toString() + ", " + spinnerProvince.getSelectedItem().toString();
                    }

                    UserAddress address = existingAddress != null ? existingAddress : new UserAddress();
                    address.setType("address");
                    address.setLabel("Địa chỉ");
                    address.setName(name);
                    address.setPhone(phone);
                    address.setAddress(fullAddress);
                    address.setDistrictId(tempDistrictId);
                    address.setWardCode(tempWardCode);

                    if (existingAddress == null && addressesList.isEmpty()) {
                        address.setDefault(true);
                    }

                    FirestoreHelper.saveAddress(address, new FirestoreHelper.SimpleCallback() {
                        @Override
                        public void onSuccess() {
                            showMessage("Lưu địa chỉ thành công");
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

    private void deleteAddress(UserAddress address) {
        if (address.isDefault()) {
            showMessage("Không thể xóa địa chỉ mặc định");
            return;
        }
        FirestoreHelper.deleteAddress(address.getId(), new FirestoreHelper.SimpleCallback() {
            @Override
            public void onSuccess() {
                showMessage("Xóa địa chỉ thành công");
                loadAddresses();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Xóa địa chỉ thất bại: " + error);
            }
        });
    }

    private void setDefaultAddress(UserAddress targetAddress) {
        // Clear other defaults
        for (UserAddress addr : addressesList) {
            if (addr.isDefault() && !addr.getId().equals(targetAddress.getId())) {
                addr.setDefault(false);
                FirestoreHelper.saveAddress(addr, new FirestoreHelper.SimpleCallback() {
                    @Override public void onSuccess() {}
                    @Override public void onFailure(String err) {}
                });
            }
        }

        // Set target default
        targetAddress.setDefault(true);
        FirestoreHelper.saveAddress(targetAddress, new FirestoreHelper.SimpleCallback() {
            @Override
            public void onSuccess() {
                showMessage("Đã đặt địa chỉ này làm mặc định");
                loadAddresses();
            }

            @Override
            public void onFailure(String error) {
                showMessage("Cập nhật địa chỉ thất bại: " + error);
            }
        });
    }

    private void showMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
